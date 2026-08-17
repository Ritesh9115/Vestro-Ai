const axios = require('axios');
const YahooFinance = require('yahoo-finance2').default;
const config = require('../config/config');
const { asyncHandler, createError } = require('../utils/errors');
const { safeNumber, calculateGrowthRate } = require('../utils/format');
const { callGemini } = require('../utils/ai');
const ResearchHistory = require('../models/ResearchHistory');
const { updateAnalyticsOnResearch } = require('./analytics.controller');

const { fetch: undiciFetch, ProxyAgent } = require('undici');

// ─── In-memory research cache (15 min TTL) ────────────────────────────────────
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const researchCache = new Map(); // symbol → { data, expiresAt }

function getCached(symbol) {
  const entry = researchCache.get(symbol?.toUpperCase());
  if (entry && Date.now() < entry.expiresAt) return entry.data;
  researchCache.delete(symbol?.toUpperCase());
  return null;
}

function setCached(symbol, data) {
  researchCache.set(symbol?.toUpperCase(), { data, expiresAt: Date.now() + CACHE_TTL_MS });
  // Cap cache at 50 entries
  if (researchCache.size > 50) {
    const firstKey = researchCache.keys().next().value;
    researchCache.delete(firstKey);
  }
}

// Only use proxy if all proxy env vars are configured
const hasProxy = config.proxyHost && config.proxyPort && config.proxyUsername && config.proxyPassword;

let proxyFetch;
if (hasProxy) {
  const proxyAgent = new ProxyAgent({
    uri: `http://${config.proxyUsername}:${config.proxyPassword}@${config.proxyHost}:${config.proxyPort}`,
  });
  proxyFetch = (url, options = {}) => undiciFetch(url, { ...options, dispatcher: proxyAgent });
} else {
  proxyFetch = (url, options = {}) => undiciFetch(url, options);
}

const yf = new YahooFinance({
  suppressNotices: ['yahooSurvey'],
  fetch: proxyFetch,
});


function findBestYahooQuote(quotes) {
  if (!quotes || quotes.length === 0) return null;

  const filtered = quotes.filter((q) => {
    if (!q.symbol) return false;

    if (q.quoteType !== "EQUITY") return false;

    if (q.symbol.startsWith("0P")) return false;

    return true;
  });

  const sorted = filtered.sort((a, b) => {
    const score = (q) => {
      let s = 0;

      if (q.symbol?.endsWith(".NS")) s += 100;

      if (q.symbol?.endsWith(".BO")) s += 80;

      if (q.exchange === "NSI") s += 50;
      if (q.exchange === "BSE") s += 40;

      if (q.longname) s += 10;

      return s;
    };

    return score(b) - score(a);
  });

  return sorted.length ? sorted[0] : null;
}

function sortFMPResults(results) {
  if (!results || results.length === 0) return [];
  return results.sort((a, b) => {
    const aIsIndia = a.exchangeShortName === 'NSE' || a.exchangeShortName === 'BSE';
    const bIsIndia = b.exchangeShortName === 'NSE' || b.exchangeShortName === 'BSE';
    if (aIsIndia && !bIsIndia) return -1;
    if (!aIsIndia && bIsIndia) return 1;
    return 0;
  });
}

