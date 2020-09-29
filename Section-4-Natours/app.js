const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// GLOBAL MIDDLEWARES

// SET Security HTTP headers
app.use(helmet());

// dev logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit number of requests from the same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

// body parser, reading data from body into req.body
// middleware that sits in the middle of req(uests) and res(ponse) - we do this to get access to the body of a HTTP request
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injections
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Protect against request parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize, ',
      'difficulty',
      'price',
    ],
  })
);

/**
 * We can use express to serve up static files from the file structure, its is a middleware function, and we use the built-in function express.static(pathNameToStaticFiles)
 *
 * pathNameToStaticFiles:= is simply where the files live - in express development these are in the "public" folder, and writ the path like so
 *
 *   - `${__dirname}/public`
 *
 * HOW TO USE
 * In the Browser we give the standard localhost address, and top get the static files, we simply place a forward slash (/) then the static file name -
 *  - http://127.0.0.1:3000/overview.html
 *
 * If the file is in sub-folder, we write the path to access the file within the sub-folder
 *  - http://127.0.0.1:3000/img/pin.png
 *
 * WHY DOES IT WORK
 * Express assumes that anything after the / and that the path is a location to a static file (has a file extension) then Express will serve the up the file, however if not, then it will go through the usual route handlers
 */

// Serving static files
app.use(express.static(`${__dirname}/public`));

/**
 * To make our own middleware, we use app.use() and pass in a function which has access to three parameters -> req, res and next.
 *
 * NOTE: ALWAYS CALL next() AT THE END OF THE CODE
 *
 * We can compute almost anything with the request from the client, but within each middleware function we must always end the body with the call next() or else the middleware will be stuck in this spot and not move onto the next middleware function in the middleware stack.
 */

/**
 * MIDDLEWARE
 * Middleware are functions that are applied to each response from the client - so that we can either compute results with it before sending off the request - which is very vital to gathering data, error handling, placing data into the DB etc...
 *
 * Every request will go through the middleware stack - unless we provide a path - then only when that path is accessed is then that middleware is ran - so our routing manager is middleware
 *
 * Generic middleware (ones without paths) are ran always, and when a user access a path - the generic middleware is ran then the specific URL path  middleware is ran then
 *
 * ORDER OF MIDDLEWARE
 * We always place the middleware that ends the request-response cycle (usually the routing) at the end, and generic or computing middleware at the top of the code
 */
// app.use((req, res, next) => {
//   console.log('Hello from the middleware!');
//   next();
// });

// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   console.log(req.headers);
//   next();
// });

/**
 * Routes
 *
 * route(): allows us to pass in a common path but has different request methods attached to it, so in this case we are wanting refactor
 * app.get('/api/v1/tours', getAllTours);
 * app.post('/api/v1/tours', createTour);
 *
 * app.get('/api/v1/tours/:id', getTour);
 * app.patch('/api/v1/tours/:id', updateTour);
 * app.delete('/api/v1/tours/:id', deleteTour);
 *
 * to essentially one line, route() allows us to do so, with chaining method calls
 *
 * When we pass in a path to route, we then have access to all CRUD operations, so get, post, patch, delete etc...
 *
 * calling get() on app.route() is exactly the same as calling app.get(), but the difference is that we have already provided a path, so all get() really needs is a callback function to call
 *
 * get() then returns the object in question, allowing us to chain other HTTP request methods on it, like post on the same path
 */

/**
 * MOUNTING
 * This is a method to further collate common URL paths together into a parent root, then we can define specific routes from the parent path to children paths.
 *
 * So our case our parent path is /api/v1/tours
 *
 * We then have use the express.Router() it parses incoming requests - so in this case we use the app.route() to determine the path was given - so for our children paths we have 2 possibilities
 *
 *   - / (this will translate to /api/v1/tours)
 *   - /:id (this will translate to /api/v1/tours/:id)
 *
 * We have in turn split apart the common parts of the routes, and made it so that they inherit this parent root path - and the children paths can be more unique to have unique features to it
 *
 * HOW TO CODE IT
 * We use the
 *   - app.use(path, Router Object)
 *
 * Passing in the path we want as the parent path, and the express.Router() function which allows us to parse the URLs into sub-segments
 *
 * ROUTER OBJECT
 * Instantiate the Router object
 * const resourceRouter = express.Router();
 *
 * ROUTING
 * instead of app.route() like we used before, we use the Router Object
 *
 *   BEFORE
 *   - app.route()
 *
 *   AFTER
 *   - resourceRouter.router(path).HTTPMethods(Callback functions)
 *
 * PATH
 * The path for the Routers should be sub-segments so before we have
 *   - /api/v1/tours/:id
 *
 * can be written to
 *   - /:id
 *
 * WHY
 * the "/" refers to the parent root path which is the
 *   - api/v1/tours
 *
 * so by adding "/" we are getting the root path back and we can add further resource names to the path
 *
 */

// Router

// Middleware call for Router (MOUNTING)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

/**
 * ERROR HANDLING UNHANDLED ROUTES
 * The routes we have defined are static - and a mix of dynamic here and there
 * But we have no middleware that will handle routes that we have not defined (routes that the end-user can simply type whatever they want after the initial forward slash of our domain name ('/'))
 *
 *  - /api/tours/
 *
 * Express has a default error handler that will serve back HTML to say that the resource was not found - for this route
 *
 * As this project is an API we want to be sending back JSON at all times, so we can write some middleware that will handle the unhandled routes
 *
 * MIDDLEWARE STACK - ORDER MATTERS
 * As mentioned in the middleware explanation - the order of where the middlewares are defined matters, the unhandled route handler middleware must be placed at the end of the middleware stack that we wrote
 *
 * WHY?
 *  1. Express will pass this route down the middleware stack
 *
 * 2. If the route handlers that we wrote did not do anything with the request (i.e finish the request-response cycle), then we have a bad route in our hands
 *
 *  3. That means that the bad route has passed down to the very bottom of the stack - and it is where precisely an unhandled route middleware should be to take care of the bad route
 *
 * 4. If we placed our unhandled route middleware at the top of the stack, then the API will simply not work - because the unhandled route middleware will just finish off the request-response cycle at every request.
 *
 * app.all()
 * We unhandled route middleware to handle all the HTTP methods, and writing the same middleware for different HTTP methods is not good (repeated code), that's where the .all() method comes in - where it essentially combines all the HTTP methods together and handles them all at the same time
 *
 * Just like normal, we write the middleware as if we did for any other response
 *
 */

// UNHANDLED ROUTE ERROR MIDDLEWARE
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 400));
});

/**
 * GLOBAL ERROR HANDLER
 * There are 2 types of errors that we can have
 *  - operational errors
 *  - programming errors
 *
 * OPERATIONAL ERRORS
 * These are problems that we can predict that will happen when running the application - so we just have to handle them in advanced
 *  - invalid path accessed
 *  - invalid user input
 *  - failed to connect to the server
 *  - failed to connect to the DB
 *  - ...
 *
 * PROGRAMMING ERRORS
 * These are errors that we as developers introduce into the code
 *  - reading properties of undefined variables
 *  - parsing a number on where an object is expected
 *  - using await without async
 *  - ...
 *
 * In Express we want to have all the errors be passed down to a
 *  - 'Global Error Handler Middleware'
 *
 * So essentially we have one centralized place where all exceptions will be passed down to, and the handler will decide what to do with it
 *
 *
 *
 */

// GLOBAL ERROR HANDLER MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
