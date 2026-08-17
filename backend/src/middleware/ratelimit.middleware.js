const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV === 'development';

// Shared configuration
const baseConfig = {
  standardHeaders: true,   // X-RateLimit-* headers
  legacyHeaders: false,
  skip: () => isDev,        // Skip all rate limiting in development
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests. Please slow down and try again shortly.',
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000),
    });
  },
};

/**
 * General API rate limiter — 200 req/15 min per IP (prod only)
 */
const apiLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000,
  max: 200,
});

/**
 * Auth endpoints — 50 failures/15 min per IP (brute-force protection, prod only)
 * skipSuccessfulRequests: only failed login attempts count toward limit
 */
const authLimiter = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000,
  max: 50,
  skipSuccessfulRequests: true,
});

/**
 * Research endpoint — 60 req/minute per IP (AI calls are expensive)
 */
const researchLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 1000,
  max: 60,
});

/**
 * Simulator endpoint — 20 req/minute per IP
 */
const simulatorLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 1000,
  max: 20,
});

/**
 * AI Chat endpoint — 60 messages/minute per IP
 */
const chatLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 1000,
  max: 60,
});

/**
 * Search endpoint — 120 req/minute per IP
 */
const searchLimiter = rateLimit({
  ...baseConfig,
  windowMs: 60 * 1000,
  max: 120,
});

module.exports = {
  apiLimiter,
  authLimiter,
  researchLimiter,
  simulatorLimiter,
  chatLimiter,
  searchLimiter,
};