function buildFinancialSummary(incomeStatements, balanceSheets, cashFlows, ratios, keyMetrics) {
  const latest = incomeStatements[0] || {};
  const previous = incomeStatements[1] || {};
  const latestBalance = balanceSheets[0] || {};
  const latestCash = cashFlows[0] || {};
  const latestRatio = ratios[0] || {};
  const latestMetrics = keyMetrics[0] || {};

  const revenue = safeNumber(latest.revenue);
  const prevRevenue = safeNumber(previous.revenue);
  const netIncome = safeNumber(latest.netIncome);
  const prevNetIncome = safeNumber(previous.netIncome);
  const grossProfit = safeNumber(latest.grossProfit);
  const operatingIncome = safeNumber(latest.operatingIncome);
  const ebitda = safeNumber(latest.ebitda);
  const eps = safeNumber(latest.eps);
  const prevEps = safeNumber(previous.eps);

  const totalDebt = safeNumber(latestBalance.totalDebt);
  const totalEquity = safeNumber(latestBalance.totalStockholdersEquity);
  const totalAssets = safeNumber(latestBalance.totalAssets);

  const operatingCashFlow = safeNumber(latestCash.operatingCashFlow);
  const freeCashFlow = safeNumber(latestCash.freeCashFlow);
  const capitalExpenditure = safeNumber(latestCash.capitalExpenditure);

  const pe = safeNumber(latestMetrics.peRatio);
  const pb = safeNumber(latestMetrics.pbRatio);
  const peg = safeNumber(latestMetrics.pegRatio);

  const grossMargin = revenue && grossProfit ? (grossProfit / revenue) * 100 : null;
  const operatingMargin = revenue && operatingIncome ? (operatingIncome / revenue) * 100 : null;
  const netMargin = revenue && netIncome ? (netIncome / revenue) * 100 : null;

  const roeRatio = safeNumber(latestRatio.returnOnEquity);
  const roaRatio = safeNumber(latestRatio.returnOnAssets);
  
  const roe = roeRatio != null ? roeRatio * 100 : null;
  const roa = roaRatio != null ? roaRatio * 100 : null;
  
  const roce =
    totalEquity && totalDebt != null && operatingIncome
      ? (operatingIncome / (totalEquity + totalDebt)) * 100
      : null;

  const debtToEquity = safeNumber(latestRatio.debtEquityRatio);
  const currentRatio = safeNumber(latestRatio.currentRatio);
  const interestCoverage = safeNumber(latestRatio.interestCoverage);

  const revenueGrowth = calculateGrowthRate(revenue, prevRevenue);
  const profitGrowth = calculateGrowthRate(netIncome, prevNetIncome);
  const epsGrowth = calculateGrowthRate(eps, prevEps);

  const historicalRevenue = incomeStatements
    .map((stmt) => ({
      year: stmt.calendarYear || new Date(stmt.date).getFullYear(),
      revenue: safeNumber(stmt.revenue),
      netIncome: safeNumber(stmt.netIncome),
      grossProfit: safeNumber(stmt.grossProfit),
      operatingIncome: safeNumber(stmt.operatingIncome),
      eps: safeNumber(stmt.eps),
    }))
    .reverse();

  let healthScore = 55; // Start from 55 (neutral-positive baseline)
  const riskFlags = [];

  if (debtToEquity != null && debtToEquity > 2.0) { healthScore -= 10; riskFlags.push("High Debt to Equity ratio (> 2.0)"); }
  else if (debtToEquity != null && debtToEquity > 1.5) { healthScore -= 5; riskFlags.push("Elevated Debt to Equity ratio (> 1.5)"); }
  else if (debtToEquity != null && debtToEquity < 0.5) { healthScore += 8; }
  else if (debtToEquity != null) { healthScore += 4; }

  if (currentRatio != null && currentRatio < 1) { healthScore -= 10; riskFlags.push("Low liquidity: Current Ratio < 1"); }
  else if (currentRatio != null && currentRatio > 1.5) { healthScore += 8; }
  else if (currentRatio != null) { healthScore += 4; }

  if (roe != null && roe > 15) { healthScore += 12; }
  else if (roe != null && roe > 8) { healthScore += 6; }
  else if (roe != null && roe < 5) { healthScore -= 5; riskFlags.push("Low Return on Equity (< 5%)"); }

  if (revenueGrowth != null && revenueGrowth > 10) { healthScore += 10; }
  else if (revenueGrowth != null && revenueGrowth > 0) { healthScore += 5; }
  else if (revenueGrowth != null && revenueGrowth < 0) { healthScore -= 8; riskFlags.push("Declining YoY Revenue"); }

  if (netMargin != null && netMargin > 15) { healthScore += 10; }
  else if (netMargin != null && netMargin > 5) { healthScore += 5; }
  else if (netMargin != null && netMargin < 0) { healthScore -= 12; riskFlags.push("Negative Net Margin (Loss-making)"); }

  if (freeCashFlow != null && freeCashFlow > 0) { healthScore += 5; }
  else if (freeCashFlow != null && freeCashFlow < 0) { healthScore -= 5; riskFlags.push("Negative Free Cash Flow"); }

  healthScore = Math.max(0, Math.min(100, healthScore));

  return {
    revenue, netIncome, grossProfit, operatingIncome, ebitda, eps,
    grossMargin, operatingMargin, netMargin,
    roe, roa, roce,
    totalDebt, totalEquity, totalAssets,
    debtToEquity, currentRatio, interestCoverage,
    operatingCashFlow, freeCashFlow, capitalExpenditure,
    pe, pb, peg,
    revenueGrowth, profitGrowth, epsGrowth,
    historicalRevenue,
    fiscalYear: latest.calendarYear || new Date(latest.date)?.getFullYear(),
    reportDate: latest.date,
    calculatedHealthScore: healthScore,
    calculatedRiskFlags: riskFlags,
  };
}

