const axios = require('axios');
const YahooFinance = require('yahoo-finance2').default;
const config = require('../config/config');
const { asyncHandler, createError } = require('../utils/errors');
const { safeNumber, calculateGrowthRate } = require('../utils/format');
const { callGemini } = require('../utils/ai');

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

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

  const roe = safeNumber(latestRatio.returnOnEquity) * 100;
  const roa = safeNumber(latestRatio.returnOnAssets) * 100;
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

  let healthScore = 50;
  const riskFlags = [];

  if (debtToEquity != null && debtToEquity > 1.5) { healthScore -= 10; riskFlags.push("High Debt to Equity ratio (> 1.5)"); }
  else if (debtToEquity != null && debtToEquity < 0.5) { healthScore += 5; }

  if (currentRatio != null && currentRatio < 1) { healthScore -= 10; riskFlags.push("Low liquidity: Current Ratio < 1"); }
  else if (currentRatio != null && currentRatio > 1.5) { healthScore += 5; }

  if (roe != null && roe > 15) { healthScore += 10; }
  else if (roe != null && roe < 5) { healthScore -= 5; riskFlags.push("Low Return on Equity (< 5%)"); }

  if (revenueGrowth != null && revenueGrowth > 10) { healthScore += 10; }
  else if (revenueGrowth != null && revenueGrowth < 0) { healthScore -= 10; riskFlags.push("Declining YoY Revenue"); }

  if (netMargin != null && netMargin > 15) { healthScore += 10; }
  else if (netMargin != null && netMargin < 0) { healthScore -= 15; riskFlags.push("Negative Net Margin (Loss-making)"); }

  if (freeCashFlow != null && freeCashFlow < 0) { healthScore -= 5; riskFlags.push("Negative Free Cash Flow"); }

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
  const fiveYearsAgo = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [financialsSeries, balanceSeries, cashflowSeries, quoteSummary] = await Promise.all([
    yf.fundamentalsTimeSeries(symbol, { period1: fiveYearsAgo, type: 'annual', module: 'financials' }),
    yf.fundamentalsTimeSeries(symbol, { period1: fiveYearsAgo, type: 'annual', module: 'balance-sheet' }),
    yf.fundamentalsTimeSeries(symbol, { period1: fiveYearsAgo, type: 'annual', module: 'cash-flow' }),
    yf.quoteSummary(symbol, { modules: ['price', 'summaryProfile', 'financialData', 'defaultKeyStatistics'] }),
  ]);

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
    date: stmt.date instanceof Date ? stmt.date.toISOString().split('T')[0] : null,
    calendarYear: stmt.date instanceof Date ? stmt.date.getFullYear() : null,
    revenue: safeNumber(stmt.totalRevenue),
    grossProfit: safeNumber(stmt.grossProfit),
    operatingIncome: safeNumber(stmt.EBIT),
    netIncome: safeNumber(stmt.netIncome),
    ebitda: safeNumber(stmt.EBITDA),
    eps: safeNumber(stmt.basicEPS),
    interestExpense: safeNumber(stmt.interestExpense),
  })).reverse();

  const balanceSheets = balanceSeries.map((stmt) => ({
    totalDebt: safeNumber(stmt.totalDebt),
    totalStockholdersEquity: safeNumber(stmt.commonStockEquity),
    totalAssets: safeNumber(stmt.totalAssets),
    totalCurrentAssets: safeNumber(stmt.currentAssets),
    totalCurrentLiabilities: safeNumber(stmt.currentLiabilities),
  })).reverse();

  const cashFlows = cashflowSeries.map((stmt) => ({
    operatingCashFlow: safeNumber(stmt.operatingCashFlow),
    freeCashFlow: safeNumber(stmt.freeCashFlow),
    capitalExpenditure: safeNumber(stmt.capitalExpenditure),
  })).reverse();

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

