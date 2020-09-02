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
exports.aliasTopTours = (req, res, next) => {
  /**
   * ALIAS (PRE-FILLING)
   * This technique is to make a really long, complex or commonly used query and essentially relate it to an alias - so what the user has to press to search up is human-readable and not an amalgamation of queries that is hard to read
   *
   * Here we want to turn this query
   *  - limit=5&sort=-ratingsAverage,price&fields=name,price,ratingsAverage,summary,difficulty
   *
   * Into this
   *  - /top-5-cheap
   *
   * MIDDLEWARE ALIAS
   * What we actually do is to make a middleware that is ran before the actual router middleware runs - so this can be seen as a helper middleware that fills parts of the path (URL) by pre-filling or adding the necessary parts to the URL so when the router middleware is ran - it literally will be running a pre-filled URL that we wrote
   *
   */

  // limit=5&sort=-ratingsAverage,price&fields=name,price,ratingsAverage,summary,difficulty

  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString }; // make a deep-copy
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    // ADVANCED FILTERING - pagination, sorting, limiting and fields...
    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gte?|lte?)\b/g,
      (match) => `$${match}`
    );

    // FILTER ON ALL THE RESULTS RETRIEVED
    this.query.find(JSON.parse(queryStr));
    // let query = Tour.find(JSON.parse(queryStr));
  }
}

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

    /* BUILD QUERY */
    // FILTERING
    // const queryObj = { ...req.query }; // make a deep-copy
    // const excludeFields = ['page', 'sort', 'limit', 'fields'];
    // excludeFields.forEach((el) => delete queryObj[el]);

    // // ADVANCED FILTERING - pagination, sorting, limiting and fields...
    // const queryStr = JSON.stringify(queryObj).replace(
    //   /\b(gte?|lte?)\b/g,
    //   (match) => `$${match}`
    // );
    // // FILTER ON ALL THE RESULTS RETRIEVED

    // let query = Tour.find(JSON.parse(queryStr));
    // if (process.env.NODE_ENV === 'development') {
    //   query = Tour.find(JSON.parse(queryStr), { __v: 0 });
    // } else if (process.env.NODE_ENV === 'production') {
    //   query = Tour.find(JSON.parse(queryStr), { __v: 0, _id: 0 });
    // }

    /**
     * HOW TO ADVANCE FILTER (SORT, LIMIT, FIELDS, PAGINATION)
     * At the top, we looped over the excludeFields array, and deleted the key-value pairs that matched the values in excludeFields, this was because we wanted to target these fields individually.
     *
     * HOW TO DO IT?
     * We are simply doing basic if-else blocks that see if the key page or field or sort or pagination we passed in the original query
     *  - on req.query[.field]
     *
     * IF SO
     * Mongoose actually likes to work with a string that has each search value delimited with a space, so we always want to split the string into an array using (.split(',') on the string) with its delimited value as a comma
     *
     * Then join the array back into a String with a space between each keyword (.join(' '))
     *
     * Then we pass that searchObject into query = query[.sort/select/] -> each of these method returns the Query Object back with the filtered (refined) values from the search
     */

    // SORTING
    if (req.query.sort) {
      /**
       * SORTING
       * If we pass the query
       *  - sort=price
       * Mongoose will sort on set of results on the price attribute in ascending (ASC) order
       *
       * ASC ORDER
       * We pass in a positive value for the sort value
       *  - sort=price
       *
       * DESC ORDER
       * We pass in a negative value for the sort value
       * The price has a minus (-) in-front of it, telling mongoose this is to be sorted in DESC ORDER
       *  - sort=-price
       *
       *
       */
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // FIELD LIMITING (PROJECTION - SAME AS SELECT IN SQL)
    /**
     * + (PLUS) (DEFAULT)
     * Will include the fields listed within the projection
     *
     * - (MINUS)
     * Will exclude the stated fields from the results that will be displayed from running the query
     */
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      // fields = `${fields} -__v`;
      query = query.select(fields);
    } else {
      /**
       * The __v is used internally by Mongo, it is a not a good idea to remove it, rather hide it from the user by excluding it always from the search
       */
      query = query.select('-__v');
    }

    // PAGINATION
    /**
     * Pagination comes with selectors we need to work with
     *  - page: the page the user wants to retrieve
     *  - limit: how many results are retrieved, then be displayed in the UI
     *
     * In Mongoose we use skip() and limit() methods to do so
     *
     * limit()
     * The integer value passed, will tell Mongo to return x amount of results from the query
     *
     * skip()
     * This will move the pointer to the argument offset that is passed to the function, so MongoDB will always read from position 0, but if a user requests page 3, then we want results from 21-30 (assuming that the limit is 10), thus moving the pointer to offset 21 and read up to 30.
     *
     * ERROR HANDLING
     * We do some basic error handling where we check the page (skip pointer) entered is not greater than the results that we have
     *
     * We use the method countDocuments() where we can pass a query into it to count all the results that are found in that query
     *
     * countDocuments()
     * when nothing is passed it will count all the documents in the collection, that is not what we want, but rather a resultSet that is the same that we have at the moment, thus we pass in a queryString to solve that problem
     *
     */
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments(JSON.parse(queryStr));
      if (numTours <= skip) throw new Error('This page does not exist');
    }
    // EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query).filter();
    const tours = await features.query;

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
