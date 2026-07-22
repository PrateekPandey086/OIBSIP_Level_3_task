const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    // In production, MONGO_URI must be set — crash fast if missing
    if (!mongoUri) {
        if (process.env.NODE_ENV === 'production') {
            console.error('FATAL: MONGO_URI environment variable is not set. Exiting.');
            process.exit(1);
        }

        // Local dev fallback: spin up an in-memory MongoDB
        console.warn('MONGO_URI not set. Starting in-memory MongoDB fallback (dev only)...');
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create();
            const memUri = mongoServer.getUri();
            const conn = await mongoose.connect(memUri);
            console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
            console.log('Seeding in-memory database...');
            const seed = require('../seed');
            await seed();
        } catch (fallbackError) {
            console.error(`In-Memory MongoDB Error: ${fallbackError.message}`);
            process.exit(1);
        }
        return;
    }

    // Connect to the provided MONGO_URI (Atlas in production)
    try {
        console.log('Connecting to MongoDB Atlas...');
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
