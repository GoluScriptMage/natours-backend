const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');

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

exports.createOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.create(req.body);
    if (!doc) {
      next(new AppError('No Document found with that ID', 404));
    }
    res.status(201).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.updateOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    console.log(`doc: ${doc}`);

    if (!doc) {
      next(new AppError('No Document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.getOne = (model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = model.findById(req.params.id);
    if (popOptions) query = await query.populate(popOptions);
    query = await query;

    if (!query) {
      return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { query },
    });
  });

exports.getAll = (model) =>
  catchAsync(async (req, res, next) => {
    //  Executing the query
    const apiFeatures = new ApiFeatures(model.find(), req.query)
      .filter()
      .pagination()
      .sortBy()
      .fields();
    const doc = await apiFeatures.query;

    if (!doc) {
      return next(new AppError('No Document found', 404));
    }

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        tours: doc,
      },
    });
  });
