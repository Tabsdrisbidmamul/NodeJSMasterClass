const fs = require('fs');
const express = require('express');

const app = express();

// middleware that sits in the middle of req(uests) and res(ponse) - we do this to get access to the body of a HTTP request
app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// Route Callbacks
const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

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
app.route('/api/v1/tours').get(getAllTours).post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
