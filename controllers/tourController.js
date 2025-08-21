const Tours = require('../models/tourModel');
const ApiFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// middleware to alias top tours
// This middleware modifies the request query to filter, sort, and limit the results for top tours
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,summary,difficulty,ratingsAverage';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  //  Executing the query
  const apiFeatures = new ApiFeatures(Tours.find(), req.query)
    .filter()
    .pagination()
    .sortBy()
    .fields();
  const newTour = await apiFeatures.query;

  res.status(200).json({
    status: 'success',
    results: newTour.length,
    data: {
      tours: newTour,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const newTour = await Tours.findById(req.params.id).populate('reviews');

  if (!newTour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { newTour },
  });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const newTour = await Tours.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!newTour) {
    next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      newTour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const newTour = await Tours.findByIdAndDelete(req.params.id);
  if (!newTour) {
    next(new AppError('No tour found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    message: 'Tour deleted successfully',
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tours.create(req.body);
  if (!newTour) {
    next(new AppError('No tour found with that ID', 404));
  }
  res.status(201).json({
    status: 'success',
    message: newTour,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tours.aggregate([
    {
      $match: {
        ratingsAverage: {
          $gte: 4.5,
        },
      },
    },
    {
      $group: {
        _id: {
          $toUpper: '$difficulty',
        },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $match: {
        difficulty: {
          $ne: 'easy',
        },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const data = await Tours.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTours: -1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: data.length,
    data,
  });
});
