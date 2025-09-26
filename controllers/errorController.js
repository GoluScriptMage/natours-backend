const AppError = require('../utils/appError');

const handleCastError = (err) => {
  const message = `Invalid ${err.path} value: ${err.value}.`;
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

const sendErrorDev = (err, req, res) => {
  // A) Error that comes from the api route
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
  //B) Rendered website
  console.error('Error:', err);
  return res.status(err.statusCode).render('error', {
    title: 'Error',
    message: `Do u know that \n U are doing something wrong wants to know what \n Naah I won't tell u that 😅`,
  });
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // Operational: trusted error that we want the client to see
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    // Programming error we don't want client to see and leak any info
    // lOGGING THE ERROR IN CONSOLE
    console.log('Yo i am working here! , all clear ✅');
    console.log('ERROR 💥', err);

    // Sending a generic message to the client
    return res.statusCode(500).json({
      status: 'Error',
      message: 'Something went wrong! Please try again later.',
    });
  }

  // Rendered Error
  return res.status(err.statusCode).render('error', {
    status: 'Error',
    message: 'Something went wrong! Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = Object.create(err);
    if (error.name === 'CastError') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateFields(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'JsonWebTokenError') error = handleJsonWebTokenError();
    if (error.name === 'TokenExpiredError') error = handleTokenExpiredError();

    sendErrorProd(error, req, res);
  }
};
