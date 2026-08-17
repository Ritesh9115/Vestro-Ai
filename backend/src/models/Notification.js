const mongoose = require('mongoose');

/**
 * Notification — in-app notification system.
 * DSA: Queue — notifications are read in FIFO order (createdAt asc for unread).
 */
const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['verdict_change', 'health_change', 'price_alert', 'system', 'report_saved'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    body: {
      type: String,
      maxlength: 1000,
    },
    read: {
      type: Boolean,
      default: false,
    },
    relatedSymbol: { type: String },
    relatedEntityId: { type: mongoose.Schema.Types.ObjectId },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Compound index: unread notifications sorted by time (FIFO Queue behaviour)
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
