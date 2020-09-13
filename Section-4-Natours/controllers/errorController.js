const AppError = require('../utils/appError');

/**
 * ERROR HANDLING MIDDLEWARE
 * In Express it is really easy to set this up
 * We need to pass in 4 parameters in the parameter list to basically tell Express this middleware is for error handling
 *
 * Just like all error handlers in Express, this function is error first - meaning the error is the first argument to the argument list
 *  - error (err)
 *  - request (req)
 *  - response (res)
 *  - next
 *
 * next(err)
 * This applies to every single next() function that exists for middlewares in Express or mongoose
 *
 * When the next() function receives an argument - it will automatically assume what was passed was an Error object. It will then skip every single middleware in the stack and go straight down to the end of the stack where the Global Error Handler Middleware exists
 *
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = Object.values(err.keyValue)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;

  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const handleJWTToken = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTTokenExpired = () =>
  new AppError('Token has expired! Please log in again!', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational error that we trust: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or unknown error: don't want to leak error details
  } else {
    // 1) log error
    console.error('Error', err);

    // 2) Send generated message
    res.status(500).json({
      status: 'Error',
      message: 'Something went very wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTToken();
    if (error.name === 'TokenExpiredError') error = handleJWTTokenExpired();

    sendErrorProd(error, res);
  }
};
