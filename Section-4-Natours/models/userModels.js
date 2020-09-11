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

const User = mongoose.model('User', userSchema);
module.exports = User;
