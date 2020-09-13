const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    maxlength: [30, 'You cannot enter more than 30 characters for a username'],
    minlength: [5, 'You must enter more than 10 characters for a username'],
  },

  email: {
    type: String,
    required: [true, 'A user must have an email'],
    maxlength: [50, 'The email entered is too long'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Your email is not valid'],
  },

  photo: {
    type: String,
    default: 'img/users/default.jpg',
  },

  password: {
    type: String,
    required: [true, 'You must supply a password'],
    minlength: [5, 'A password must be longer than 5 characters'],
    validate: [
      function (val) {
        const regex = RegExp('^[-\\w@!$£%^&*+]+$');
        return regex.test(val);
      },
      'Non-special characters are not allowed, please use a mix of letters and numbers',
    ],
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    minlength: [8, 'A password must be longer than 8 characters'],
    validate: [
      function (val) {
        return val === this.password;
      },
      'Your password does not match the one you entered',
    ],
    select: false,
  },

  // Field is only given to a user when they have changed their password, if not this field will not exist in the user document
  passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
  // Only run when password was modified
  if (!this.isModified('password')) return next();

  // hash and salt password with cost of 12
  this.password = await bcryptjs.hash(this.password, 12);

  // delete password confirm field
  this.passwordConfirm = undefined;

  next();
});

/**
 * INSTANCE METHODS
 * Like Java static methods, these methods are available to all documents in the schema, allowing us to essentially write utility or helper functions that should only act within the schema data and help us the programmer to answer questions about user input:
 *
 * EXAMPLE
 * Logging in:
 *  - IS the inputted password the same as the user password?
 *
 *
 */

userSchema.methods.correctPassword = async function (
  inputPassword,
  userPassword
) {
  return await bcryptjs.compare(inputPassword, userPassword);
};

userSchema.methods.modifiedPassword = async function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    console.log(this.passwordChangedAt, JWTTimestamp);
  }
  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
