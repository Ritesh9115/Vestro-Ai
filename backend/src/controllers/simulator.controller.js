const { callGemini } = require('../utils/ai');
const { asyncHandler, createError } = require('../utils/errors');

/**
 * POST /api/simulator
 * ⭐ Investment Simulator — WOW Feature.
 * User enters amount, horizon, risk tolerance.
 * AI returns allocation breakdown, expected return, and Bull/Bear/Best/Worst scenarios.
 */
const runSimulation = asyncHandler(async (req, res) => {
  const { amount, horizon, riskTolerance } = req.body;

  if (!amount || !horizon || !riskTolerance) {
    throw createError('amount, horizon, and riskTolerance are required.', 400);
  }

  const amountFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const riskProfiles = {
    conservative: {
      description: 'Capital preservation with moderate growth',
      typicalAllocation: '20% equity, 60% debt, 20% gold/alternatives',
    },
    moderate: {
      description: 'Balanced growth with managed risk',
      typicalAllocation: '50% equity, 35% debt, 15% alternatives',
    },
    aggressive: {
      description: 'Maximum growth with high risk tolerance',
      typicalAllocation: '75% equity, 15% debt, 10% alternatives',
    },
  };

  const profile = riskProfiles[riskTolerance];

  const prompt = `You are an AI Investment Simulator for Indian investors. A user wants to simulate their investment.

User Input:
- Investment Amount: ${amountFormatted}
- Investment Horizon: ${horizon} years
- Risk Tolerance: ${riskTolerance.toUpperCase()} (${profile.description})
- Typical ${riskTolerance} allocation: ${profile.typicalAllocation}

RULES:
1. All monetary values MUST be in Indian Rupees (INR) using ₹ symbol
2. Base allocation on Indian market context (NSE/BSE, Indian mutual fund categories, SGBs, etc.)
3. Provide realistic CAGR estimates based on 20-year historical Indian market data
4. NEVER guarantee returns — always frame as projections
5. Include disclaimer in your response

Return EXACTLY this JSON structure:
{
  "allocation": [
    {
      "asset": "Asset class name (e.g., Large Cap Equity, Government Bonds)",
      "percent": 40,
      "amount": "₹X,XX,XXX",
      "rationale": "Why this allocation for this risk profile",
      "indianInstruments": ["Nifty 50 Index Fund", "LIC MF"]
    }
  ],
  "projections": {
    "base": {
      "cagr": "11.2%",
      "return1Y": "₹X,XX,XXX",
      "return3Y": "₹X,XX,XXX",
      "return5Y": "₹X,XX,XXX",
      "finalAmount": "₹X,XX,XXX",
      "totalGain": "₹X,XX,XXX",
      "scenario": "Base case assumes normal market conditions"
    },
    "bull": {
      "cagr": "18.5%",
      "finalAmount": "₹X,XX,XXX",
      "totalGain": "₹X,XX,XXX",
      "scenario": "Bull case: strong economic growth, favourable rates"
    },
    "bear": {
      "cagr": "4.0%",
      "finalAmount": "₹X,XX,XXX",
      "totalGain": "₹X,XX,XXX",
      "scenario": "Bear case: economic slowdown, market correction"
    },
    "bestCase": {
      "cagr": "24.0%",
      "finalAmount": "₹X,XX,XXX",
      "totalGain": "₹X,XX,XXX",
      "scenario": "Best case: exceptional bull market, similar to 2003-2007"
    },
    "worstCase": {
      "cagr": "-8.0%",
      "finalAmount": "₹X,XX,XXX",
      "totalGain": "₹X,XX,XXX (loss)",
      "scenario": "Worst case: severe recession or black swan event"
    }
  },
  "keyInsights": [
    "Power of compounding: your money doubles approximately every X years at base CAGR",
    "Additional insight 2",
    "Additional insight 3"
  ],
  "riskFactors": ["Risk 1", "Risk 2", "Risk 3"],
  "aiNarrative": "2–3 paragraph investment narrative explaining this strategy for the user's specific inputs",
  "rebalancingAdvice": "How often to rebalance and what triggers should prompt rebalancing",
  "taxConsiderations": "Brief note on LTCG, STCG, and Section 80C implications for this allocation",
  "disclaimer": "For educational purposes only. Not financial advice. Past returns do not guarantee future performance. Consult a SEBI-registered financial advisor before investing."
}

Horizon: ${horizon} years. Amount: ${amount}. Risk: ${riskTolerance}.`;

  const result = await callGemini(prompt, { json: true, temperature: 0.2 });

  res.json({
    input: { amount, amountFormatted, horizon, riskTolerance },
    simulation: result,
    generatedAt: new Date().toISOString(),
  });
});

