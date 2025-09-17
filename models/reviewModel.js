const mongoose = require('mongoose');
const Tours = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    ratings: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'tours',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'users',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index(
  {
    tour: 1,
    user: 1,
  },
  { unique: true },
);

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name',
  // });
  this.populate({
    path: 'user',
    select: 'name',
  });
  next();
});

reviewSchema.statics.calcReviewStats = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: {
        tour: tourId,
      },
    },
    {
      $group: {
        _id: '$tour',
        numReviews: { $sum: 1 },
        avgRatings: { $avg: '$ratings' },
      },
    },
  ]);

  let updatedStats;

  if (stats.length > 0) {
    updatedStats = {
      ratingsQuantity: stats[0].numReviews,
      ratingsAverage: stats[0].avgRatings,
    };
  } else {
    updatedStats = {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    };
  }
  await Tours.findByIdAndUpdate(tourId, updatedStats);
};

reviewSchema.post('save', function () {
  this.constructor.calcReviewStats(this.tour);
});

// Add this to your reviewModel.js
reviewSchema.statics.recalculateAllTourStats = async function () {
  console.log('Recalculating statistics for all tours...');
  const allTours = await this.distinct('tour'); // Get unique tour IDs from reviews

  // Use Promise.all with Array.map to avoid generators and awaiting inside loops
  await Promise.all(allTours.map((tourId) => this.calcReviewStats(tourId)));

  console.log('All tour statistics have been updated.');
};

// Add middleware for findByIdAndUpdate, findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // Clone the query to avoid issues with executing it twice
  this.r = await this.clone().findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  if (this.r) {
    await this.r.constructor.calcReviewStats(this.r.tour);
  }
});

const Review = mongoose.model('reviews', reviewSchema);

module.exports = Review;
