const mongoose = require('mongoose');

const savedReportSchema = new mongoose.Schema(
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
    verdict: {
      type: String,
      enum: ['INVEST', 'WATCH', 'SKIP'],
    },
    confidence: { type: Number },
    healthScore: { type: Number },

    // User annotations
    notes: {
      type: String,
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
      default: '',
    },
    tags: [{ type: String, trim: true, maxlength: 50 }],
    isFavorite: { type: Boolean, default: false },

    // Full report JSON snapshot
    reportSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

savedReportSchema.index({ userId: 1, savedAt: -1 });
savedReportSchema.index({ userId: 1, isFavorite: 1 });
savedReportSchema.index({ userId: 1, verdict: 1 });
savedReportSchema.index({ userId: 1, symbol: 1 });

module.exports = mongoose.model('SavedReport', savedReportSchema);
