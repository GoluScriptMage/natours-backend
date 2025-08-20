const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// To create reviews
exports.createReview = catchAsync(async (req, res, next) => {
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
    return new AppError('No review found with the id');
  }

  res.status(200).json({
    status: 'success',
    review,
  });
});

// To get all reviews
exports.getAllReview = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();
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

// To delete reviews
