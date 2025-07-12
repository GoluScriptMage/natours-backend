const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './config.env' });

// Import the User model
const User = require('./models/userModel');

// Connect to MongoDB
const DB = process.env.DATABASE_CONNECTION.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB)
  .then(() => {
    console.log('DB connection successful!');
    cleanupDatabase();
  })
  .catch((err) => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });

async function cleanupDatabase() {
  try {
    // First, let's see what fields exist in the documents
    console.log('Checking existing user documents...');
    const sampleUser = await User.findOne().lean();
    
    if (sampleUser) {
      console.log('Sample user fields before cleanup:', Object.keys(sampleUser));
      
      // Get all field names except _id
      const fieldsToRemove = Object.keys(sampleUser).filter(key => key !== '_id');
      
      if (fieldsToRemove.length > 0) {
        console.log('Removing ALL fields except _id from all users...');
        console.log('Fields to remove:', fieldsToRemove);
        
        // Create $unset object for all fields except _id
        const unsetFields = {};
        fieldsToRemove.forEach(field => {
          unsetFields[field] = '';
        });
        
        const result = await User.updateMany(
          {},
          { $unset: unsetFields },
        );
        
        console.log(`Updated ${result.modifiedCount} user documents`);
        
        // Check the result
        const updatedUser = await User.findOne().lean();
        console.log('User fields after cleanup:', Object.keys(updatedUser));
        console.log('Cleanup successful! Only _id field remains.');
      } else {
        console.log('No fields to remove (only _id exists)');
      }
      console.log('User fields after cleanup:', Object.keys(updatedUser));
      console.log('Remaining user document:', updatedUser);
    } else {
      console.log('No users found in database');
    }
    
    console.log('Database cleanup completed! All fields removed except _id.');
    console.log('Now you can run your app and only current schema fields will be created.');
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}