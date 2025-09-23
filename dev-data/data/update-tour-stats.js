const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => console.log('DB connection successful!'));

// Function to recalculate all tour statistics
const updateAllTourStats = async () => {
  try {
    await Review.recalculateAllTourStats();
    console.log('Tour statistics updated successfully');
  } catch (err) {
    console.error('Error updating tour statistics:', err);
  } finally {
    // Close the connection when done
    mongoose.connection.close();
  }
};

// Run the function
updateAllTourStats();