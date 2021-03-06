const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

/**
 * Muller Filter
 * To only filter out files that you want, in this case in the mime field it will say what content the file is, and in this case we want only images, so we can test for image at the beginning of the string of the mim attr
 *
 * If not we can pass an error to it to say that the file is not an image
 */
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  console.log(req.files);

  if (!req.files.imageCover || !req.files.images) return next();

  // 1) imageCover
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      req.body.images.push(`tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`);
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.images[i]}`);
    })
  );

  console.log(req.body);
  next();
});

/**
 * ERROR HANDLING MOVED TO utils?catchAsync.js
 *
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

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please specify a latitude and a longitude in the format lat,lng',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
        spherical: true,
      },
    },

    {
      $project: { distance: 1, name: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      distances,
    },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  // /tours-within/:distance/center/:latlng/unit/:unit
  // latlng: 34.156172,-118.137908

  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please specify a latitude and a longitude in the format lat,lng',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

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

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   /**
//    * The req.query attribute holds an object of a query passed via a URL
//    *  - /api/v1/tours?duration=5&difficulty=easy
//    *
//    * The query being "?duration=5&difficulty=easy" in the path
//    *
//    * The returned object being:
//    *  - { duration: '5', difficulty: 'easy'}
//    *
//    * With this, Express allows us to really easily extract the key-value contents from a query (filter) in a URL path
//    *
//    * FILTERING
//    * There are 2 ways of going about this
//    *  1. MongoDB filtering object
//    *    Model.find( {_id: 15255...} )
//    *  2. Mongoose Query Object chaining methods
//    *    Model.find().where(key).equals(value).where()
//    *
//    * MongoDB Filtering Object
//    * This will return all tour documents within the collection that has a duration of 5 and a difficulty of easy
//    * Tour.find({ duration: 5, difficulty: "easy" })
//    *
//    * Mongoose Query Object
//    * The exact same filter as the one above, but using Mongoose Driver code instead
//    * Tour.find().where("duration").equals(5).where("difficulty").equals("easy")
//    *
//    * QUERY
//    * The query object in Mongoose is not a promise but rather implements the promise interface of thenable and catchable
//    *
//    * When we use the find() method it returns a query object which we can use methods from its prototype to get filtering done
//    *
//    * For use to complex querying like sorting, limiting, pagination etc..., we must do them before we actually await the query object
//    *
//    * WHY?
//    * When you use the await operator on a Query object, it will execute the query itself, thus not allowing us to run any chain methods on it - ultimately not being able to sort the query
//    */
//   // console.log(req.query);

//   // find() returns an array of JS converted objects
//   // using MongoDB method, because req.query returns a object of key-value pairs

//   /* BUILD QUERY */
//   // FILTERING

//   // if (process.env.NODE_ENV === 'development') {
//   //   query = Tour.find(JSON.parse(queryStr), { __v: 0 });
//   // } else if (process.env.NODE_ENV === 'production') {
//   //   query = Tour.find(JSON.parse(queryStr), { __v: 0, _id: 0 });
//   // }

//   /**
//    * HOW TO ADVANCE FILTER (SORT, LIMIT, FIELDS, PAGINATION)
//    * At the top, we looped over the excludeFields array, and deleted the key-value pairs that matched the values in excludeFields, this was because we wanted to target these fields individually.
//    *
//    * HOW TO DO IT?
//    * We are simply doing basic if-else blocks that see if the key page or field or sort or pagination we passed in the original query
//    *  - on req.query[.field]
//    *
//    * IF SO
//    * Mongoose actually likes to work with a string that has each search value delimited with a space, so we always want to split the string into an array using (.split(',') on the string) with its delimited value as a comma
//    *
//    * Then join the array back into a String with a space between each keyword (.join(' '))
//    *
//    * Then we pass that searchObject into query = query[.sort/select/] -> each of these method returns the Query Object back with the filtered (refined) values from the search
//    */

//   // MOVED TO APIFeatures
//   // SORTING

//   // FIELD LIMITING (PROJECTION - SAME AS SELECT IN SQL)

//   // PAGINATION

//   // EXECUTE QUERY
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;

//   // SEND RESPONSE
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
// });

exports.getAllTours = factory.getAll(Tour);

/**
 * To specify a variable - so a unique identifier for the URL parameter - so in this case there are different tours and to identify a tour we assign a unique identifier to it - thus in the URL we can do so by using the the colon (:) followed by the variable name - so we used the variable name id, can be var or x or anything -> :id
 *
 * We can have multiple identifiers we simply need to separate them with forward slashes then a unique variable name /api/v1/tours/:id/:var/:x etc
 *
 * We can specify optical parameters we place a question mark (?) at the end of the variable name so /api/v1/tours/:id? would mean that the tour id is optional now
 */

// exports.getTour = catchAsync(async (req, res, next) => {
//   /**
//    * We use req.params to return specific parts of the URL - and in this case we have a named variable within the the resource that we have created - so we simply call req.params then access the id property to get back the ID from the end-user path
//    */
//   // Tour.findOne({ _id: req.params.id })
//   const tour = await Tour.findById(req.params.id).populate('reviews');

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     results: tour.length,
//     data: {
//       tour,
//     },
//   });
// });

exports.getTour = factory.getOne(Tour, { populate: { path: 'reviews' } });

// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     message: 'New Tour Created',
//     data: {
//       tour: newTour,
//     },
//   });
// });

exports.createTour = factory.createOne(Tour);

/**
 * UPDATE VALIDATOR OPTIONS
 *  - new: true: will return the updated document instead of the old one
 *  - runValidators: true: will run the validators again before updating
 */

// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     message: 'Tour Updated',
//     data: {
//       tour,
//     },
//   });
// });

exports.updateTour = factory.updateOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     message: 'Tour Deleted',
//     data: null,
//   });
// });

exports.deleteTour = factory.deleteOne(Tour);

/**
 * AGGREGATION PIPELINE (SQL GROUPING)
 * This pipeline allows us compute say a series of documents and return 1 result back.
 *
 * This is pretty much the same in SQL where we group data together, so with this pipeline we can say get the average salary or age etc.. from a collection (TABLE) by processing each document (ROW) and only looking at those documents that meet our criteria
 *
 * HOW TO AGGREGATE
 * We specify the collection we looking to group documents, and call the aggregate function on it, this function accepts an array of aggregate objects (can be found on MongoDB Manual Reference on Aggregation pipeline)
 * 
 * In pretty much of all of Mongo and Mongoose, we normally will await the result from the method call
 * 
 * .aggregate([]) will want to return a Aggregate Object, so we must when calling it await it
 *
 * db.<collection>.aggregate([])
 *  - await Tour.aggregate([])
 *
 * AGGREGATE PIPELINE - HOW IT WORKS
 * Just like the request-response cycle, the aggregation pipeline will pass a user request down through the aggregation pipeline - one after the other - refining and cutting down the number of results that are returned back - till the pipeline finally gets its results and will essentially return the value that we have asked for (so MIN, MAX, AVG etc.. on quantifiable fields within a document (record))
 *
 * AGGREGATE OBJECT - HOW TO DO IT
 * Within the array, is where we place the aggregate objects, which will process each request through its query
 * 
 * They are simply queries or filters that we did when reading or updating a document.
 * 
 * SYNTAX
 * We must enclose the aggregate around a set of curly braces and use one of the many aggregate objects that are predefined in MongoDB, just like the filter, we then have the value set to an object which we do the filtering - so to cut down or filter the documents that we want to actually group by
 *  - {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
 *
 * FIELDS
 * When we want to refer to a field we wrote in the schema, we must enclose the file name with single quotes and prepend its name with a dollar sign ($), that is how the aggregation pipeline does it
 *
 * MATCH (SQL SELECT)
 * The document that we want to group essentially are first passed through the match object
 * 
 * Just like a filter, we want the documents that are relaxant to the filter that we want
 *  - {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
 *
 *
 * GROUP (SQL GROUPBY)
 * This will group the documents together by the matching done up at the top and the _id passed - if you only want the documents to be done by the match done before, then set the _id: null
 * 
 * If you want to group by a particular _id, for example your pre-written id followed by Mongo's id, you can do so _id: '$cust_id'
 * 
 * If you want to group by to a particular field - then you simple pass in the '$<field_name> and Mongo will group all the results on that field
 * 
 * EXAMPLE
 * We want the the minimum, maximum and average price in all the three difficulties (easy, medium and hard)
 * 
 * SOLUTION
 * We group the data based on the difficulty 
 *  - _id: '$difficulty'
 * 
 * And pass in the aggregate objects for the min, max and avg for the price fields, and that's it
 * 
 * 
 * So here we can pass in the GROUPING functions to this (MIN, MAX, AVG etc..)
 * 
 * USING GROUPING FUNCTIONS
 * we define the filed name as the key, and its value will be equal to one of the pre-defined MongoDB aggregation functions (GROUPING FUNCTIONS in this case) and its value should be equal to a field that we want to process - it is written in single quotes and its prepended with a dollar sign ($) then the field name
 * 
 *  - $group: {
          _id: null,
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
        },
 *
 * This line of code is quite special, the aggregation pipeline will actually add 1 for every document being passed through the pipeline - this is actually getting the sum of the number of documents within the collection
 *  - numTours: { $sum: 1 },
 * 
 * SORT
 * If we want to sort the returned data, we then use the $sort aggregate object, and the filed names you wish to sort on, are the filed names that were defined in the $group aggregate - not the field names in the schema - because the returned data can be seen as a new collection of sorts (not really, but it is easier to explain it this way - just like in SQL does)
 * 
 * The value you set equal to can be 1, -1
 *  - 1 - ASC
 *  - -1 - DESC
 * 
 *  - $sort: { avgPrice: 1 },
 * 
 * MULTIPLE OPERATORS
 * We can use the same aggregate object again multiple times within the aggregate pipeline, so we can $match at the top and at the end - to say we want to exclude a piece of data from final output for example
 * 
 * $push
 * This operator acts as an array, so it will push the value (the field specified to the array)
 *  - tours: { $push: '$name' },
 * 
 * $addFields
 * Allows us to add fields to the final output of the pipeline - the key is the new field name, and the value can be an existing field
 *  - $addFields: { month: '$_id' },
 * 
 * $project
 * This allows to hide ot show fields in the final output
 *  - 1: show
 *  - 0: hide
 * 
 *  - $project: {
          _id: 0,
        },
 *
 * $limit
 * Just like the filter queries, it will limit the number of documents that are shown in the final output
 *  - $limit: 6,
 * 
 * $geoNear
 * This aggregation is always for geoSpatial data, and it must always be first in the aggregation pipeline
 * 
 * 2 fields that are mandatory are near and distanceField 
 * near will be set up just like we did for the startLocation it takes a type and a set of coordinates
 * 
 * the distanceField will output the aggregated data with that field name
 * 
 * [
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distances',
      },
    },
  ]
 * 
 * 
 * 
 */
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $min: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'easy' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    message: 'Stats returned',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = Number(req.params.year); // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    // {
    //   $limit: 6,
    // },
  ]);

  res.status(200).json({
    status: 'success',
    message: 'Stats returned',
    data: {
      plan,
    },
  });
});
