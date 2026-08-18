const PortfolioHolding = require('../models/PortfolioHolding');
const ResearchHistory = require('../models/ResearchHistory');
const { asyncHandler, createError } = require('../utils/errors');
const { callGemini } = require('../utils/ai');

// ─── Portfolio Analytics Helpers ──────────────────────────────────────────────

/**
 * DSA: HashMap — O(1) sector grouping for exposure map.
 * Groups holdings by sector to compute concentration percentages.
 */
function buildSectorExposureMap(holdings, totalValue) {
  // HashMap: sector → { value, percent, holdings[] }
  const sectorMap = new Map();

  for (const h of holdings) {
    const sector = h.sector || 'Unknown';
    const holdingValue = (h.currentPrice || h.avgBuyPrice) * h.shares;

    if (!sectorMap.has(sector)) {
      sectorMap.set(sector, { sector, value: 0, percent: 0, holdings: [] });
    }
    const entry = sectorMap.get(sector);
    entry.value += holdingValue;
    entry.holdings.push(h.symbol);
  }

  // Compute percentages
  for (const [, entry] of sectorMap) {
    entry.percent = totalValue > 0 ? (entry.value / totalValue) * 100 : 0;
    entry.percent = Math.round(entry.percent * 100) / 100;
  }

  return Array.from(sectorMap.values()).sort((a, b) => b.value - a.value);
}

/**
 * DSA: HashMap — O(1) country grouping.
 */
function buildCountryExposureMap(holdings, totalValue) {
  const countryMap = new Map();

  for (const h of holdings) {
    const country = h.country || 'Unknown';
    const holdingValue = (h.currentPrice || h.avgBuyPrice) * h.shares;

    if (!countryMap.has(country)) {
      countryMap.set(country, { country, value: 0, percent: 0 });
    }
    const entry = countryMap.get(country);
    entry.value += holdingValue;
  }

  for (const [, entry] of countryMap) {
    entry.percent = totalValue > 0 ? (entry.value / totalValue) * 100 : 0;
    entry.percent = Math.round(entry.percent * 100) / 100;
  }

  return Array.from(countryMap.values()).sort((a, b) => b.value - a.value);
}

/**
 * DSA: Sorting (conceptually merge sort) — O(n log n).
 * Sorts holdings by health score for Top Strong / Top Weak rankings.
 */
function rankHoldings(holdings) {
  const withHealth = holdings.filter((h) => h.lastHealthScore != null);
  const sorted = [...withHealth].sort((a, b) => b.lastHealthScore - a.lastHealthScore);
  // Only include in topStrong if health >= 55, topWeak if health < 55
  const topStrong = sorted.filter((h) => h.lastHealthScore >= 55).slice(0, 3);
  const topWeak = sorted.filter((h) => h.lastHealthScore < 55).sort((a, b) => a.lastHealthScore - b.lastHealthScore).slice(0, 3);
  return { topStrong, topWeak };
}

/**
 * DSA: Vector — Portfolio Weight Vector, Risk Vector, Sector Vector.
 * Computes weighted vectors across all holdings for Herfindahl diversification index.
 */
function computePortfolioVectors(holdings, totalValue) {
  if (totalValue === 0) return { weightVector: [], riskVector: [], diversificationScore: 0 };

  // Portfolio Weight Vector: w_i = (holding_value / total_value) for each holding
  const weightVector = holdings.map((h) => {
    const val = (h.currentPrice || h.avgBuyPrice) * h.shares;
    return val / totalValue;
  });

  // Risk Vector: r_i = w_i × (1 - healthScore/100) — lower health = higher risk contribution
  const riskVector = holdings.map((h, i) => {
    const health = h.lastHealthScore ?? 50;
    return weightVector[i] * (1 - health / 100);
  });

  // Portfolio Risk Score: weighted sum of risk contributions (0–100)
  const portfolioRiskScore = Math.min(100, Math.round(riskVector.reduce((a, b) => a + b, 0) * 100));

  // Herfindahl–Hirschman Index (HHI) for diversification
  // HHI = sum of squared weights; lower HHI = more diversified
  const hhi = weightVector.reduce((sum, w) => sum + w * w, 0);
  // Normalise: HHI=1 (single holding) → score=0, HHI=1/n (perfect) → score=100
  const n = holdings.length;
  const minHHI = n > 1 ? 1 / n : 1;
  const diversificationScore = n <= 1 ? 0 : Math.round(((1 - hhi) / (1 - minHHI)) * 100);

  return { weightVector, riskVector, portfolioRiskScore, diversificationScore };
}

/**
 * Compute expected CAGR based on weighted sector growth assumptions.
 * Conservative estimates — for educational display only.
 */
