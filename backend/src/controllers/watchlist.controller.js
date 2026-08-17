const Watchlist = require('../models/Watchlist');
const Notification = require('../models/Notification');
const { asyncHandler, createError } = require('../utils/errors');

/**
 * GET /api/watchlist
 */
const getWatchlist = asyncHandler(async (req, res) => {
  const items = await Watchlist.find({ userId: req.user._id }).sort({ addedAt: -1 });
  res.json({ watchlist: items });
});

/**
 * POST /api/watchlist
 */
const addToWatchlist = asyncHandler(async (req, res) => {
  const { symbol, companyName, sector, exchange } = req.body;

  const existing = await Watchlist.findOne({ userId: req.user._id, symbol: symbol.toUpperCase() });
  if (existing) throw createError(`${symbol.toUpperCase()} is already in your watchlist.`, 409);

  const item = await Watchlist.create({
    userId: req.user._id,
    symbol: symbol.toUpperCase(),
    companyName,
    sector,
    exchange,
  });

  res.status(201).json({ message: 'Added to watchlist.', item });
});

/**
 * DELETE /api/watchlist/:symbol
 */
const removeFromWatchlist = asyncHandler(async (req, res) => {
  const result = await Watchlist.deleteOne({
    userId: req.user._id,
    symbol: req.params.symbol.toUpperCase(),
  });
  if (result.deletedCount === 0) throw createError('Symbol not found in watchlist.', 404);
  res.json({ message: 'Removed from watchlist.' });
});

/**
 * PATCH /api/watchlist/:symbol/alert
 * Set a price alert for a watchlist item.
 * DSA: Queue — alert triggers are enqueued as Notifications (FIFO).
 */
const setAlert = asyncHandler(async (req, res) => {
  const { alertPrice, alertType, alertEnabled } = req.body;
  const item = await Watchlist.findOne({ userId: req.user._id, symbol: req.params.symbol.toUpperCase() });
  if (!item) throw createError('Symbol not found in watchlist.', 404);

  if (alertPrice !== undefined) item.alertPrice = alertPrice;
  if (alertType !== undefined) item.alertType = alertType;
  if (alertEnabled !== undefined) item.alertEnabled = alertEnabled;
  item.alertTriggered = false; // Reset trigger when alert is updated
  await item.save();

  // DSA: Queue — create a pending notification (FIFO processing)
  if (alertEnabled && alertPrice && alertType) {
    await Notification.create({
      userId: req.user._id,
      type: 'price_alert',
      title: `Alert set for ${item.symbol}`,
      body: `You will be notified when ${item.companyName || item.symbol} goes ${alertType} ₹${alertPrice.toLocaleString('en-IN')}`,
      relatedSymbol: item.symbol,
    });
  }

  res.json({ message: 'Alert updated.', item });
});

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist, setAlert };