async function fetchFromYahoo(symbol) {
  const fiveYearsAgo = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  console.log("Fetching Quote Summary...");
  let quoteSummary;
  try {
    quoteSummary = await yf.quoteSummary(symbol, {
      modules: ["price", "summaryProfile", "financialData", "defaultKeyStatistics"],
    });
    console.log("✓ Loaded");
  } catch (err) {
    throw new Error(`Quote Summary Failed: ${err.message}`);
  }

  const [incomeRes, balanceRes, cashRes] = await Promise.allSettled([
    (async () => {
      const res = await yf.fundamentalsTimeSeries(symbol, { period1: fiveYearsAgo, type: "annual", module: "financials" });
      return res;
    })(),
    (async () => {
      const res = await yf.fundamentalsTimeSeries(symbol, { period1: fiveYearsAgo, type: "annual", module: "balance-sheet" });
      return res;
    })(),
    (async () => {
      const res = await yf.fundamentalsTimeSeries(symbol, { period1: fiveYearsAgo, type: "annual", module: "cash-flow" });
      return res;
    })()
  ]);

  if (incomeRes.status === 'rejected' && balanceRes.status === 'rejected' && cashRes.status === 'rejected') {
    throw new Error("Yahoo financial statements unavailable");
  }

  let financialsSeries = incomeRes.status === 'fulfilled' ? incomeRes.value || [] : [];
  let balanceSeries = balanceRes.status === 'fulfilled' ? balanceRes.value || [] : [];
  let cashflowSeries = cashRes.status === 'fulfilled' ? cashRes.value || [] : [];
  const debug = await yf.fundamentalsTimeSeries(symbol, {
    period1: "2020-01-01",
    type: "annual",
    module: "financials",
  });

  if (!financialsSeries || financialsSeries.length === 0) {
    throw new Error("Yahoo Income Statement unavailable");
  }
  if (!balanceSeries || balanceSeries.length === 0) {
    console.log("⚠ Balance Sheet is empty");
  }
  if (!cashflowSeries || cashflowSeries.length === 0) {
    console.log("⚠ Cash Flow is empty");
  }

  const sortByDateDesc = (a, b) => new Date(b.asOfDate || b.date) - new Date(a.asOfDate || a.date);

  financialsSeries.sort(sortByDateDesc);
  balanceSeries.sort(sortByDateDesc);
  cashflowSeries.sort(sortByDateDesc);

  const priceData = quoteSummary.price || {};
  const profile = quoteSummary.summaryProfile || {};
  const financialData = quoteSummary.financialData || {};
  const keyStats = quoteSummary.defaultKeyStatistics || {};

  const company = {
    symbol: priceData.symbol || symbol,
    name: priceData.longName || priceData.shortName || symbol,
    sector: profile.sector || null,
    industry: profile.industry || null,
    exchange: priceData.exchangeName || null,
    marketCap: safeNumber(priceData.marketCap),
    price: safeNumber(priceData.regularMarketPrice),
    change: safeNumber(priceData.regularMarketChange),
    changePercent: safeNumber(priceData.regularMarketChangePercent),
    description: profile.longBusinessSummary || null,
    website: profile.website || null,
    ceo: null,
    employees: safeNumber(profile.fullTimeEmployees),
    country: profile.country || null,
    image: null,
  };

  const incomeStatements = financialsSeries.map((stmt) => ({
    date: stmt.asOfDate || stmt.date ? new Date(stmt.asOfDate || stmt.date).toISOString().split('T')[0] : null,
    calendarYear: stmt.asOfDate || stmt.date ? new Date(stmt.asOfDate || stmt.date).getFullYear() : null,
    revenue: safeNumber(stmt.totalRevenue),
    grossProfit: safeNumber(stmt.grossProfit),
    operatingIncome: safeNumber(stmt.operatingIncome || stmt.EBIT),
    netIncome: safeNumber(stmt.netIncome),
    ebitda: safeNumber(stmt.EBITDA || stmt.normalizedEBITDA),
    eps: safeNumber(stmt.basicEPS || stmt.dilutedEPS),
    interestExpense: safeNumber(stmt.interestExpense),
  }));

  const balanceSheets = balanceSeries.map((stmt) => ({
    totalDebt: safeNumber(stmt.totalDebt),
    totalStockholdersEquity: safeNumber(stmt.stockholdersEquity || stmt.commonStockEquity),
    totalAssets: safeNumber(stmt.totalAssets),
    totalCurrentAssets: safeNumber(stmt.currentAssets),
    totalCurrentLiabilities: safeNumber(stmt.currentLiabilities),
  }));

  const cashFlows = cashflowSeries.map((stmt) => ({
    operatingCashFlow: safeNumber(stmt.operatingCashFlow),
    freeCashFlow: safeNumber(stmt.freeCashFlow),
    capitalExpenditure: safeNumber(stmt.capitalExpenditure),
  }));

  const ratios = [
    {
      returnOnEquity: safeNumber(financialData.returnOnEquity),
      returnOnAssets: safeNumber(financialData.returnOnAssets),
      debtEquityRatio: keyStats.debtToEquity != null
        ? safeNumber(keyStats.debtToEquity) / 100
        : null,
      currentRatio: safeNumber(financialData.currentRatio),
      interestCoverage: null,
    },
  ];

  const keyMetrics = [
    {
      peRatio: safeNumber(priceData.trailingPE) || safeNumber(keyStats.trailingPE),
      pbRatio: safeNumber(keyStats.priceToBook),
      pegRatio: safeNumber(keyStats.pegRatio),
    },
  ];

  return { company, incomeStatements, balanceSheets, cashFlows, ratios, keyMetrics };
}

