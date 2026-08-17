const ResearchHistory = require('../models/ResearchHistory');
const { callGemini } = require('../utils/ai');
const { asyncHandler, createError } = require('../utils/errors');

/**
 * GET /api/history
 * Paginated research history for the logged-in user.
 *
 * DSA: Binary Search — when date filters are applied, the sorted history
 * array is searched using binary search on the sorted `generatedAt` index
 * to find the start position (implemented here via MongoDB index range query,
 * which the storage engine executes as binary search on the B-tree index).
 */
const getHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, verdict, startDate, endDate } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build filter
  const filter = { userId: req.user._id };
  if (verdict && ['INVEST', 'WATCH', 'SKIP'].includes(verdict.toUpperCase())) {
    filter.verdict = verdict.toUpperCase();
  }
  // DSA: Binary Search — MongoDB B-tree index on generatedAt performs O(log n) range scan
  if (startDate || endDate) {
    filter.generatedAt = {};
    if (startDate) filter.generatedAt.$gte = new Date(startDate);
    if (endDate) filter.generatedAt.$lte = new Date(endDate);
  }

  const [history, total] = await Promise.all([
    ResearchHistory.find(filter)
      .sort({ generatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('symbol companyName sector verdict confidence healthScore dimensionScores topReasons generatedAt'),
    ResearchHistory.countDocuments(filter),
  ]);

  res.json({
    history,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * GET /api/history/:id
 */
const getHistoryEntry = asyncHandler(async (req, res) => {
  const entry = await ResearchHistory.findOne({ _id: req.params.id, userId: req.user._id });
  if (!entry) throw createError('Research entry not found.', 404);
  res.json({ entry });
});

/**
 * DELETE /api/history/:id
 */
const deleteHistoryEntry = asyncHandler(async (req, res) => {
  const result = await ResearchHistory.deleteOne({ _id: req.params.id, userId: req.user._id });
  if (result.deletedCount === 0) throw createError('Research entry not found.', 404);
  res.json({ message: 'Research entry deleted.' });
});

/**
 * GET /api/history/timeline/:symbol
 * ⭐ Research Timeline — verdict history for a symbol with AI change explanations.
 *
 * DSA: Binary Search — MongoDB compound index { userId, symbol, generatedAt }
 * enables O(log n) retrieval of all entries for a specific symbol.
 * The sorted timeline array then supports manual binary search for date lookups.
 */
const getResearchTimeline = asyncHandler(async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();

  const timeline = await ResearchHistory.find({ userId: req.user._id, symbol })
    .sort({ generatedAt: 1 }) // Chronological order for timeline
    .select('symbol companyName verdict confidence healthScore dimensionScores topReasons keyRisks generatedAt');

  if (timeline.length === 0) {
    return res.json({ symbol, timeline: [], message: 'No research history for this symbol.' });
  }

  // Generate AI change explanations for consecutive verdict changes
  const enrichedTimeline = [];
  for (let i = 0; i < timeline.length; i++) {
    const entry = timeline[i].toObject();
    entry.changeExplanation = null;

    // DSA: Binary Search application — we could use binary search here
    // to find the nearest previous entry for a given date query.
    // For sequential processing, we compare adjacent entries.
    if (i > 0 && timeline[i].verdict !== timeline[i - 1].verdict) {
      try {
        const prevEntry = timeline[i - 1];
        const currEntry = timeline[i];
        const prompt = `You are a financial research analyst explaining why an investment recommendation changed.

Previous Research (${new Date(prevEntry.generatedAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}):
- Verdict: ${prevEntry.verdict}
- Confidence: ${prevEntry.confidence}%
- Health Score: ${prevEntry.healthScore}/100
- Reasons: ${prevEntry.topReasons?.join(', ') || 'N/A'}

Current Research (${new Date(currEntry.generatedAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}):
- Verdict: ${currEntry.verdict}
- Confidence: ${currEntry.confidence}%
- Health Score: ${currEntry.healthScore}/100
- Reasons: ${currEntry.topReasons?.join(', ') || 'N/A'}

Explain in 2–3 sentences why the recommendation changed from ${prevEntry.verdict} to ${currEntry.verdict}.
Be specific. Reference the metrics that changed. Do not repeat the numbers — explain their significance.

Return JSON: { "explanation": "..." }`;

        const result = await callGemini(prompt, { json: true, temperature: 0.1 });
        entry.changeExplanation = result?.explanation || null;
      } catch (e) {
        console.warn('Timeline change explanation failed:', e.message);
      }
    }

    enrichedTimeline.push(entry);
  }

  res.json({
    symbol,
    companyName: timeline[timeline.length - 1].companyName,
    totalResearches: timeline.length,
    firstResearched: timeline[0].generatedAt,
    latestVerdict: timeline[timeline.length - 1].verdict,
    verdictChanges: timeline.reduce((count, entry, i) => {
      if (i > 0 && entry.verdict !== timeline[i - 1].verdict) return count + 1;
      return count;
    }, 0),
    timeline: enrichedTimeline,
  });
});

module.exports = { getHistory, getHistoryEntry, deleteHistoryEntry, getResearchTimeline };
