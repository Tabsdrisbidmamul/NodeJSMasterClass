const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1. Get Tour data from Collection
  const tours = await Tour.find();

  // 2. Build Template
  // 3. Render that template using data from 1.
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //1. Get Tour data including reviews and tour guides
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  // 2. Build Template
  // 3. Render Template using the data
  res.status(200).render('tour', {
    title: 'The Forest Hiker Tour',
    tour,
  });
});
