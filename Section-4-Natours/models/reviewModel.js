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

reviewSchema.pre(/^find/i, function (next) {
  this.populate({
    path: 'Tour User',
    select: '-__v -passwordChangedAt',
  });
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
