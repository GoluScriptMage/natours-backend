/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
// eslint-disable-next-line node/no-extraneous-require
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// 1. GLobal MiddleWares

// Set Security HTTP headers
app.use(helmet());

// Development Logging
console.log(`Server is running in ${process.env.NODE_ENV} mode`);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from the same IP
const limitter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, Please try again after an hour!',
});
app.use('/api', limitter);

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// DataSanitization against XSS
app.use(xss());

// Data
// app.use(
//   hpp({
//     whitelist: ['price'],
//   }),
// );

// Body Parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Third-party middleware
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Middleware is running');
  req.requestTime = new Date().toISOString();
  next();
});

//Mounting the Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Universal error handling for all undefined routes
app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Can't find this url '${req.originalUrl}' on the server. `,
      404,
    ),
  );
});

app.use(globalErrorHandler);

//   4. Server

module.exports = app;