function normalizeFMPSymbol(symbol) {
  if (!symbol) return symbol;
  return symbol.replace(/\.NS$/i, '').replace(/\.BO$/i, '').toUpperCase().trim();
}

async function fetchFmpEndpoint(name, endpoint, symbol, key, limit = 1) {
  const url = `https://financialmodelingprep.com/stable/${endpoint}?symbol=${symbol}&apikey=${key}${limit ? `&limit=${limit}` : ''}`;
  try {
    const res = await axios.get(url, { timeout: 10000 });
    return res.data;
  } catch (err) {
    throw err;
  }
}

async function fetchFromFMP(symbol) {
  const key = config.fmpKey;
  const normalizedSymbol = normalizeFMPSymbol(symbol);

  const profileDataArr = await fetchFmpEndpoint('Company Profile', 'profile', normalizedSymbol, key, null);
  const profileData = profileDataArr?.[0];
  if (!profileData) throw new Error('Company not found via FMP');

  const incomeRes = await fetchFmpEndpoint('Income Statement', 'income-statement', normalizedSymbol, key, 5);
  const balanceRes = await fetchFmpEndpoint('Balance Sheet', 'balance-sheet-statement', normalizedSymbol, key, 5);
  const cashRes = await fetchFmpEndpoint('Cash Flow', 'cash-flow-statement', normalizedSymbol, key, 5);
  const ratiosRes = await fetchFmpEndpoint('Ratios', 'ratios', normalizedSymbol, key, 5);
  const metricsRes = await fetchFmpEndpoint('Key Metrics', 'key-metrics', normalizedSymbol, key, 5);

  const company = {
    symbol: profileData.symbol,
    name: profileData.companyName,
    sector: profileData.sector,
    industry: profileData.industry,
    exchange: profileData.exchangeShortName,
    marketCap: safeNumber(profileData.mktCap),
    price: safeNumber(profileData.price),
    change: safeNumber(profileData.changes),
    changePercent: safeNumber(profileData.changesPercentage),
    description: profileData.description,
    website: profileData.website,
    ceo: profileData.ceo,
    employees: profileData.fullTimeEmployees,
    country: profileData.country,
    image: profileData.image,
  };

  return {
    company,
    incomeStatements: incomeRes || [],
    balanceSheets: balanceRes || [],
    cashFlows: cashRes || [],
    ratios: ratiosRes || [],
    keyMetrics: metricsRes || [],
  };
}

async function fetchNews(companyName, symbol) {
  if (!config.newsApiKey) return [];
  const query = `${companyName} OR ${symbol} stock`;
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=10&language=en&apiKey=${config.newsApiKey}`;
  const response = await axios.get(url, { timeout: 10000 });
  return (response.data?.articles || []).map((a) => ({
    title: a.title,
    description: a.description,
    url: a.url,
    source: a.source?.name,
    publishedAt: a.publishedAt,
  }));
}

async function fetchPeers(symbol) {
  if (!config.fmpKey) return [];
  const url = `https://financialmodelingprep.com/api/v3/stock_peers?symbol=${symbol}&apikey=${config.fmpKey}`;
  const response = await axios.get(url, { timeout: 8000 });
  return response.data?.[0]?.peersList || [];
}

