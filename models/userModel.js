/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Pleqse tell us your name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'A user must have an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  password: {
    type: String,
    minLength: [8, 'Password must be at least 8 characters long'],
    required: [true, 'A user must have a password'],
    select: false, // This will not return the password in queries
  },
  confirmPassword: {
    type: String,
    minLength: [8, 'Password must be at least 8 characters long'],
    required: [true, 'A user must confim have a password'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.index({ email: 1, passwordResetToken: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }

  this.passwordChangedAt = Date.now() - 1000; // Set passwordChangedAt to current time minus 1 second
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({
    active: {
      $ne: false,
    },
  });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return JWTTimeStamp < changedTimeStamp;
  }

  return false; // Password not changed
};

userSchema.methods.createResetToken = function () {
  // Generate a random string for the reset Token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash the reset token and save it to DB
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set the expiration time for the reset Token
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log(`Reset token ${resetToken} hashed to ${this.passwordResetToken}`);

  return resetToken;
};

const User = mongoose.model('users', userSchema);

// Middleware to hash password before saving

module.exports = User;
