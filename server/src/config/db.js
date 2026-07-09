const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to local MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000, // Timeout quickly if local DB is not running
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Local MongoDB connection failed: ${error.message}`);
    console.log('Starting in-memory MongoDB fallback...');
    try {
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);

      // Seed initial data
      console.log('Seeding in-memory database...');
      const seed = require('../seed');
      await seed();
    } catch (fallbackError) {
      console.error(`In-Memory MongoDB Error: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
