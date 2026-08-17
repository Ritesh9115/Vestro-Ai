const Analytics = require('../models/Analytics');
const ResearchHistory = require('../models/ResearchHistory');
const { asyncHandler } = require('../utils/errors');

/**
 * DSA: Sliding Window — computes 30-day research count per symbol.
 * This is called after each research event to update the trending30d field.
 * The window slides forward in time; only entries within the last 30 days count.
 */
async function updateTrending30d(symbol) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // DSA: Sliding Window — count events within the 30-day window for this symbol
  const count = await ResearchHistory.countDocuments({
    symbol,
    generatedAt: { $gte: thirtyDaysAgo },
  });

  await Analytics.findOneAndUpdate(
    { symbol },
    { $set: { trending30d: count, trending: count >= 3, lastUpdatedAt: new Date() } },
    { upsert: false }
  );
}

/**
 * Update analytics after a research event.
 * Called by research.controller.js after each successful research.
 * DSA: Sliding Window — updates the 30-day window count.
 */
async function updateAnalyticsOnResearch(symbol, companyName, sector, exchange, verdict, confidence, healthScore) {
  await Analytics.findOneAndUpdate(
    { symbol },
    {
      $setOnInsert: { symbol },
      $inc: { researchCount: 1, ...(verdict === 'SKIP' ? { skipCount: 1 } : {}) },
      $set: {
        lastVerdict: verdict,
        companyName: companyName || undefined,
        sector: sector || undefined,
        exchange: exchange || undefined,
        lastUpdatedAt: new Date(),
      },
    },
    { upsert: true, returnDocument: 'after' }
  );

  // Recompute rolling averages
  const stats = await ResearchHistory.aggregate([
    { $match: { symbol } },
    {
      $group: {
        _id: null,
        avgConfidence: { $avg: '$confidence' },
        avgHealthScore: { $avg: '$healthScore' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Analytics.findOneAndUpdate(
      { symbol },
      {
        $set: {
          avgConfidence: Math.round(stats[0].avgConfidence),
          avgHealthScore: Math.round(stats[0].avgHealthScore),
        },
      }
    );
  }

  // DSA: Sliding Window — update 30-day trending score
  await updateTrending30d(symbol);
}

// ─── Route Handlers ───────────────────────────────────────────────────────────

/**
 * GET /api/analytics/trending
 * DSA: Sliding Window — returns companies with highest 30-day research count.
 */
const getTrending = asyncHandler(async (req, res) => {
  const results = await Analytics.find({ trending30d: { $gt: 0 } })
    .sort({ trending30d: -1 })
    .limit(10)
    .select('symbol companyName sector trending30d lastVerdict avgHealthScore lastUpdatedAt');

  res.json({ trending: results });
});

/**
 * GET /api/analytics/most-researched
 */
const getMostResearched = asyncHandler(async (req, res) => {
  const results = await Analytics.find({ researchCount: { $gt: 0 } })
    .sort({ researchCount: -1 })
    .limit(10)
    .select('symbol companyName sector researchCount lastVerdict avgHealthScore');

  res.json({ mostResearched: results });
});

/**
 * GET /api/analytics/top-confidence
 */
const getTopConfidence = asyncHandler(async (req, res) => {
  const results = await Analytics.find({ avgConfidence: { $ne: null }, lastVerdict: 'INVEST' })
    .sort({ avgConfidence: -1 })
    .limit(10)
    .select('symbol companyName sector avgConfidence avgHealthScore lastVerdict researchCount');

  res.json({ topConfidence: results });
});

/**
 * GET /api/analytics/most-saved
 */
const getMostSaved = asyncHandler(async (req, res) => {
  const results = await Analytics.find({ saveCount: { $gt: 0 } })
    .sort({ saveCount: -1 })
    .limit(10)
    .select('symbol companyName sector saveCount lastVerdict avgHealthScore');

  res.json({ mostSaved: results });
});

/**
 * GET /api/analytics/top-performing
 */
const getTopPerforming = asyncHandler(async (req, res) => {
  const results = await Analytics.find({ avgHealthScore: { $ne: null } })
    .sort({ avgHealthScore: -1 })
    .limit(10)
    .select('symbol companyName sector avgHealthScore lastVerdict avgConfidence researchCount');

  res.json({ topPerforming: results });
});

/**
 * GET /api/analytics/highest-risk
 */
const getHighestRisk = asyncHandler(async (req, res) => {
  const results = await Analytics.find({ skipCount: { $gt: 0 } })
    .sort({ skipCount: -1 })
    .limit(10)
    .select('symbol companyName sector skipCount avgHealthScore lastVerdict researchCount');

  res.json({ highestRisk: results });
});

module.exports = {
  updateAnalyticsOnResearch,
  getTrending,
  getMostResearched,
  getTopConfidence,
  getMostSaved,
  getTopPerforming,
  getHighestRisk,
};
