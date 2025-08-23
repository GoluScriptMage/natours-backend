const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { deleteOne, updateOne, getOne } = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateUserDetails = catchAsync(async (req, res, next) => {
  // 1) Check if the user trying to update pass and send error if they do
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError('This route is not defined for password Updates!', 400),
    );
  }

  //  2) After checking update the user name and email only
  const filteredObj = filterObj(req.body, 'name', 'email');

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObj, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'User details updated successfully!',
    data: {
      updatedUser,
    },
  });
});

exports.deleteCurrentuser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user.id,
    {
      active: false,
    },
    {
      new: true,
    },
  );

  res.status(204).json({
    status: 'success',
  });
});

exports.getAllUser = catchAsync(async (req, res) => {
  // This is a temporary solution to get all users
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

/// TO create a new User - admin only
// exports.createUser = createOne(User);

exports.getUser = getOne(User);

// Update user name only
exports.updateUser = updateOne(User);

// Delete User - admin only
exports.deleteUser = deleteOne(User);
