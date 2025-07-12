const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tours = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

const db = process.env.DATABASE_CONNECTION.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'),
);

mongoose
  .connect(db, {})
  .then(() => console.log('DATABASE connection successful!'));

console.log(process.argv);

const importData = async () => {
  try {
    await Tours.create(tours);
    console.log('Data Successfully loaded!');
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
    console.log('Data Successfully Deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