function buildGeminiPrompt(company, financials, news, peers) {
  const headlines = news.slice(0, 5).map(n => n.title).join(' | ');

  return `You are an Explainable AI Investment Research Analyst. Your role is to produce a rigorous, evidence-based investment verdict.

CRITICAL RULES:
- You MUST score all 9 financial dimensions first, THEN derive the verdict. Never decide the verdict before scoring.
- Verdict MUST be based ONLY on structured data provided. Never hallucinate financial numbers.
- Verdict must be exactly: INVEST (composite score >=60), WATCH (40-59), or SKIP (<40).
- Missing data is NOT a red flag — use available data to make a fair assessment.
- Blue-chip, large-cap, established companies with stable revenue should generally score INVEST unless there are clear red flags.
- Low confidence should only push you toward WATCH if there are genuine concerns, not just missing data.
- All monetary values MUST use ₹ (e.g. ₹100, ₹10L, ₹5Cr). Never use $.
- Return ONLY valid JSON. No markdown fences.
- Health Score provided by backend: ${financials.calculatedHealthScore}/100
- Risk Flags: [${financials.calculatedRiskFlags.join(', ') || 'None'}]

COMPANY: ${company.name} (${company.symbol})
SECTOR: ${company.sector} | EXCHANGE: ${company.exchange} | MARKET CAP: ${company.marketCap}
CURRENT PRICE: ${company.price} | DAY CHANGE: ${company.changePercent?.toFixed(2)}%

FINANCIAL DATA (FY ${financials.fiscalYear}):
Revenue: ${financials.revenue} (YoY Growth: ${financials.revenueGrowth?.toFixed(2) ?? 'N/A'}%)
Net Income: ${financials.netIncome} (YoY Growth: ${financials.profitGrowth?.toFixed(2) ?? 'N/A'}%)
Gross Margin: ${financials.grossMargin?.toFixed(2) ?? 'N/A'}%
Operating Margin: ${financials.operatingMargin?.toFixed(2) ?? 'N/A'}%
Net Margin: ${financials.netMargin?.toFixed(2) ?? 'N/A'}%
ROE: ${financials.roe?.toFixed(2) ?? 'N/A'}% | ROA: ${financials.roa?.toFixed(2) ?? 'N/A'}% | ROCE: ${financials.roce?.toFixed(2) ?? 'N/A'}%
Debt/Equity: ${financials.debtToEquity ?? 'N/A'} | Current Ratio: ${financials.currentRatio ?? 'N/A'}
Free Cash Flow: ${financials.freeCashFlow ?? 'N/A'} | Operating CF: ${financials.operatingCashFlow ?? 'N/A'}
P/E: ${financials.pe ?? 'N/A'} | P/B: ${financials.pb ?? 'N/A'} | PEG: ${financials.peg ?? 'N/A'}
EBITDA: ${financials.ebitda ?? 'N/A'} | Total Debt: ${financials.totalDebt ?? 'N/A'} | Total Equity: ${financials.totalEquity ?? 'N/A'}
EPS Growth: ${financials.epsGrowth?.toFixed(2) ?? 'N/A'}%

RECENT NEWS: ${headlines || 'No recent news.'}
PEER COMPANIES: ${peers.slice(0, 6).join(', ') || 'Not available'}
BUSINESS DESCRIPTION: ${company.description?.slice(0, 300) || 'Not available'}

STEP 1 — SCORE EACH DIMENSION (0-100):
1. financialQuality: Revenue consistency, earnings quality, reporting clarity
2. growth: Revenue CAGR trend, EPS growth, expansion signals
3. valuation: PE vs sector, PB, PEG, qualitative DCF
4. profitability: Gross/Operating/Net margins, ROE, ROCE, ROA
5. liquidity: Current ratio, cash position, short-term obligations
6. debt: D/E ratio, interest coverage, debt trajectory
7. cashFlow: Operating CF, FCF quality, CF/Net Income ratio
8. macro: Sector tailwinds/headwinds, regulatory environment, interest rate sensitivity
9. competitive: Moat strength, market share, pricing power, management quality

STEP 2 — COMPUTE COMPOSITE SCORE (weighted average):
Weights: financialQuality(15%) + growth(15%) + valuation(10%) + profitability(15%) + liquidity(10%) + debt(10%) + cashFlow(10%) + macro(10%) + competitive(15%)
Composite >=65 = INVEST | 40-64 = WATCH | <40 = SKIP
(Be decisive! Do not default to WATCH. If fundamentals are strong, score high enough for INVEST. If there are severe red flags, score low enough for SKIP.)

STEP 3 — RETURN THIS EXACT JSON:
{
  "dimensionScores": {
    "financialQuality": 0,
    "growth": 0,
    "valuation": 0,
    "profitability": 0,
    "liquidity": 0,
    "debt": 0,
    "cashFlow": 0,
    "macro": 0,
    "competitive": 0
  },
  "compositeScore": 0,
  "verdict": "INVEST|WATCH|SKIP",
  "decisionStrength": 8.5,
  "healthScore": ${financials.calculatedHealthScore},
  "confidence": 80,
  "investmentThesis": "2-3 sentence summary of the investment case.",
  "recommendedAction": "Specific, actionable next step for the investor.",
  "topReasons": ["Reason 1", "Reason 2", "Reason 3"],
  "keyRisks": ["Risk 1", "Risk 2", "Risk 3"],
  "moatAnalysis": "Assessment of the company's competitive moat and durability.",
  "managementQuality": "Assessment of capital allocation, strategy, and execution track record.",
  "financialRedFlags": ["Red flag 1", "Red flag 2"],
  "competitivePosition": "Market position, pricing power, barriers to entry.",
  "growthDrivers": ["Driver 1", "Driver 2"],
  "macroRisks": ["Macro risk 1", "Macro risk 2"],
  "industryOutlook": "1-2 sentence outlook for the industry over 3-5 years.",
  "businessQuality": "Overall business model quality and durability assessment.",
  "valuationOpinion": "Undervalued | Fair | Overvalued — with specific reasoning.",
  "liquidityRisk": "Assessment of short-term liquidity and cash adequacy.",
  "debtAnalysis": "Debt level assessment, trajectory, and serviceability.",
  "capitalAllocation": "How management allocates capital: buybacks, dividends, capex, M&A.",
  "whyNOTInvest": "The strongest argument AGAINST investing in this company right now.",
  "investmentHorizon": "Short-term (0-1yr) | Medium-term (1-3yr) | Long-term (3yr+)",
  "suitableInvestorProfile": "Type of investor this suits: e.g. Value investor, Growth investor, Income investor",
  "finalRecommendation": "One paragraph final recommendation with caveats and conditions.",
  "riskLevel": "Low | Medium | High",
  "futureOutlook": "Company prospects over the next 3-5 years.",
  "nextResearchStep": "What the investor should do next to validate or refute this analysis.",
  "missingInformation": ["data point 1", "data point 2"],
  "valuationSignal": "Undervalued | Fair | Overvalued",
  "explainableChecks": [
    {
      "checkName": "Metric Name",
      "passed": true,
      "value": "Metric Value",
      "whyItMatters": "Why this metric is important for investment decisions",
      "howItAffectedVerdict": "How this specific metric influenced the final verdict",
      "source": "Source of this data",
      "explanation": {
        "beginner": "Plain English explanation — no jargon",
        "intermediate": "Explanation with context and industry benchmarks",
        "expert": "Full technical analysis with ratio comparisons"
      }
    }
  ],
  "recommendationHub": {
    "competitors": [
      {
        "name": "Competitor Name",
        "verdict": "INVEST|WATCH|SKIP",
        "summary": "One sentence relative comparison to this company."
      }
    ],
    "relatedCompanies": [
      {
        "name": "Company Name",
        "relationship": "Supplier|Customer|Partner|Regulator",
        "summary": "One sentence on how this relationship affects the investment thesis."
      }
    ]
  }
}

COMPETITOR RULES:
- If PEER COMPANIES are provided: use ONLY those companies. Do not add any new competitors.
- If PEER COMPANIES are "Not available": identify up to 4 well-known publicly listed competitors from the same industry.
- Return only official company names. Never return ticker symbols. Never generate fake companies.
- Backend will verify every company before displaying it.`;
}

