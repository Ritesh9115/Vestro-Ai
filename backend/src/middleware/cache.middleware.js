const { getRedisClient, isRedisAvailable } = require('../config/redis');

// In-memory fallback store
const memoryStore = new Map();

/**
 * Cache middleware factory.
 * Returns cached response if available; otherwise calls next() and caches the result.
 *
 * @param {number} ttlSeconds - Cache TTL in seconds
 * @param {Function} keyFn - Optional function(req) => string to generate cache key
 */
function cacheMiddleware(ttlSeconds = 300, keyFn = null) {
  return async (req, res, next) => {
    const key = keyFn ? keyFn(req) : `cache:${req.method}:${req.originalUrl}`;

    try {
      let cached = null;

      if (isRedisAvailable()) {
        cached = await getRedisClient().get(key);
      } else {
        const entry = memoryStore.get(key);
        if (entry && entry.expiresAt > Date.now()) {
          cached = entry.value;
        } else if (entry) {
          memoryStore.delete(key);
        }
      }

      if (cached) {
        const data = JSON.parse(cached);
        return res.json({ ...data, _cached: true });
      }
    } catch { /* Cache miss — continue */ }

    // Intercept res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode < 400) {
        const serialized = JSON.stringify(data);
        try {
          if (isRedisAvailable()) {
            getRedisClient().setex(key, ttlSeconds, serialized);
          } else {
            memoryStore.set(key, { value: serialized, expiresAt: Date.now() + ttlSeconds * 1000 });
            // Cleanup old entries
            if (memoryStore.size > 500) {
              const firstKey = memoryStore.keys().next().value;
              memoryStore.delete(firstKey);
            }
          }
        } catch { /* ignore cache write errors */ }
      }
      return originalJson(data);
    };

    next();
  };
}

/**
 * Invalidate a cache key or pattern.
 */
async function invalidateCache(keyOrPattern) {
  try {
    if (isRedisAvailable()) {
      if (keyOrPattern.includes('*')) {
        const keys = await getRedisClient().keys(keyOrPattern);
        if (keys.length > 0) await getRedisClient().del(...keys);
      } else {
        await getRedisClient().del(keyOrPattern);
      }
    } else {
      for (const key of memoryStore.keys()) {
        if (key.includes(keyOrPattern)) memoryStore.delete(key);
      }
    }
  } catch { /* ignore */ }
}

module.exports = { cacheMiddleware, invalidateCache };
