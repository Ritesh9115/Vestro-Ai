const Redis = require('ioredis');
const config = require('./config');

let redisClient = null;
let redisAvailable = false;

function getRedisClient() {
  if (redisClient) return redisClient;

  try {
    redisClient = new Redis(config.redisUrl, {
      enableOfflineQueue: false,
      connectTimeout: 5000,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 3) return null; // Stop retrying
        return Math.min(times * 1000, 3000);
      },
    });

    redisClient.on('connect', () => {
      redisAvailable = true;
      console.log('✓ Redis connected');
    });

    redisClient.on('error', (err) => {
      if (redisAvailable) {
        console.warn(`Redis error: ${err.message}. Falling back to in-memory.`);
        redisAvailable = false;
      }
    });

    redisClient.connect().catch(() => {
      redisAvailable = false;
    });
  } catch (err) {
    console.warn('Redis init failed:', err.message);
  }

  return redisClient;
}

function isRedisAvailable() {
  return redisAvailable;
}

module.exports = { getRedisClient, isRedisAvailable };