async function verifyCompanyName(companyName) {
  try {
    const searchRes = await yf.search(companyName);
    const bestQuote = findBestYahooQuote(searchRes?.quotes);
    if (bestQuote && bestQuote.symbol) {
      return bestQuote.symbol.toUpperCase();
    }
  } catch (e) {
    console.log(`Yahoo Search verification failed: ${e.message}`);
  }

  if (config.fmpKey) {
    try {
      const fmpSearchUrl = `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(companyName)}&limit=5&apikey=${config.fmpKey}`;
      const fmpSearchRes = await axios.get(fmpSearchUrl, { timeout: 8000 });
      const sortedFmp = sortFMPResults(fmpSearchRes.data || []);
      if (sortedFmp.length > 0) {
        return sortedFmp[0].symbol;
      }
    } catch (e) {
      console.log(`FMP Search verification failed: ${e.message}`);
    }
  }
  return null;
}

async function generateGeminiAnalysis(company, financials, news, peers) {
  const prompt = buildGeminiPrompt(company, financials, news, peers);
  return await callGemini(prompt, { json: true, temperature: 0.1 });
}

async function resolveCompanyWithAI(query) {
  const prompt = `You are a financial company identification assistant.
Your ONLY responsibility is to identify the most likely PUBLICLY LISTED company that the user intends to research.
You are NOT responsible for finding stock symbols. The backend will retrieve and verify ticker symbols from Yahoo Finance and Financial Modeling Prep.

RULES:
- Always prefer publicly listed companies.
- Never return private companies.
- Never return unlisted subsidiaries.
- Never invent company names.
- If multiple listed companies exist, choose the one that best matches the user's intent.
- If the user searches for an unlisted company, identify the closest relevant publicly listed company.
- If no reasonable listed company exists, return null.
- Never generate ticker symbols. Never mention exchange symbols. Never guess symbols.
- Return only the official publicly listed company name.

Return ONLY a JSON object with the following keys:
- "companyName": The official publicly listed company name
- "confidenceScore": A number from 0 to 100 representing how confident you are in this match
- "matchReason": A short explanation of why this match was made

Examples:
Input: bharat electronoics
Output: {"companyName": "Bharat Electronics Limited", "confidenceScore": 99, "matchReason": "Closest publicly listed company matching the user's input."}

Input: BHARAT ALUMINIUM
Output: {"companyName": "National Aluminium Company Limited", "confidenceScore": 92, "matchReason": "Bharat Aluminium Company (BALCO) is not publicly listed. National Aluminium Company Limited is the closest major publicly listed Indian aluminium producer."}

Input: apple
Output: {"companyName": "Apple Inc.", "confidenceScore": 100, "matchReason": "Direct publicly listed company."}

User Query: ${query}
Output:`;

  try {
    const parsed = await callGemini(prompt, { json: true, temperature: 0.1 });
    if (parsed && parsed.companyName) {
      return parsed;
    }
  } catch (e) {
    console.log(`AI resolution failed: ${e.message}`);
  }
  return null;
}

