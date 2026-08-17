const mongoose = require('mongoose');

/**
 * Analytics — platform-level aggregated stats per symbol.
 * Powers: Trending, Most Researched, Top Performing, Highest Risk dashboards.
 *
 * DSA: Sliding Window (30-day) computed via aggregation pipeline on ResearchHistory.
 * This collection acts as a materialised view updated on each research event.
 */
const analyticsSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    companyName: { type: String },
    sector: { type: String },
    exchange: { type: String },

    // Cumulative counts
    researchCount: { type: Number, default: 0 },
    saveCount: { type: Number, default: 0 },
    watchlistCount: { type: Number, default: 0 },

    // Aggregate AI scores
    avgConfidence: { type: Number, default: null },
    avgHealthScore: { type: Number, default: null },
    lastVerdict: { type: String, default: null },

    // 30-day sliding window research count (updated on each research event)
    // DSA: Sliding Window — count of researches within rolling 30-day window
    trending30d: { type: Number, default: 0 },

    // Risk: count of research events with SKIP verdict
    skipCount: { type: Number, default: 0 },
    avgRiskFlags: { type: Number, default: 0 },

    trending: { type: Boolean, default: false },
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

analyticsSchema.index({ researchCount: -1 });
analyticsSchema.index({ trending30d: -1 });
analyticsSchema.index({ avgConfidence: -1 });
analyticsSchema.index({ avgHealthScore: -1 });
analyticsSchema.index({ skipCount: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
