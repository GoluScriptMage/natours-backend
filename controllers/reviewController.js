const Review = require('../models/reviewModel');
const {
  deleteOne,
  createOne,
  updateOne,
  getAll,
  getOne,
} = require('./handlerFactory');

// To set the tour & user id for the create review
exports.setTourUserIds = (req, res, next) => {
  if (req.params.tourId) req.body.tour = req.params.tourId;
  if (req.user) req.body.user = req.user._id;
  next();
};

exports.createReview = createOne(Review);

// To create reviews
// exports.createReview = catchAsync(async (req, res, next) => {
//   // Getting the tourId and user id from params and req if available
//   if (req.params.tourId) req.body.tour = req.params.tourId;
//   if (req.user) req.body.user = req.user._id;

//   const { review, ratings, createdAt, tour, user } = req.body;

//   const newReview = await Review.create({
//     review,
//     ratings,
//     createdAt,
//     tour,
//     user,
//   });

//   res.status(201).json({ status: 'success', data: { review: newReview } });
// });

// To get reviews
exports.getReview = getOne(Review);

// To get all reviews
exports.getAllReview = getAll(Review);

// To update review
exports.updateReview = updateOne(Review);

// To delete reviews
exports.deleteReview = deleteOne(Review);
