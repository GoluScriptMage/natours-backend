const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tours = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');

dotenv.config({ path: './config.env' });

const db = process.env.DATABASE_CONNECTION.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

mongoose
  .connect(db, {})
  .then(() => console.log('DATABASE connection successful!'));

console.log(process.argv);

const importData = async () => {
  try {
    await Tours.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);

    // After importing all data, recalculate tour stats
    await Review.recalculateAllTourStats();
    console.log('Data successfully loaded and stats recalculated!');
  } catch (err) {
    console.log('Error message:', err.message);
    if (err.errors) {
      console.log('Validation errors:', err.errors);
    }
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tours.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
    console.log('Data Successfully Deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

console.log(process.argv);

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
