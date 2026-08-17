/**
 * MongoDB connection with exponential backoff retry logic.
 * Retries up to 5 times before giving up.
 */

const mongoose = require('mongoose');
const config = require('./config');

let retryCount = 0;
const MAX_RETRIES = 5;

async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    retryCount = 0;
    console.log('✓ MongoDB connected');
  } catch (err) {
    retryCount++;
    console.error(`✗ MongoDB connection failed (attempt ${retryCount}/${MAX_RETRIES}): ${err.message}`);

    if (retryCount >= MAX_RETRIES) {
      console.error('MongoDB max retries reached. Exiting.');
      process.exit(1);
    }

    // Exponential backoff: 2s, 4s, 8s, 16s, 32s
    const delay = Math.pow(2, retryCount) * 1000;
    console.log(`Retrying in ${delay / 1000}s...`);
    setTimeout(connectDB, delay);
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Reconnecting...');
  connectDB();
});

module.exports = { connectDB };
