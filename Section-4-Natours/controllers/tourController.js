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
exports.getAllTours = async (req, res) => {
  try {
    /**
     * The req.query attribute holds an object of a query passed via a URL
     *  - /api/v1/tours?duration=5&difficulty=easy
     *
     * The query being "?duration=5&difficulty=easy" in the path
     *
     * The returned object being:
     *  - { duration: '5', difficulty: 'easy'}
     *
     * With this, Express allows us to really easily extract the key-value contents from a query (filter) in a URL path
     *
     * FILTERING
     * There are 2 ways of going about this
     *  1. MongoDB filtering object
     *    Model.find( {_id: 15255...} )
     *  2. Mongoose Query Object chaining methods
     *    Model.find().where(key).equals(value).where()
     *
     * MongoDB Filtering Object
     * This will return all tour documents within the collection that has a duration of 5 and a difficulty of easy
     * Tour.find({ duration: 5, difficulty: "easy" })
     *
     * Mongoose Query Object
     * The exact same filter as the one above, but using Mongoose Driver code instead
     * Tour.find().where("duration").equals(5).where("difficulty").equals("easy")
     *
     * QUERY
     * The query object in Mongoose is not a promise but rather implements the promise interface of thenable and catchable
     *
     * When we use the find() method it returns a query object which we can use methods from its prototype to get filtering done
     *
     * For use to complex querying like sorting, limiting, pagination etc..., we must do them before we actually await the query object
     *
     * WHY?
     * When you use the await operator on a Query object, it will execute the query itself, thus not allowing us to run any chain methods on it - ultimately not being able to sort the query
     */
    // console.log(req.query);

    // find() returns an array of JS converted objects
    // using MongoDB method, because req.query returns a object of key-value pairs
    // BUILD QUERY
    const queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    const query = Tour.find(queryObj);

    // EXECUTE QUERY
    const tours = await query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'error',
      message: {
        errorMessage: err.message,
        error: err,
      },
    });
  }
};

/**
 * To specify a variable - so a unique identifier for the URL parameter - so in this case there are different tours and to identify a tour we assign a unique identifier to it - thus in the URL we can do so by using the the colon (:) followed by the variable name - so we used the variable name id, can be var or x or anything -> :id
 *
 * We can have multiple identifiers we simply need to separate them with forward slashes then a unique variable name /api/v1/tours/:id/:var/:x etc
 *
 * We can specify optical parameters we place a question mark (?) at the end of the variable name so /api/v1/tours/:id? would mean that the tour id is optional now
 */

exports.getTour = async (req, res) => {
  // console.log(req.params);

  /**
   * We use req.params to return specific parts of the URL - and in this case we have a named variable within the the resource that we have created - so we simply call req.params then access the id property to get back the ID from the end-user path
   */
  try {
    // Tour.findOne({ _id: req.params.id })
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      results: tour.length,
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'error',
      message: {
        errorMessage: err.message,
        error: err,
      },
    });
  }
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
      message: {
        errorMessage: err.message,
        error: err,
      },
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      message: 'Tour Updated',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: {
        errorMessage: err.message,
        error: err,
      },
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      message: 'Tour Deleted',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: {
        errorMessage: err.message,
        error: err,
      },
    });
  }
};
