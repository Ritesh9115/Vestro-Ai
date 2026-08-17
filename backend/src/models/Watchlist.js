const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema(
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

    // Price alert configuration
    alertPrice: { type: Number, default: null },
    alertType: {
      type: String,
      enum: ['above', 'below', null],
      default: null,
    },
    alertEnabled: { type: Boolean, default: false },
    alertTriggered: { type: Boolean, default: false },

    // Cached last known state
    lastVerdict: { type: String, default: null },
    lastHealthScore: { type: Number, default: null },
    lastPrice: { type: Number, default: null },

    // DSA: Queue — notifications for this watchlist item are processed FIFO
    // Notification events are queued when alert triggers
    pendingNotification: { type: Boolean, default: false },

    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Compound unique: one entry per user per symbol
watchlistSchema.index({ userId: 1, symbol: 1 }, { unique: true });
watchlistSchema.index({ userId: 1, addedAt: -1 });

module.exports = mongoose.model('Watchlist', watchlistSchema);
