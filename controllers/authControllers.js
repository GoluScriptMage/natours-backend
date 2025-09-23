// eslint-disable-next-line import/no-extraneous-dependencies
const JWT = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const { sendEmail } = require('../utils/email');

// eslint-disable-next-line arrow-body-style
const signToken = (id) => {
  return JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// eslint-disable-next-line arrow-body-style
const createSignToken = (res, statusCode, user, token) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRES * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  user.password = undefined; // Remove password from the response

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    message: 'Success',
    token,
    data: {
      user,
    },
  });
};

// To create new User
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role || 'user', // Default role is 'user' if not provided
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    photo: req.body.photo || 'default.jpg',
    passwordChangedAt: req.body.passwordChangedAt || Date.now(),
  });

  const token = signToken(newUser._id);

  return createSignToken(res, 201, newUser, token);
});

// Login the user
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if the email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password'), 404);
  }

  // 2) Check if the email and password are correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) if all things ok then login the user

  const token = signToken(user._id);
  return createSignToken(res, 200, user, token);
});

// First checking the user using jwt and after confiming it send back the user in req
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting the token from the user Header and check if it Exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }

  // 2) Verification of the token
  // const decoded = JWT.verify(token, process.env.JWT_SECRET);
  const decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET);

  // 3) Checking if the user still exists
  const currentuser = await User.findById(decoded.id);
  if (!currentuser) {
    return next(
      new AppError('The user Belonging to this token no longer exists', 401),
    );
  }

  //  4) check if the user changed the password after the token was issued
  if (currentuser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! please login again', 401),
    );
  }

  // grant access to the restricted route
  req.user = currentuser;

  next();
});

// First checking the user using jwt and after confiming it send back the user in req
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    // 1) Getting the token from the user Header and check if it Exist
    const decoded = await promisify(JWT.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET,
    );

    if (!decoded) {
      return next();
    }

    // 2) Checking if the user still exists
    const currentuser = await User.findById(decoded.id);
    if (!currentuser) {
      return next();
    }

    //  3) check if the user changed the password after the token was issued
    if (currentuser.changedPasswordAfter(decoded.iat)) {
      return next();
    }

    // grant access to the restricted route
    res.locals.user = currentuser;
    return next();
  }
  next();
});

// It restrict the user that do not have access for that specific task
// eslint-disable-next-line arrow-body-style
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403),
      );
    }

    next();
  };
};

// Send the reset token to the user email
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get the user Based on the email
  const user = await User.findOne({ email: req.body.email });

  // 2) Check if the email is exist if not send error
  if (!user) {
    return next(new AppError('No user found with this email', 404));
  }

  // 3) Create the reset token and save it to user
  const resetToken = user.createResetToken();
  await user.save({ validateBeforeSave: false }); // (validateBeforeSave: false) means skips the validations for this save
  console.log('Reset Token:', resetToken);

  // 4) Send the token to the user
  const resetURL = `${req.protocol}://${req.get('host')}/api.v1/users/resetPassword/${resetToken.trim()}`;
  const message = `Forgot your Password? Submit a PATCH request with the token: ${resetURL} \n If not forget the password then ignore this email.`;

  try {
    sendEmail({
      email: user.email,
      subject: 'Your password Reset token valid for (10 minutes)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token Sent to email successfully! Please check your email.',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500,
      ),
    );
  }
});

// check the reset token and uodate the password
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get the user based on the token
  const resetToken = req.params.token;

  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now(),
    },
  });

  // 2) Check if the user exists and token has not expired and set the new paswsword
  if (!user) {
    return next(new AppError('Token is inavlid or expired', 400));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // wants the validators to run to check the pass
  await user.save();

  // // 3) update the password changed property

  // // 4) lOG IN THE USER, send JWT
  const token = signToken(user._id);

  return createSignToken(res, 200, user, token);

  // next();
});

// Update the password of the current user
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get the user from the collection
  const user = await User.findById(req.user.id).select('+password');

  // Copilot log all the user pass and body pass
  console.log('User Password:', user.password);
  console.log('Body Password:', req.body.password);

  //  2) check if password is correctPassword
  if (
    !req.body.currentPassword ||
    !user.password ||
    !(await user.correctPassword(req.body.currentPassword, user.password))
  ) {
    return next(new AppError('Your current password is wrong', 401));
  }

  //  3) if so then update the paswsord
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  // 4) log in the user, send the JWT
  const token = signToken(user._id);

  return createSignToken(res, 201, user, token);
});
