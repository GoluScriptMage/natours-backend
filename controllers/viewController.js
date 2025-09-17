const Tours = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tours.find();

  console.log(tours.ratingsAverage);

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTourPage = catchAsync(async (req, res, next) => {
  const tour = await Tours.findById(req.params.id);

  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});