async function fetchFromFMP(symbol) {
  const BASE = 'https://financialmodelingprep.com/api/v3';
  const key = config.fmpKey;

  const [profileRes, incomeRes, balanceRes, cashRes, ratiosRes, metricsRes, quoteRes] =
    await Promise.all([
      axios.get(`${BASE}/profile/${symbol}?apikey=${key}`, { timeout: 10000 }),
      axios.get(`${BASE}/income-statement/${symbol}?limit=5&apikey=${key}`, { timeout: 10000 }),
      axios.get(`${BASE}/balance-sheet-statement/${symbol}?limit=5&apikey=${key}`, { timeout: 10000 }),
      axios.get(`${BASE}/cash-flow-statement/${symbol}?limit=5&apikey=${key}`, { timeout: 10000 }),
      axios.get(`${BASE}/ratios/${symbol}?limit=5&apikey=${key}`, { timeout: 10000 }),
      axios.get(`${BASE}/key-metrics/${symbol}?limit=5&apikey=${key}`, { timeout: 10000 }),
      axios.get(`${BASE}/quote/${symbol}?apikey=${key}`, { timeout: 10000 }),
    ]);

  const profileData = profileRes.data?.[0];
  if (!profileData) throw new Error('Company not found via FMP');

  const quoteData = quoteRes.data?.[0] || {};

  const company = {
    symbol: profileData.symbol,
    name: profileData.companyName,
    sector: profileData.sector,
    industry: profileData.industry,
    exchange: profileData.exchangeShortName,
    marketCap: safeNumber(profileData.mktCap),
    price: safeNumber(quoteData.price || profileData.price),
    change: safeNumber(quoteData.change),
    changePercent: safeNumber(quoteData.changesPercentage),
    description: profileData.description,
    website: profileData.website,
    ceo: profileData.ceo,
    employees: profileData.fullTimeEmployees,
    country: profileData.country,
    image: profileData.image,
  };

  return {
    company,
    incomeStatements: incomeRes.data || [],
    balanceSheets: balanceRes.data || [],
    cashFlows: cashRes.data || [],
    ratios: ratiosRes.data || [],
    keyMetrics: metricsRes.data || [],
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

  return `You are an Explainable AI Investment Research Analyst. Analyse the company data and return a structured JSON verdict.

STRICT RULES:
- The backend has already calculated base metrics, Health Score (${financials.calculatedHealthScore}/100), and Risk Flags: [${financials.calculatedRiskFlags.join(', ') || 'None'}].
- Verdict must be exactly: INVEST, WATCH, or SKIP.
- All monetary values in explanations MUST be in Indian Rupees (INR) using ₹ (e.g. ₹100, ₹10L, ₹5Cr). Never use $.
- Return ONLY valid JSON.

COMPANY: ${company.name} (${company.symbol}) | SECTOR: ${company.sector}
MARKET CAP: ${company.marketCap} | CURRENT PRICE: ${company.price}

SUMMARIZED FINANCIALS (FY ${financials.fiscalYear}):
Revenue: ${financials.revenue} (Growth: ${financials.revenueGrowth?.toFixed(2)}%)
Net Income: ${financials.netIncome} (Growth: ${financials.profitGrowth?.toFixed(2)}%)
Margins - Gross: ${financials.grossMargin?.toFixed(2)}%, Operating: ${financials.operatingMargin?.toFixed(2)}%, Net: ${financials.netMargin?.toFixed(2)}%
Returns - ROE: ${financials.roe?.toFixed(2)}%, ROCE: ${financials.roce?.toFixed(2)}%, ROA: ${financials.roa?.toFixed(2)}%
Debt/Equity: ${financials.debtToEquity} | Current Ratio: ${financials.currentRatio}
FCF: ${financials.freeCashFlow}
Valuation - PE: ${financials.pe}, PB: ${financials.pb}, PEG: ${financials.peg}

RECENT NEWS: ${headlines || 'No recent news.'}
PEER COMPANIES: ${peers.slice(0, 6).join(', ') || 'Not available'}
DESCRIPTION: ${company.description?.slice(0, 200) || 'Not available'}

Return exactly this JSON structure (no markdown fences):
{
  "verdict": "INVEST|WATCH|SKIP",
  "decisionStrength": 8.5,
  "healthScore": ${financials.calculatedHealthScore},
  "confidence": 80,
  "investmentThesis": "2-3 sentence summary.",
  "recommendedAction": "Actionable recommendation.",
  "topReasons": ["Reason 1", "Reason 2"],
  "keyRisks": ["Risk 1", "Risk 2"],
  "businessQuality": "Brief evaluation of moat",
  "valuationSignal": "Undervalued, Fair, or Overvalued",
  "riskLevel": "Low, Medium, or High",
  "futureOutlook": "Future prospects.",
  "nextResearchStep": "Next action for investor.",
  "missingInformation": ["item 1", "item 2"],
  "suitableInvestor": "e.g. Long-term value",
  "explainableChecks": [
    {
      "checkName": "Metric Name",
      "passed": true,
      "value": "Metric Value",
      "whyItMatters": "Reasoning",
      "howItAffectedVerdict": "Impact",
      "source": "Source",
      "explanation": { "beginner": "...", "intermediate": "...", "expert": "..." }
    }
  ],
  "recommendationHub": {
    "competitors": [
      {
        "name": "Competitor Name",
        "verdict": "INVEST|WATCH|SKIP",
        "summary": "One sentence summary."
      }
    ],
    "relatedCompanies": [
      {
        "name": "Company Name",
        "relationship": "Supplier|Customer|Partner",
        "summary": "One sentence summary."
      }
    ]
  }
}

For Competitors:
The backend already provides verified peer companies.
Never invent competitors.
Use ONLY the provided peer companies.
For each provided peer company, generate a verdict and a one-line summary.

For Related Companies:
Generate Company Name, Relationship, and a one-line explanation.
Never generate ticker symbols.
Never generate financial values.
Never generate fake companies.
If peer companies are provided:

- Use ONLY the provided peer companies.
- Never invent competitors.

COMPETITORS RULES

Case 1:
If PEER COMPANIES are provided,
use ONLY those companies.

Do not add any new competitors.

Case 2:
If PEER COMPANIES are "Not available",
identify up to 4 well-known publicly listed competitors
from the same industry.

Return only official company names.

Do not return ticker symbols.

The backend will verify every company before displaying it.`;
}

async function verifyCompanyName(companyName) {
  try {
    const searchRes = await yf.search(companyName);
    const firstEquity = searchRes?.quotes?.find(q => q.quoteType === 'EQUITY' || q.quoteType === 'ETF');
    if (firstEquity && firstEquity.symbol) {
      return firstEquity.symbol.toUpperCase();
    }
  } catch (e) {
    console.error(`Yahoo Search verification failed for ${companyName}:`, e.message);
  }

  if (config.fmpKey) {
    try {
      const fmpSearchUrl = `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(companyName)}&limit=1&apikey=${config.fmpKey}`;
      const fmpSearchRes = await axios.get(fmpSearchUrl, { timeout: 8000 });
      if (fmpSearchRes.data && fmpSearchRes.data.length > 0) {
        return fmpSearchRes.data[0].symbol;
      }
    } catch (e) {
      console.error(`FMP Search verification failed for ${companyName}:`, e.message);
    }
  }
  return null;
}

async function generateGeminiAnalysis(company, financials, news, peers) {
  const prompt = buildGeminiPrompt(company, financials, news, peers);
  return await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.1 });
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
    const parsed = await callGemini(prompt, { responseMimeType: 'application/json', temperature: 0.1 });
    if (parsed && parsed.companyName) {
      return parsed;
    }
  } catch (e) {
    console.error(`AI company resolution failed:`, e.message);
  }
  return null;
}

