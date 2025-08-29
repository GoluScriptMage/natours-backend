const Tours = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const {
  deleteOne,
  createOne,
  updateOne,
  getOne,
  getAll,
} = require('./handlerFactory');
const AppError = require('../utils/appError');

// middleware to alias top tours
// This middleware modifies the request query to filter, sort, and limit the results for top tours
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,summary,difficulty,ratingsAverage';
  next();
};

// Routes handled by handlerFactory
exports.getAllTours = getAll(Tours);
exports.getTour = getOne(Tours, { path: 'reviews' });
exports.updateTour = updateOne(Tours);
exports.deleteTour = deleteOne(Tours);
exports.createTour = createOne(Tours);

// TO get the tour stats
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

// To get the monthly plan of the tours
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

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (!latitude || !longitude) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400,
      ),
    );
  }

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tours.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], radius], // Corrected order and data type
      },
    },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');

  // Convert string into numbers
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  if (!latitude || !longitude) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400,
      ),
    );
  }

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  const distances = await Tours.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [longitude, latitude], // Needs to be in the same order
        },
        distanceField: 'distance', // Specify which field to store the calculated distance
        distanceMultiplier: multiplier, // Convert radians to the desired unit
        spherical: true, // Enable spherical calculations
      },
    },
    {
      // Select the only field we want to return
      $project: {
        distance: 1, // Keep the calculated distance
        name: 1, // keep the tour name
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      distances,
    },
  });
});
