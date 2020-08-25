const Tour = require('../models/tourModel');

/**
 * Error Handling using the Middleware stack
 *
 *  - In our route handlers for getTour, updateTour and deleteTour we have error handling for IDs that are out of bounds of the array
 *
 *  - The code for all three is the same, thus breaking the DRY principle
 *
 *  - Using the middleware stack, we can write a handler that sees the request before getting to the actual route handling, we can check if the ID is valid, and if so carry onto the next middleware (being the route handlers) but if the ID is not valid, then finish the request-response cycle here and return a 404 saying "Invalid ID"
 *
 *
 *
 */
/* exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);

  if (Number(req.params.id) > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  next();
}; */

/* exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
}; */

// ROUTING HANDLERS
exports.getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    // results: tours.length,
    // data: {
    //   tours,
    // },
  });
};

/**
 * To specify a variable - so a unique identifier for the URL parameter - so in this case there are different tours and to identify a tour we assign a unique identifier to it - thus in the URL we can do so by using the the colon (:) followed by the variable name - so we used the variable name id, can be var or x or anything -> :id
 *
 * We can have multiple identifiers we simply need to separate them with forward slashes then a unique variable name /api/v1/tours/:id/:var/:x etc
 *
 * We can specify optical parameters we place a question mark (?) at the end of the variable name so /api/v1/tours/:id? would mean that the tour id is optional now
 */

exports.getTour = (req, res) => {
  // console.log(req.params);

  /**
   * We use req.params to return specific parts of the URL - and in this case we have a named variable within the the resource that we have created - so we simply call req.params then access the id property to get back the ID from the end-user path
   */

  const id = Number(req.params.id);
  // const tour = tours.find((t) => t.id === id);

  res.status(200).json({
    status: 'success',
    // results: tours.length,
    // data: {
    //   tour,
    // },
  });
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({});
    // newTour.save()

    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      message: 'New Tour Created',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message,
    });
  }
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Tour Updated',
    // data: {
    //   tour: updatedTour,
    // },
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    message: 'Tour Deleted',
    data: null,
  });
};
