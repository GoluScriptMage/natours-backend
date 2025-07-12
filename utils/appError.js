class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode || 500;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Operational errors are those that we expect to happen and can handle gracefully

    // this is the error instance of the AppError class
    // this.constructor means exclude it to find where error happens
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
