const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { deleteOne } = require('./handlerFactory');

// To create reviews
exports.createReview = catchAsync(async (req, res, next) => {
  // Getting the tourId and user id from params and req if available
  if (req.params.tourId) req.body.tour = req.params.tourId;
  if (req.user) req.body.user = req.user._id;

  const { review, ratings, createdAt, tour, user } = req.body;

  const newReview = await Review.create({
    review,
    ratings,
    createdAt,
    tour,
    user,
  });

  res.status(201).json({ status: 'success', data: { review: newReview } });
});

// To get reviews
exports.getReview = catchAsync(async (req, res, next) => {
  const reviewId = req.params.id;

  const review = await Review.findById(reviewId);
  if (!review) {
    return next(new AppError('No review found with the id', 404));
  }

  res.status(200).json({
    status: 'success',
    review,
  });
});

// To get all reviews
exports.getAllReview = catchAsync(async (req, res, next) => {
  let filter;
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);
  if (!reviews) {
    res.status(404).json({
      status: 'fail',
      message: 'No reviews found',
    });
  }
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

// To update reviews
exports.updateReview = catchAsync(async (req, res, next) => {
  const reviewId = req.params.id;
  const updatedReview = await Review.findById(reviewId);

  const { review, ratings } = req.body;

  if (!updatedReview) {
    return next(new AppError('No review found with that ID', 404));
  }

  updatedReview.review = review || updatedReview.review;
  updatedReview.ratings = ratings || updatedReview.ratings;
  updatedReview.createdAt = Date.now();

  await updatedReview.save();

  res.status(200).json({
    status: 'success',
    review: updatedReview,
  });
});

// To delete reviews
exports.deleteReview = deleteOne(Review);
