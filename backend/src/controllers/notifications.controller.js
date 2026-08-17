const Notification = require('../models/Notification');
const { asyncHandler } = require('../utils/errors');

/**
 * GET /api/notifications
 * Returns notifications for the user, unread first (FIFO Queue order).
 * DSA: Queue — unread notifications are returned in FIFO order (oldest first).
 */
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30, unreadOnly } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = { userId: req.user._id };
  if (unreadOnly === 'true') filter.read = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ read: 1, createdAt: -1 }) // Unread first, then newest
      .skip(skip)
      .limit(parseInt(limit)),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId: req.user._id, read: false }),
  ]);

  res.json({ notifications, total, unreadCount });
});

/**
 * PATCH /api/notifications/:id/read
 */
const markAsRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: { read: true } }
  );
  res.json({ message: 'Notification marked as read.' });
});

/**
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
  res.json({ message: 'All notifications marked as read.' });
});

/**
 * DELETE /api/notifications/clear
 */
const clearNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ userId: req.user._id });
  res.json({ message: 'All notifications cleared.' });
});

module.exports = { getNotifications, markAsRead, markAllAsRead, clearNotifications };
