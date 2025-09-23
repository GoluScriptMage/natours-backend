const Tours = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tours.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTourPage = catchAsync(async (req, res, next) => {
  // Get the slug and find the tour
  const tour = await Tours.findOne({
    slug: req.params.slug,
  }).populate({
    path: 'reviews',
    // No need to select 'user' here as it will be populated by the reviewSchema pre middleware
    select: 'review rating user',
  });

  if (!tour) {
    return next(new Error('No tour found with that name'));
  }

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.loginPage = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};
