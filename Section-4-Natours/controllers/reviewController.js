const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.filter = (req, res, next) => {
  req.filter = {};
  if (req.params.tourId) req.filter = { tour: req.params.tourId };
  next();
};

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   const reviews = await Review.find(req.filter);

//   res.status(200).json({
//     status: 'success',
//     results: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });

exports.getAllReviews = factory.getAll(Review);

exports.setTourUserID = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

// exports.createReview = catchAsync(async (req, res, next) => {
//   const newReview = await Review.create(req.body);

//   res.status(200).json({
//     status: 'success',
//     message: 'Review created',
//     data: {
//       review: newReview,
//     },
//   });
// });

exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
