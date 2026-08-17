const User = require('../models/User');
const ResearchHistory = require('../models/ResearchHistory');
const Portfolio = require('../models/PortfolioHolding');
const Watchlist = require('../models/Watchlist');
const { asyncHandler } = require('../utils/errors');

/**
 * GET /api/user/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      profilePicture: req.user.profilePicture,
      preferences: req.user.preferences,
      createdAt: req.user.createdAt,
    },
  });
});

/**
 * PATCH /api/user/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'profilePicture', 'preferences'];
  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { returnDocument: 'after', runValidators: true });

  res.json({
    message: 'Profile updated.',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture,
      preferences: user.preferences,
    },
  });
});

/**
 * GET /api/user/dashboard
 * Aggregated summary for the authenticated user's home dashboard.
 */
const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [researchCount, portfolioCount, watchlistCount, recentResearch] = await Promise.all([
    ResearchHistory.countDocuments({ userId }),
    Portfolio.countDocuments({ userId }),
    Watchlist.countDocuments({ userId }),
    ResearchHistory.find({ userId })
      .sort({ generatedAt: -1 })
      .limit(5)
      .select('symbol companyName verdict confidence healthScore generatedAt'),
  ]);

  // Verdict distribution
  const verdictStats = await ResearchHistory.aggregate([
    { $match: { userId } },
    { $group: { _id: '$verdict', count: { $sum: 1 } } },
  ]);

  const verdictMap = { INVEST: 0, WATCH: 0, SKIP: 0 };
  verdictStats.forEach((v) => { if (v._id) verdictMap[v._id] = v.count; });

  res.json({
    stats: {
      researchCount,
      portfolioHoldings: portfolioCount,
      watchlistItems: watchlistCount,
      verdictDistribution: verdictMap,
    },
    recentResearch,
  });
});

module.exports = { getProfile, updateProfile, getDashboard };
