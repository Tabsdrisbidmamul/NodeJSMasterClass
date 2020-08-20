const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();

// MIDDLEWARES
app.use(morgan('dev'));

// middleware that sits in the middle of req(uests) and res(ponse) - we do this to get access to the body of a HTTP request
app.use(express.json());

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
app.use((req, res, next) => {
  console.log('Hello from the middleware!');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// Route Callbacks
const getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  });
};

// ROUTING HANDLERS

/**
 * To specify a variable - so a unique identifier for the URL parameter - so in this case there are different tours and to identify a tour we assign a unique identifier to it - thus in the URL we can do so by using the the colon (:) followed by the variable name - so we used the variable name id, can be var or x or anything -> :id
 *
 * We can have multiple identifiers we simply need to separate them with forward slashes then a unique variable name /api/v1/tours/:id/:var/:x etc
 *
 * We can specify optical parameters we place a question mark (?) at the end of the variable name so /api/v1/tours/:id? would mean that the tour id is optional now
 */

const getTour = (req, res) => {
  // console.log(req.params);

  /**
   * We use req.params to return specific parts of the URL - and in this case we have a named variable within the the resource that we have created - so we simply call req.params then access the id property to get back the ID from the end-user path
   */

  const id = Number(req.params.id);
  const tour = tours.find((t) => t.id === id);

  // id > tours.length
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tour,
    },
  });
};

const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        message: 'New Tour Created',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const updateTour = (req, res) => {
  const id = Number(req.params.id);
  const getTourIndex = tours.findIndex((t) => t.id === id);

  if (getTourIndex === -1) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  const updatedTour = Object.assign(tours[getTourIndex], req.body);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(200).json({
        status: 'success',
        message: 'Tour Updated',
        data: {
          tour: updatedTour,
        },
      });
    }
  );
};

const deleteTour = (req, res) => {
  const id = Number(req.params.id);
  const getTourIndex = tours.findIndex((t) => t.id === id);
  let tourToDelete;

  if (getTourIndex === -1) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  } else {
    tourToDelete = tours[getTourIndex];
    tours.splice(getTourIndex, 1);
  }

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(204).json({
        status: 'success',
        message: 'Tour Deleted',
        data: null,
      });
    }
  );
};

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

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
const tourRouter = express.Router();
const userRouter = express.Router();

tourRouter.route('/').get(getAllTours).post(createTour);
tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

userRouter.route('/').get(getAllUsers).post(createUser);
userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

// Middleware call for Router (MOUNTING)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// START SERVER

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