function computeExpectedCAGR(holdings, weightVector) {
  const sectorCAGR = {
    'Technology': 14, 'Information Technology': 14, 'Financials': 11, 'Healthcare': 12,
    'Consumer Discretionary': 10, 'Consumer Staples': 8, 'Energy': 9, 'Materials': 8,
    'Industrials': 10, 'Utilities': 7, 'Real Estate': 9, 'Communication Services': 11,
    'Unknown': 9,
  };

  if (holdings.length === 0) return null;

  let weightedCAGR = 0;
  for (let i = 0; i < holdings.length; i++) {
    const sector = holdings[i].sector || 'Unknown';
    const sectorRate = sectorCAGR[sector] ?? 9;
    weightedCAGR += (weightVector[i] || 0) * sectorRate;
  }

  return Math.round(weightedCAGR * 10) / 10;
}

// ─── Portfolio Health Score ────────────────────────────────────────────────────

function computePortfolioHealthScore(holdings) {
  const withHealth = holdings.filter((h) => h.lastHealthScore != null);
  if (withHealth.length === 0) return null;
  const avg = withHealth.reduce((sum, h) => sum + h.lastHealthScore, 0) / withHealth.length;
  return Math.round(avg);
}

// ─── Route Handlers ───────────────────────────────────────────────────────────

/**
 * GET /api/portfolio
 */
const getPortfolio = asyncHandler(async (req, res) => {
  const holdings = await PortfolioHolding.find({ userId: req.user._id }).sort({ addedAt: -1 });
  res.json({ holdings });
});

/**
 * POST /api/portfolio/holdings
 */
const addHolding = asyncHandler(async (req, res) => {
  const { symbol, companyName, sector, country, exchange, shares, avgBuyPrice } = req.body;

  const existing = await PortfolioHolding.findOne({ userId: req.user._id, symbol: symbol.toUpperCase() });
  if (existing) {
    // Update existing holding (average in new shares)
    const totalShares = existing.shares + shares;
    const newAvgPrice = (existing.avgBuyPrice * existing.shares + avgBuyPrice * shares) / totalShares;
    existing.shares = totalShares;
    existing.avgBuyPrice = Math.round(newAvgPrice * 100) / 100;
    existing.lastUpdatedAt = new Date();
    await existing.save();
    return res.json({ message: 'Holding updated.', holding: existing });
  }

  // Try to get last research health score for this symbol
  const lastResearch = await ResearchHistory.findOne(
    { userId: req.user._id, symbol: symbol.toUpperCase() },
    'healthScore verdict generatedAt',
  ).sort({ generatedAt: -1 });

  const holding = await PortfolioHolding.create({
    userId: req.user._id,
    symbol: symbol.toUpperCase(),
    companyName,
    sector,
    country,
    exchange,
    shares,
    avgBuyPrice,
    lastHealthScore: lastResearch?.healthScore ?? null,
    lastVerdict: lastResearch?.verdict ?? null,
    lastResearchedAt: lastResearch?.generatedAt ?? null,
  });

  res.status(201).json({ message: 'Holding added.', holding });
});

/**
 * PATCH /api/portfolio/holdings/:id
 */
const updateHolding = asyncHandler(async (req, res) => {
  const holding = await PortfolioHolding.findOne({ _id: req.params.id, userId: req.user._id });
  if (!holding) throw createError('Holding not found.', 404);

  const { shares, avgBuyPrice } = req.body;
  if (shares !== undefined) holding.shares = shares;
  if (avgBuyPrice !== undefined) holding.avgBuyPrice = avgBuyPrice;
  holding.lastUpdatedAt = new Date();
  await holding.save();

  res.json({ message: 'Holding updated.', holding });
});

/**
 * DELETE /api/portfolio/holdings/:id
 */
const deleteHolding = asyncHandler(async (req, res) => {
  const result = await PortfolioHolding.deleteOne({ _id: req.params.id, userId: req.user._id });
  if (result.deletedCount === 0) throw createError('Holding not found.', 404);
  res.json({ message: 'Holding removed from portfolio.' });
});

/**
 * GET /api/portfolio/analytics
 * Full AI-powered portfolio analytics with all 13 metrics.
 */
