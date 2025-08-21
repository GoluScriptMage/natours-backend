const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.deleteOne = (module) =>
  catchAsync(async (req, res, next) => {
    const doc = await module.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No Document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      message: 'Document deleted successfully',
    });
  });

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tours.findByIdAndDelete(req.params.id);
//   if (!newTour) {
//     next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     message: 'Tour deleted successfully',
//   });
// });
