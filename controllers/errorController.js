const AppError = require('../utils/appError');

const handleCastError = (err) => {
  const message = `Invalid ${err.path} value: ${err.value} hello.`;
  return new AppError(message, 400);
};

const handleDuplicateFields = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: "${value}". Please use another value for the ${field} field!`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = () =>
  new AppError('Invalid Token. Please log in again!');

const handleTokenExpiredError = () =>
  new AppError('Token has expired. Please log in again!');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    errore: err,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

const sendErrorProd = (err, res) => {
  // Operational: trusted error that we want the client to see
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming error we don't want client to see and leak any info
  } else {
    // lOGGING THE ERROR IN CONSOLE
    console.log('Yo i am working here! , all clear ✅');
    console.log('ERROR 💥', err);

    // Sending a generic message to the client
    res.status(err.statusCode || 500).json({
      status: 'error',
      message: 'Something went wrong! Please try again later.',
    });
  }
};

module.exports = (err, req, res, next) => {
  console.log('Error 💥', err); // Log the error object for debugging

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = Object.create(err);

    console.log('Hello error');

    if (error.name === 'CastError') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateFields(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'JsonWebTokenError') error = handleJsonWebTokenError();
    if (error.name === 'TokenExpiredError') error = handleTokenExpiredError();

    sendErrorProd(error, res);
  }
};
