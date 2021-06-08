const mongoose = require('mongoose');

/**
 * Connect to MongoDB via Mongoose 6.
 * Mongoose 6 no longer needs the legacy option flags (useNewUrlParser, etc.).
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/nexus-ai';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
