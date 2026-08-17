const { body, param, query, validationResult } = require('express-validator');

/**
 * Runs validation results and returns 400 with errors if any fail.
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// Auth validators
const signupValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
  body('email')
    .trim()
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  handleValidation,
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

const forgotPasswordValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  handleValidation,
];

const resetPasswordValidator = [
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  handleValidation,
];

// Portfolio validators
const addHoldingValidator = [
  body('symbol').trim().notEmpty().withMessage('Symbol is required').toUpperCase(),
  body('shares').isFloat({ min: 0.001 }).withMessage('Shares must be a positive number'),
  body('avgBuyPrice').isFloat({ min: 0 }).withMessage('Average buy price must be a positive number'),
  handleValidation,
];

// Watchlist validators
const addWatchlistValidator = [
  body('symbol').trim().notEmpty().withMessage('Symbol is required').toUpperCase(),
  body('companyName').optional().trim().isLength({ max: 200 }),
  handleValidation,
];

// Chat validators
const chatMessageValidator = [
  body('message').trim().notEmpty().withMessage('Message is required')
    .isLength({ max: 2000 }).withMessage('Message too long (max 2000 chars)'),
  body('symbol').trim().notEmpty().withMessage('Symbol is required'),
  body('persona').optional().isIn(['beginner', 'ca', 'buffett', 'summarize', 'compare', 'why_watch', 'default']),
  handleValidation,
];

// Simulator validators
const simulatorValidator = [
  body('amount').isFloat({ min: 1000 }).withMessage('Amount must be at least ₹1,000'),
  body('horizon').isInt({ min: 1, max: 30 }).withMessage('Investment horizon must be 1–30 years'),
  body('riskTolerance').isIn(['conservative', 'moderate', 'aggressive']).withMessage('Invalid risk tolerance'),
  handleValidation,
];

module.exports = {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  addHoldingValidator,
  addWatchlistValidator,
  chatMessageValidator,
  simulatorValidator,
  handleValidation,
};