const runResearch = asyncHandler(async (req, res) => {
  const { symbol } = req.params;

  if (!symbol || symbol.trim() === '') {
    return res.status(400).json({ error: 'Stock symbol is required.' });
  }

  const rawSymbol = symbol.trim();
  const cleanSymbol = decodeURIComponent(rawSymbol).toUpperCase().trim();

  const cachedData = getCached(cleanSymbol);
  if (cachedData) {
    console.log(`\nServing ${cleanSymbol} from cache`);
    // Still record history async for trending stats, but don't await
    if (req.user) {
      ResearchHistory.create({
        user: req.user._id,
        symbol: cachedData.company.symbol,
        companyName: cachedData.company.name,
        sector: cachedData.company.sector,
        exchange: cachedData.company.exchange,
        healthScore: cachedData.aiAnalysis?.healthScore,
        verdict: cachedData.aiAnalysis?.verdict,
        confidence: cachedData.aiAnalysis?.confidence
      }).catch(err => console.error("History logging error:", err));
      
      updateAnalyticsOnResearch(
        cachedData.company.symbol, cachedData.company.name, cachedData.company.sector, 
        cachedData.company.exchange, cachedData.aiAnalysis?.verdict, 
        cachedData.aiAnalysis?.confidence, cachedData.aiAnalysis?.healthScore
      ).catch(err => console.error("Analytics logging error:", err));
    }
    return res.json(cachedData);
  }

  let matchResolution = {
    query: cleanSymbol,
    symbol: null,
    name: null,
    confidenceScore: 0,
    matchReason: null
  };

  let company, incomeStatements, balanceSheets, cashFlows, ratios, keyMetrics;

  console.log(`\nSearching Company...`);

  let finalSearchSymbol = null;
  let verifiedName = cleanSymbol;

  const searchVariations = [...new Set([
    cleanSymbol,
    cleanSymbol.replace(/ltd\.?/i, '').trim(),
    cleanSymbol.replace(/limited/i, '').trim(),
    cleanSymbol.replace(/\s+/g, ' ').trim()
  ])];

  for (const queryVariant of searchVariations) {
    if (finalSearchSymbol) break;
    try {
      const searchRes = await yf.search(queryVariant);
      const bestQuote = findBestYahooQuote(searchRes?.quotes);
      if (bestQuote && bestQuote.symbol) {
        finalSearchSymbol = bestQuote.symbol.toUpperCase();
        matchResolution = {
          query: cleanSymbol,
          symbol: finalSearchSymbol,
          name: bestQuote.shortname || bestQuote.longname || finalSearchSymbol,
          confidenceScore: 90,
          matchReason: 'Closest match from search.'
        };
        verifiedName = matchResolution.name;
      }
    } catch (searchErr) {
      console.log(`Search variant failed: ${searchErr.message}`);
    }
  }

  if (!finalSearchSymbol) {
    const llmResolution = await resolveCompanyWithAI(cleanSymbol);
    if (llmResolution && llmResolution.companyName) {
      verifiedName = llmResolution.companyName;
      const aiVariations = [...new Set([
        llmResolution.companyName,
        llmResolution.companyName.replace(/ltd\.?/i, '').trim(),
        llmResolution.companyName.replace(/limited/i, '').trim()
      ])];

      for (const queryVariant of aiVariations) {
        if (finalSearchSymbol) break;
        try {
          const aiSearchRes = await yf.search(queryVariant);
          const bestQuote = findBestYahooQuote(aiSearchRes?.quotes);
          if (bestQuote && bestQuote.symbol) {
            finalSearchSymbol = bestQuote.symbol.toUpperCase();
            matchResolution = {
              query: cleanSymbol,
              symbol: finalSearchSymbol,
              name: bestQuote.shortname || bestQuote.longname || llmResolution.companyName,
              confidenceScore: llmResolution.confidenceScore,
              matchReason: llmResolution.matchReason
            };
          }
        } catch (aiSearchErr) {
          console.log(`AI Search variant failed: ${aiSearchErr.message}`);
        }
      }
    }
  }

  let searchTarget = finalSearchSymbol;

  if (!finalSearchSymbol) {
    if (config.fmpKey) {
      const fmpSearchUrl = `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(verifiedName)}&limit=5&apikey=${config.fmpKey}`;
      try {
        const fmpSearchRes = await axios.get(fmpSearchUrl, { timeout: 8000 });
        const sortedFmp = sortFMPResults(fmpSearchRes.data || []);
        if (sortedFmp.length > 0) {
          searchTarget = sortedFmp[0].symbol;
          matchResolution.symbol = searchTarget;
          matchResolution.name = sortedFmp[0].name;
          matchResolution.matchReason = matchResolution.matchReason || 'Resolved via fallback search.';
        }
      } catch (e) {
        console.log(`Fallback FMP search failed: ${e.message}`);
      }
    }
  }

  if (!searchTarget) {
    throw createError(`Company not found.`, 404);
  }

  console.log("Trying FMP Financials...");
  try {
    const fmpData = await fetchFromFMP(searchTarget);
    company = fmpData.company;
    incomeStatements = fmpData.incomeStatements;
    balanceSheets = fmpData.balanceSheets;
    cashFlows = fmpData.cashFlows;
    ratios = fmpData.ratios;
    keyMetrics = fmpData.keyMetrics;
    console.log("✓ FMP Success");
  } catch (err) {
    console.log("⚠ FMP Failed");
    console.log(`Reason: ${err.message}`);
    console.log("Switching to Yahoo...");
    try {
      const yahooData = await fetchFromYahoo(searchTarget);
      company = yahooData.company;
      incomeStatements = yahooData.incomeStatements;
      balanceSheets = yahooData.balanceSheets;
      cashFlows = yahooData.cashFlows;
      ratios = yahooData.ratios;
      keyMetrics = yahooData.keyMetrics;
    } catch (yahooErr) {
      throw createError(`Company found successfully, but financial statements are currently unavailable from all providers. (${yahooErr.message})`, 404);
    }
  }

  console.log("Building Financial Summary...");
  const financials = buildFinancialSummary(incomeStatements, balanceSheets, cashFlows, ratios, keyMetrics);

  let news = [];
  try {
    news = await fetchNews(company.name, company.symbol);
  } catch (e) {
    console.log(`Fetch News failed: ${e.message}`);
  }

  let peers = [];
  try {
    peers = await fetchPeers(company.symbol);
  } catch (e) {
    console.log(`Fetch Peers failed: ${e.message}`);
  }

  console.log("Generating AI Analysis...");
  const aiAnalysis = await generateGeminiAnalysis(company, financials, news, peers);
  console.log("✓ Research Complete");

  if (aiAnalysis && aiAnalysis.recommendationHub) {
    const verifiedRelated = [];
    for (const rc of (aiAnalysis.recommendationHub.relatedCompanies || [])) {
      const verifiedSymbol = await verifyCompanyName(rc.name);
      if (verifiedSymbol) {
        verifiedRelated.push(rc);
      }
    }
    aiAnalysis.recommendationHub.relatedCompanies = verifiedRelated;

    const competitors = aiAnalysis.recommendationHub.competitors || [];
    if (competitors.length === 0 && peers && peers.length > 0) {
      aiAnalysis.recommendationHub.competitors = peers.slice(0, 5).map(peer => ({
        name: peer,
        verdict: "Research Recommended",
        summary: "Financial comparison unavailable. You can still research this company."
      }));
    }
  }

  const responsePayload = {
    company,
    financials,
    news: news ? news.slice(0, 10) : [],
    peers: peers || [],
    aiAnalysis,
    matchResolution,
    generatedAt: new Date().toISOString(),
  };

  setCached(cleanSymbol, responsePayload);
  res.json(responsePayload);

  // ─── Post-response: persist to history + update analytics (non-blocking) ─────
  // Only runs if user is authenticated (optionalAuth middleware)
  if (req.user) {
    setImmediate(async () => {
      try {
        await ResearchHistory.create({
          userId: req.user._id,
          symbol: company.symbol,
          companyName: company.name,
          sector: company.sector,
          exchange: company.exchange,
          verdict: aiAnalysis?.verdict,
          confidence: aiAnalysis?.confidence,
          healthScore: aiAnalysis?.healthScore || financials?.calculatedHealthScore,
          decisionStrength: aiAnalysis?.decisionStrength,
          dimensionScores: aiAnalysis?.dimensionScores,
          topReasons: aiAnalysis?.topReasons,
          keyRisks: aiAnalysis?.keyRisks,
          reportSnapshot: responsePayload,
          generatedAt: new Date(),
        });
      } catch (e) {
        console.warn('Failed to save research history:', e.message);
      }

      try {
        await updateAnalyticsOnResearch(
          company.symbol,
          company.name,
          company.sector,
          company.exchange,
          aiAnalysis?.verdict,
          aiAnalysis?.confidence,
          aiAnalysis?.healthScore || financials?.calculatedHealthScore
        );
      } catch (e) {
        console.warn('Failed to update analytics:', e.message);
      }
    });
  }
});

module.exports = { runResearch };
