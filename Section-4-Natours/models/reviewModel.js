const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review can not be empty'],
    },

    rating: {
      type: Number,
      default: 5,
      min: [0, 'rating cannot be lower than 0'],
      max: [5, 'rating cannot be greater than 5'],
      required: [true, 'A review must have a rating'],
    },

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },

    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a Tour'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a User'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  }).populate({
    path: 'tour',
    select: 'name',
  });

  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
