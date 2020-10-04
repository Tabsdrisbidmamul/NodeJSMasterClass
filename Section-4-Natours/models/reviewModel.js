const mongoose = require('mongoose');
const Tour = require('./tourModel');

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

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'user',
  //   select: 'name photo',
  // }).populate({
  //   path: 'tour',
  //   select: 'name',
  // });

  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

/**
 * STATIC METHODS
 * Like in Java we can create Static methods on our schema, so we can call them without having an instance of the method - I would like to think that this method is assigned during compile time.
 *
 * THIS IN STATIC METHOD
 * the 'this' keyword will point to the current MODEL, so we can use aggregation etc.. on the model
 *
 * HOW TO AGGREGATE
 * We wrote all of aggregation in tourController
 *
 * PROBLEM
 * All Schema middleware must be defined before we create the Model, but we cannot use our Static method, because we have not yet created the Review Model
 *
 * SO HOW DO WE GET AROUND THAT?
 * We use JS magic bs
 *  - this.constructor.calcAverageRatings(this.tour);
 *
 * that line is literally the same as
 *  - Review.calcAverageRatings(this.tour);
 *
 * But referring to as if we have created the object in the first place
 *
 *
 */

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRatings: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRatings,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

/**
 * MIDDLEWARE FOR UPDATING AND DELETING
 * There are no hook events for these actions - stupid I know
 * So we have to use regex to target any queries that start with ^findOneAnd and do the processing from there
 *
 * We update and delete with findByIdAndUpdate and findByIdAndDelete in which Mongoose will convert to Mongo findOneAndUpdate or findOneAndDelete
 *
 *  PROBLEM
 * When we query the DB, we actually get back the old data - the one persisted in the DB when we ran the pre middleware (makes sense)
 *
 * Problem is that we cannot update at this point of time, so we say no problem, lets use a post middleware to sort it out
 *
 * Now we get another problem, we cannot access the data from the previous middleware, the one in interest is the tour.id from the tour field
 *
 * SOLUTION
 * We have to persist the data from the pre save middleware and attach it to the current document when we process the data
 *  - this.r = await this.findOne();
 *
 * Now we can use the data in the post middleware to access the static method to call calcAverageRatings and pass in the tour.id from the persisted data from the document which we attached in pre update/delete middleware
 *  - this.r.constructor.calcAverageRatings(this.r);
 *
 * Now that seems messy, so we can use our knowledge from tourModel in everything Middleware and we know that the post document middleware actually has access to the document
 * 
 * reviewSchema.post(/^findOneAnd/, async function (doc, next) {
  await doc.constructor.calcAverageRatings(doc.tour);
   });
 * 
 * 
 */

// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   this.r = await this.findOne();
//   console.log(this.r);
//   next();
// });

// reviewSchema.post(/^findOneAnd/, async function (next) {
//   await this.r.constructor.calcAverageRatings(this.r);
//   next();
// });

reviewSchema.post(/^findOneAnd/, async function (doc, next) {
  await doc.constructor.calcAverageRatings(doc.tour);
  next();
});

reviewSchema.post('save', async function (doc, next) {
  // Review.calcAverageRatings(this.tour);
  // same as above

  await this.constructor.calcAverageRatings(this.tour);
  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
