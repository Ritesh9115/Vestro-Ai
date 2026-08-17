const mongoose = require('mongoose');

/**
 * ResearchHistory — stores every AI research event per user.
 * Powers: Research Timeline, Platform Analytics, Historical Verdict tracking.
 *
 * DSA: Binary Search used on sorted `generatedAt` array for fast date-range lookups.
 */
const researchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    companyName: { type: String, trim: true },
    sector: { type: String },
    exchange: { type: String },

    // AI Verdict
    verdict: {
      type: String,
      enum: ['INVEST', 'WATCH', 'SKIP'],
    },
    confidence: { type: Number, min: 0, max: 100 },
    healthScore: { type: Number, min: 0, max: 100 },
    decisionStrength: { type: Number },

    // 9-Dimension AI Scoring (Phase 4 AI redesign)
    dimensionScores: {
      financialQuality: Number,
      growth: Number,
      valuation: Number,
      profitability: Number,
      liquidity: Number,
      debt: Number,
      cashFlow: Number,
      macro: Number,
      competitive: Number,
    },

    // Key reasons (for Timeline display)
    topReasons: [String],
    keyRisks: [String],

    // Full report snapshot for replay/export
    reportSnapshot: {
      type: mongoose.Schema.Types.Mixed,
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// Compound index: powers timeline query per user+symbol, sorted by date
researchHistorySchema.index({ userId: 1, symbol: 1, generatedAt: -1 });
// Index for platform analytics: most researched symbols
researchHistorySchema.index({ symbol: 1 });
// Index for date filtering
researchHistorySchema.index({ userId: 1, generatedAt: -1 });

module.exports = mongoose.model('ResearchHistory', researchHistorySchema);