const getPortfolioAnalytics = asyncHandler(async (req, res) => {
  const lang = req.query.lang || 'en';
  const holdings = await PortfolioHolding.find({ userId: req.user._id });

  if (holdings.length === 0) {
    return res.json({
      isEmpty: true,
      message: 'Add holdings to your portfolio to see analytics.',
    });
  }

  // Compute total portfolio value
  const totalValue = holdings.reduce((sum, h) => sum + (h.currentPrice || h.avgBuyPrice) * h.shares, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.avgBuyPrice * h.shares, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  // DSA: Vector computations
  const { weightVector, riskVector, portfolioRiskScore, diversificationScore } = computePortfolioVectors(holdings, totalValue);

  // Update weight and risk vectors on each holding
  await Promise.all(
    holdings.map((h, i) =>
      PortfolioHolding.findByIdAndUpdate(h._id, {
        weightVector: Math.round((weightVector[i] || 0) * 10000) / 100,
        riskVector: Math.round((riskVector[i] || 0) * 10000) / 100,
      })
    )
  );

  // DSA: HashMap — sector and country exposure maps
  const sectorExposure = buildSectorExposureMap(holdings, totalValue);
  const countryExposure = buildCountryExposureMap(holdings, totalValue);

  // DSA: Sorting — Top Strong / Weak Holdings
  const { topStrong, topWeak } = rankHoldings(holdings);

  // Portfolio Health Score
  const portfolioHealthScore = computePortfolioHealthScore(holdings);

  // Expected CAGR
  const expectedCAGR = computeExpectedCAGR(holdings, weightVector);

  // Rebalancing suggestions (over/under-weight by sector)
  const targetSectorWeight = 100 / (sectorExposure.length || 1);
  const rebalancingSuggestions = sectorExposure.map((s) => ({
    sector: s.sector,
    currentWeight: s.percent,
    targetWeight: Math.round(targetSectorWeight * 10) / 10,
    action: s.percent > targetSectorWeight * 1.3 ? 'REDUCE' : s.percent < targetSectorWeight * 0.7 ? 'INCREASE' : 'HOLD',
  }));

  // Bull / Bear / Historical scenarios
  const bullCAGR = expectedCAGR ? expectedCAGR * 1.6 : null;
  const bearCAGR = expectedCAGR ? Math.max(-20, expectedCAGR * 0.3) : null;

  const scenarios = {
    bull: bullCAGR ? {
      return1Y: Math.round(totalValue * (1 + bullCAGR / 100)),
      return3Y: Math.round(totalValue * Math.pow(1 + bullCAGR / 100, 3)),
      return5Y: Math.round(totalValue * Math.pow(1 + bullCAGR / 100, 5)),
      cagr: `${bullCAGR.toFixed(1)}%`,
    } : null,
    bear: bearCAGR ? {
      return1Y: Math.round(totalValue * (1 + bearCAGR / 100)),
      return3Y: Math.round(totalValue * Math.pow(1 + bearCAGR / 100, 3)),
      return5Y: Math.round(totalValue * Math.pow(1 + bearCAGR / 100, 5)),
      cagr: `${bearCAGR.toFixed(1)}%`,
    } : null,
    base: expectedCAGR ? {
      return1Y: Math.round(totalValue * (1 + expectedCAGR / 100)),
      return3Y: Math.round(totalValue * Math.pow(1 + expectedCAGR / 100, 3)),
      return5Y: Math.round(totalValue * Math.pow(1 + expectedCAGR / 100, 5)),
      cagr: `${expectedCAGR.toFixed(1)}%`,
    } : null,
  };

  // AI Portfolio Suggestions
  let aiSuggestions = null;
  try {
    const portfolioSummary = holdings.map((h) => ({
      symbol: h.symbol,
      sector: h.sector,
      weight: `${Math.round((weightVector[holdings.indexOf(h)] || 0) * 10000) / 100}%`,
      healthScore: h.lastHealthScore,
      verdict: h.lastVerdict,
    }));

    const prompt = `You are an AI Portfolio Advisor. Analyse this portfolio and provide actionable suggestions.

Portfolio Summary:
${JSON.stringify(portfolioSummary, null, 2)}

Portfolio Metrics:
- Total Value: ₹${totalValue.toFixed(0)}
- Diversification Score: ${diversificationScore}/100
- Portfolio Health Score: ${portfolioHealthScore}/100
- Risk Score: ${portfolioRiskScore}/100
- Expected CAGR: ${expectedCAGR}%
- Sector Count: ${sectorExposure.length}

Return a JSON object with:
{
  "overallAssessment": "2–3 sentence portfolio health summary",
  "suggestions": [
    {
      "priority": "HIGH|MEDIUM|LOW",
      "type": "REDUCE|INCREASE|REBALANCE|RESEARCH|DIVERSIFY",
      "symbol": "optional symbol",
      "action": "Specific actionable step",
      "reason": "Why this matters"
    }
  ],
  "strengthSummary": "What this portfolio does well",
  "weaknessSummary": "Key areas to improve",
  "disclaimer": "For educational purposes only. Not financial advice."
}
${lang === 'hi' ? '\nLANGUAGE: Write ALL string values (overallAssessment, action, reason, strengthSummary, weaknessSummary, disclaimer) in professional Financial Hindi (Hinglish blend is fine). Keep JSON keys in English.' : ''}
Return only valid JSON. Maximum 5 suggestions.`;

    aiSuggestions = await callGemini(prompt, { json: true, temperature: 0.2 });
  } catch (e) {
    console.warn('Portfolio AI suggestions failed:', e.message);
  }

  res.json({
    summary: {
      totalValue: Math.round(totalValue),
      totalCost: Math.round(totalCost),
      totalGain: Math.round(totalGain),
      totalGainPercent: Math.round(totalGainPercent * 100) / 100,
      holdingsCount: holdings.length,
    },
    portfolioHealthScore,
    portfolioRiskScore,
    diversificationScore,
    expectedCAGR,
    sectorExposure,
    countryExposure,
    scenarios,
    topStrong,
    topWeak,
    rebalancingSuggestions,
    aiSuggestions,
    updatedAt: new Date().toISOString(),
  });
});

module.exports = { getPortfolio, addHolding, updateHolding, deleteHolding, getPortfolioAnalytics };
