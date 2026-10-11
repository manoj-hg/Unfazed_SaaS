const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/unfazed';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Notice: ${error.message}`);
    console.log('Retrying MongoDB connection in 5 seconds...');
    // Do not call process.exit(1); keep HTTP server alive for Render/cloud health checks
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;

