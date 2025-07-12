const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

dotenv.config({ path: './config.env' });

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('uncaught exception 💥 Shutting Down...');
  console.log(`${err.name} : ${err.message}`);
  process.exit(1);
});

const db = process.env.DATABASE_CONNECTION.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(db, {})
  .then(() => console.log('DATABASE connection successful!'));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log('Server is running on port 3000');
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled Rejection 💥 Shutting Down...');
  server.close(() => {
    process.exit(1);
  });
});
