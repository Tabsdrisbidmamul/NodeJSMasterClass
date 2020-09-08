/**
 *
 * ERROR HANDLING THE ASYNC FUNCTIONS
 * In our Express app, we have a controllers use a try-catch block to handle the async-await features to get DB results
 *
 * However the majority of the code is repeated, and what we really want is the handler to only be doing what is designed to do - and not bother with error handling (that's the job for our Global Error Handler Middleware)
 *
 * WHAT WE WANT
 *  - We want to basically get rid of the try-catch block and just have the handler code
 *
 *  - Errors are passed down to the Global Error Handler Middleware
 *
 * HOW TO DO IT
 * We know that are handlers are async functions, and these async functions return Promises, so we can use the catch() method it to handle those errors that occur within the handler segment code
 *  - const catchAsync = fn => fn(req, res, next).catch(next);
 *
 * PROBLEM
 * The problem now is that we actually calling the handler function directly from catchAsync now - and that is not what we want, the handlers should be functions and not have any values associated to them
 *
 * We also want to pass in err Object into next() (skip the middleware stack for any errors occurring) with the error as the argument, and the only way to do that is with closures
 *
 * Closures: They are functions that essentially remember the values from the outer function - in this case the req, res and next objects (which we need)
 *
 * So we wrap our example
 *  - fn(req, res, next).catch(next);
 *
 * around another function
 *  - const catchAsync = (fn) => {
        return (req, res, next) => {
          fn(req, res, next).catch(next);
        };
      };
 * 
 * Not only have we have fixed the problem where a value was returned and a not a function, but we also have made it into a function that we can always call
 * 
 * SUMMARY
 * catchAsync: 
 *  - Allows us to deal with the try-catch block mess where code was repeated
 *  - Allows us to handle errors within the async function by utilizing its Promises
 *  - We use .catch() method to handle those errors
 *  - This method will return a function that Express will be able to call
 * 
 * ERROR OBJECT
 * The Error object in this case will actually come back usually from Mongoose (MongoDB), because when accessing the DB we added a series of validators to the Schema and return the appropriate error message back - where the Error object has this property defined as the message we set in Mongo
 * 
 */
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
