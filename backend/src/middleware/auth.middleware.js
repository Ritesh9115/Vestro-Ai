const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
const { createError } = require('../utils/errors');

/**
 * authenticate — requires valid JWT access token.
 * Attaches req.user for downstream controllers.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createError('Authentication required. Please login.', 401));
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(createError('Session expired. Please login again.', 401));
      }
      return next(createError('Invalid token.', 401));
    }

    const user = await User.findById(decoded.userId).select('-passwordHash -refreshTokens');
    if (!user || !user.isActive) {
      return next(createError('User not found or deactivated.', 401));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * optionalAuth — attaches req.user if a valid token is present.
 * Continues without error if no token provided.
 * Used on research route to save history for logged-in users only.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token — continue as guest
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.userId).select('-passwordHash -refreshTokens');
      if (user && user.isActive) {
        req.user = user;
      }
    } catch {
      // Invalid/expired token — continue as guest
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticate, optionalAuth };