// ─── Helper: compute simple health score from adjusted metrics ─────────────────
function computeAdjustedHealth(base, adjustedMetrics) {
  let score = base ?? 55;
  const m = adjustedMetrics || {};

  // Revenue growth impact
  if (m.revenueGrowth != null) {
    if (m.revenueGrowth > 20) score += 10;
    else if (m.revenueGrowth > 10) score += 6;
    else if (m.revenueGrowth > 0) score += 3;
    else if (m.revenueGrowth < -10) score -= 10;
    else if (m.revenueGrowth < 0) score -= 5;
  }
  // Net margin impact
  if (m.netMargin != null) {
    if (m.netMargin > 20) score += 8;
    else if (m.netMargin > 10) score += 4;
    else if (m.netMargin < 0) score -= 12;
    else if (m.netMargin < 5) score -= 4;
  }
  // ROE impact
  if (m.roe != null) {
    if (m.roe > 20) score += 8;
    else if (m.roe > 10) score += 4;
    else if (m.roe < 5) score -= 5;
  }
  // Debt impact
  if (m.debtToEquity != null) {
    if (m.debtToEquity > 3) score -= 12;
    else if (m.debtToEquity > 2) score -= 7;
    else if (m.debtToEquity < 0.5) score += 8;
    else score += 3;
  }
  // Current ratio impact
  if (m.currentRatio != null) {
    if (m.currentRatio < 1) score -= 10;
    else if (m.currentRatio > 2) score += 6;
    else score += 2;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function verdictFromScore(score) {
  if (score >= 65) return 'INVEST';
  if (score >= 40) return 'WATCH';
  return 'SKIP';
}

// ─── Scenario Analysis ────────────────────────────────────────────────────────
const runScenario = asyncHandler(async (req, res) => {
  const { symbol, companyName, baseFinancials, adjustedMetrics } = req.body;
  if (!symbol || !adjustedMetrics) throw createError('symbol and adjustedMetrics are required.', 400);

  const baseHealth = baseFinancials?.calculatedHealthScore ?? 55;
  const newHealth = computeAdjustedHealth(baseHealth, adjustedMetrics);
  const newVerdict = verdictFromScore(newHealth);

  const prompt = `You are an expert financial analyst.
A user has adjusted the financials of ${companyName || symbol} using sliders.

Original metrics:
- Revenue Growth: ${baseFinancials?.revenueGrowth?.toFixed(1) ?? 'N/A'}%
- Net Margin: ${baseFinancials?.netMargin?.toFixed(1) ?? 'N/A'}%
- ROE: ${baseFinancials?.roe?.toFixed(1) ?? 'N/A'}%
- Debt/Equity: ${baseFinancials?.debtToEquity ?? 'N/A'}x
- Current Ratio: ${baseFinancials?.currentRatio ?? 'N/A'}x

Adjusted to:
- Revenue Growth: ${adjustedMetrics.revenueGrowth}%
- Net Margin: ${adjustedMetrics.netMargin}%
- ROE: ${adjustedMetrics.roe}%
- Debt/Equity: ${adjustedMetrics.debtToEquity}x
- Current Ratio: ${adjustedMetrics.currentRatio}x

Based on these changes, the calculated health score moved to ${newHealth}/100 and the verdict is ${newVerdict}.

Write a 2-3 sentence analysis explaining how these metric changes drove this verdict shift. Be specific about which metrics improved or worsened the situation.

Return ONLY a JSON object: {"analysis": "..."}`;

  const result = await callGemini(prompt, { json: true, temperature: 0.1 });
  res.json({ verdict: newVerdict, healthScore: newHealth, analysis: result.analysis || 'Analysis complete.' });
});

// ─── Stress Test ──────────────────────────────────────────────────────────────
const STRESS_IMPACTS = {
  crash: { revenueGrowth: -20, netMargin: -5, debtToEquity: 1.3 },
  inflation: { netMargin: -8, revenueGrowth: -5, currentRatio: -0.3 },
  rate_hike: { debtToEquity: 1.4, currentRatio: -0.3 },
  excellent: { revenueGrowth: 25, netMargin: 5, roe: 5 },
  weak: { revenueGrowth: -10, netMargin: -5, roe: -5 },
};

const runStressTest = asyncHandler(async (req, res) => {
  const { symbol, companyName, baseFinancials, scenario } = req.body;
  if (!symbol || !scenario) throw createError('symbol and scenario required.', 400);

  const impact = STRESS_IMPACTS[scenario] || {};
  const baseHealth = baseFinancials?.calculatedHealthScore ?? 55;

  // Apply multiplicative impact on top of base
  const adjustedMetrics = {
    revenueGrowth: (baseFinancials?.revenueGrowth ?? 8) + (impact.revenueGrowth || 0),
    netMargin: (baseFinancials?.netMargin ?? 10) + (impact.netMargin || 0),
    roe: (baseFinancials?.roe ?? 12) + (impact.roe || 0),
    debtToEquity: (baseFinancials?.debtToEquity ?? 0.5) * (impact.debtToEquity || 1),
    currentRatio: Math.max(0.1, (baseFinancials?.currentRatio ?? 1.5) + (impact.currentRatio || 0)),
  };

  const newHealth = computeAdjustedHealth(baseHealth, adjustedMetrics);
  const newVerdict = verdictFromScore(newHealth);
  const scenarioNames = { crash: 'Market Crash', inflation: 'High Inflation', rate_hike: 'Interest Rate Hike', excellent: 'Excellent Earnings', weak: 'Weak Earnings' };

  const prompt = `You are a financial risk analyst.
Company: ${companyName || symbol}
Stress Scenario: ${scenarioNames[scenario] || scenario}

Financial impact applied:
${Object.entries(impact).map(([k, v]) => `- ${k}: ${v > 0 ? '+' : ''}${v}`).join('\n')}

Resulting health score: ${newHealth}/100
Resulting verdict: ${newVerdict}

Write 2-3 sentences explaining how this stress scenario specifically impacts this company and what the resulting verdict means for investors.

Return ONLY JSON: {"analysis": "..."}`;

  const result = await callGemini(prompt, { json: true, temperature: 0.1 });
  res.json({ verdict: newVerdict, healthScore: newHealth, adjustedMetrics, analysis: result.analysis || 'Stress test complete.' });
});

// ─── What-If Analysis ─────────────────────────────────────────────────────────
const runWhatIf = asyncHandler(async (req, res) => {
  const { symbol, companyName, baseFinancials, question } = req.body;
  if (!symbol || !question) throw createError('symbol and question required.', 400);

  const prompt = `You are an expert financial analyst.
Company: ${companyName || symbol}

Current financials:
- Revenue Growth: ${baseFinancials?.revenueGrowth?.toFixed(1) ?? 'N/A'}%
- Net Margin: ${baseFinancials?.netMargin?.toFixed(1) ?? 'N/A'}%
- ROE: ${baseFinancials?.roe?.toFixed(1) ?? 'N/A'}%
- Debt/Equity: ${baseFinancials?.debtToEquity ?? 'N/A'}x
- Current Ratio: ${baseFinancials?.currentRatio ?? 'N/A'}x
- FCF: ${baseFinancials?.freeCashFlow ?? 'N/A'}
- Current Health Score: ${baseFinancials?.calculatedHealthScore ?? 55}/100

What-If Question: "${question}"

Analyse how this scenario would affect the company's financial health and investment attractiveness.

Return ONLY JSON:
{
  "adjustedMetrics": {
    "revenueGrowth": <number>,
    "netMargin": <number>,
    "roe": <number>,
    "debtToEquity": <number>,
    "currentRatio": <number>
  },
  "healthScore": <0-100>,
  "verdict": "INVEST|WATCH|SKIP",
  "confidence": <0-100>,
  "analysis": "2-3 sentence explanation",
  "bullThesis": "1-2 sentence updated bull case"
}`;

  const result = await callGemini(prompt, { json: true, temperature: 0.15 });
  const healthScore = result.healthScore ?? computeAdjustedHealth(baseFinancials?.calculatedHealthScore ?? 55, result.adjustedMetrics || {});
  res.json({
    verdict: result.verdict || verdictFromScore(healthScore),
    healthScore,
    confidence: result.confidence ?? 70,
    analysis: result.analysis || 'Analysis complete.',
    bullThesis: result.bullThesis || '',
  });
});

// ─── Quarterly Impact ─────────────────────────────────────────────────────────
const runQuarterly = asyncHandler(async (req, res) => {
  const { symbol, companyName, baseFinancials, quarterlyMetrics } = req.body;
  if (!symbol || !quarterlyMetrics) throw createError('symbol and quarterlyMetrics required.', 400);

  const baseHealth = baseFinancials?.calculatedHealthScore ?? 55;
  const newHealth = computeAdjustedHealth(baseHealth, quarterlyMetrics);
  const newVerdict = verdictFromScore(newHealth);

  const prompt = `Company: ${companyName || symbol}
Quarterly metrics changed to:
- Revenue Growth: ${quarterlyMetrics.revenueGrowth}% (was ${baseFinancials?.revenueGrowth?.toFixed(1) ?? 'N/A'}%)
- Net Margin: ${quarterlyMetrics.netMargin}% (was ${baseFinancials?.netMargin?.toFixed(1) ?? 'N/A'}%)
- EPS Growth: ${quarterlyMetrics.epsGrowth}%

New health score: ${newHealth}/100
New verdict: ${newVerdict}

Write a 2 sentence analyst summary of this quarterly performance and whether the verdict shift is justified.
Return ONLY JSON: {"reason": "..."}`;

  const result = await callGemini(prompt, { json: true, temperature: 0.1 });
  res.json({ verdict: newVerdict, healthScore: newHealth, reason: result.reason || 'Quarterly impact calculated.' });
});

module.exports = { runSimulation, runScenario, runStressTest, runWhatIf, runQuarterly };
