const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const User = require('../models/userModels');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

// Easy command line script to generate secret key for the JWT signature
// node -e "console.log(require('crypto').randomBytes(64).toString('hex'));"

const generateJWT = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendJWT = (user, statusCode, res) => {
  const token = generateJWT(user._id);

  const cookerOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookerOptions.secure = true;

  /**
   * COOKIE
   * the name of the cookie, its value and options (expires, secure etc..)
   */
  res.cookie('jwt', token, cookerOptions);

  // remove password from output
  user.password = undefined;

  if (statusCode === 201) {
    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } else {
    res.status(statusCode).json({
      status: 'success',
      token,
    });
  }
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  createSendJWT(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password are not null
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password +active');

  if (
    !user ||
    !(await user.correctPassword(password, user.password)) ||
    !user.active
  ) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  createSendJWT(user, 200, res);
});

// only for rendered pages, no errors!
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  // 1) Get token and check if it exists
  if (req.cookies.jwt) {
    const token = req.cookies.jwt;

    // 1) VERIFY: validate token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 2) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }

    // 3) Check if user changed password after JWT token  was issued
    if (currentUser.modifiedPassword(decoded.iat)) {
      return next();
    }

    // THERE IS A LOGGED IN USER
    /**
     * ONLY FOR PUG TEMPLATES
     * In the response we can access the locals attribute - locals are variables in pug templates, and in each and everyone one of pug templates, they will have access to a variable called user which is the currentUser
     *
     * This is the exact same thinking for when we req.user = currentUser, but rather in NodeJS where we can use it after every protect, we use res.locals.user in the website for every request there is
     */
    res.locals.user = currentUser;
    return next();
  }
  next();
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token and check if it exists
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
      new AppError('You are not logged in! Please log in to get access', 401)
    );
  }

  // 2) VERIFY: validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to the token no longer exists', 401)
    );
  }

  // 4) Check if user changed password after JWT token  was issued
  if (currentUser.modifiedPassword(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser; // add attribute user to the request object to be used in the next middleware function
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }

  // 2) Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to the user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a request with your new password and passwordConfirm to ${resetURL}.\nIf you didn't  forget your password, please ignore your email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password rest token (valid for 10 mins)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Updated changedPasswordAt property for the user

  // 4) Log the user in, send new JWT
  createSendJWT(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const currentUser = await User.findById(req.user._id).select('+password');

  // 2) Check if POSTed current password is correct
  if (
    !(await currentUser.correctPassword(
      req.body.oldPassword,
      currentUser.password
    ))
  ) {
    return next(new AppError('Password is incorrect', 403));
  }

  // 3) If so, update password
  if (
    !req.body.newPassword ||
    !req.body.newPasswordConfirm ||
    req.body.oldPassword === req.body.newPassword ||
    req.body.oldPassword === req.body.newPasswordConfirm
  ) {
    return next(
      new AppError('Please enter a new password (not the old one)'),
      400
    );
  }
  currentUser.password = req.body.newPassword;
  currentUser.passwordConfirm = req.body.newPasswordConfirm;
  await currentUser.save();

  // 4) Log user in, send JWT
  createSendJWT(currentUser, 200, res);
});