const runResearch = asyncHandler(async (req, res) => {
  const { symbol } = req.params;

  if (!symbol || symbol.trim() === '') {
    return res.status(400).json({ error: 'Stock symbol is required.' });
  }

  const cleanSymbol = symbol.toUpperCase().trim();

  let matchResolution = {
    query: cleanSymbol,
    symbol: cleanSymbol,
    name: cleanSymbol,
    confidenceScore: 100,
    matchReason: 'Direct exact match'
  };

  let company, incomeStatements, balanceSheets, cashFlows, ratios, keyMetrics;

  try {
    const yahooData = await fetchFromYahoo(cleanSymbol);
    company = yahooData.company;
    incomeStatements = yahooData.incomeStatements;
    balanceSheets = yahooData.balanceSheets;
    cashFlows = yahooData.cashFlows;
    ratios = yahooData.ratios;
    keyMetrics = yahooData.keyMetrics;
    matchResolution.name = company.name;
  } catch {
    let finalSearchSymbol = null;
    let verifiedName = cleanSymbol;

    try {
      const searchRes = await yf.search(cleanSymbol);
      const firstEquity = searchRes?.quotes?.find(q => q.quoteType === 'EQUITY' || q.quoteType === 'ETF');
      if (firstEquity && firstEquity.symbol && firstEquity.symbol.toUpperCase() !== cleanSymbol) {
        finalSearchSymbol = firstEquity.symbol.toUpperCase();
        matchResolution = {
          query: cleanSymbol,
          symbol: finalSearchSymbol,
          name: firstEquity.shortname || firstEquity.longname || finalSearchSymbol,
          confidenceScore: 90,
          matchReason: 'Closest match from search.'
        };
        verifiedName = matchResolution.name;
      }
    } catch (searchErr) {
    }

    if (!finalSearchSymbol) {
      const llmResolution = await resolveCompanyWithAI(cleanSymbol);

      if (llmResolution && llmResolution.companyName) {
        verifiedName = llmResolution.companyName;

        try {
          const aiSearchRes = await yf.search(llmResolution.companyName);
          const firstEquity = aiSearchRes?.quotes?.find(q => q.quoteType === 'EQUITY' || q.quoteType === 'ETF');
          if (firstEquity && firstEquity.symbol) {
            finalSearchSymbol = firstEquity.symbol.toUpperCase();
            matchResolution = {
              query: cleanSymbol,
              symbol: finalSearchSymbol,
              name: firstEquity.shortname || firstEquity.longname || llmResolution.companyName,
              confidenceScore: llmResolution.confidenceScore,
              matchReason: llmResolution.matchReason
            };
          }
        } catch (aiSearchErr) {
        }
      }
    }

    const searchTarget = finalSearchSymbol || cleanSymbol;
    try {
      if (!finalSearchSymbol && !matchResolution.symbol) throw new Error("Force Fallback");
      const yahooData = await fetchFromYahoo(searchTarget);
      company = yahooData.company;
      incomeStatements = yahooData.incomeStatements;
      balanceSheets = yahooData.balanceSheets;
      cashFlows = yahooData.cashFlows;
      ratios = yahooData.ratios;
      keyMetrics = yahooData.keyMetrics;
    } catch {
      try {
        let fmpSymbol = searchTarget;
        if (!finalSearchSymbol && config.fmpKey) {
          const fmpSearchUrl = `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(verifiedName)}&limit=1&apikey=${config.fmpKey}`;
          const fmpSearchRes = await axios.get(fmpSearchUrl, { timeout: 8000 });
          if (fmpSearchRes.data && fmpSearchRes.data.length > 0) {
            fmpSymbol = fmpSearchRes.data[0].symbol;
            matchResolution.symbol = fmpSymbol;
            matchResolution.name = fmpSearchRes.data[0].name;
            matchResolution.matchReason = matchResolution.matchReason || 'Resolved via fallback search.';
          }
        }

        const fmpData = await fetchFromFMP(fmpSymbol);
        company = fmpData.company;
        incomeStatements = fmpData.incomeStatements;
        balanceSheets = fmpData.balanceSheets;
        cashFlows = fmpData.cashFlows;
        ratios = fmpData.ratios;
        keyMetrics = fmpData.keyMetrics;
      } catch (fmpError) {
        throw createError(`Unable to locate stock matching "${cleanSymbol}". Please check the spelling or symbol.`, 404);
      }
    }
  }

  if (!incomeStatements || incomeStatements.length === 0) {
    throw createError(`Located "${cleanSymbol}", but no financial data is available to analyze.`, 404);
  }

  const financials = buildFinancialSummary(incomeStatements, balanceSheets, cashFlows, ratios, keyMetrics);

  const [news, peers] = await Promise.all([
    fetchNews(company.name, company.symbol).catch(() => []),
    fetchPeers(company.symbol).catch(() => []),
  ]);

  const aiAnalysis = await generateGeminiAnalysis(company, financials, news, peers);

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
        name: peer.name || peer.symbol,
        verdict: "Research Recommended",
        summary: "Financial comparison unavailable. You can still research this company."
      }));
    }
  }

  res.json({
    matchResolution,
    company,
    financials,
    news: news.slice(0, 10),
    peers,
    aiAnalysis,
    generatedAt: new Date().toISOString(),
  });
});

module.exports = { runResearch };
