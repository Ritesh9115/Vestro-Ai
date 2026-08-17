const mongoose = require('mongoose');

/**
 * PortfolioHolding — individual stock position.
 *
 * DSA: Vectors used for portfolio math:
 *   weightVector   — % of portfolio value this holding represents
 *   riskVector     — weighted risk score contribution
 *   sectorVector   — sector concentration contribution
 */
const portfolioHoldingSchema = new mongoose.Schema(
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
    country: { type: String },
    exchange: { type: String },

    // Position data
    shares: { type: Number, required: true, min: 0 },
    avgBuyPrice: { type: Number, required: true, min: 0 },

    // Live data (refreshed on portfolio fetch)
    currentPrice: { type: Number, default: null },
    dayChange: { type: Number, default: null },
    dayChangePercent: { type: Number, default: null },

    // Portfolio math vectors (recomputed on analytics call)
    // DSA: Vector — O(n) computation across all holdings
    weightVector: { type: Number, default: 0 },     // % of total portfolio
    riskVector: { type: Number, default: 0 },        // weighted risk contribution
    sectorVector: { type: String, default: null },   // sector tag for exposure map

    // AI health snapshot (from last research)
    lastHealthScore: { type: Number, default: null },
    lastVerdict: { type: String, default: null },
    lastResearchedAt: { type: Date, default: null },

    addedAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Compound unique: one holding per user per symbol
portfolioHoldingSchema.index({ userId: 1, symbol: 1 }, { unique: true });
portfolioHoldingSchema.index({ userId: 1 });

module.exports = mongoose.model('PortfolioHolding', portfolioHoldingSchema);
