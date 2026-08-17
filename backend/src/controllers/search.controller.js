const YahooFinance = require('yahoo-finance2').default;
const config = require('../config/config');
const { asyncHandler } = require('../utils/errors');
const { fetch: undiciFetch, ProxyAgent } = require('undici');

// ─── Proxy setup (same pattern as research.controller.js) ────────────────────
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

// Yahoo Finance instance using the same fetch/proxy as research controller
const yf = new YahooFinance({
  suppressNotices: ['yahooSurvey'],
  fetch: proxyFetch,
});
// ─────────────────────────────────────────────────────────────────────────────

function sortYahooQuotes(quotes) {
  if (!quotes || quotes.length === 0) return [];
  return quotes
    .filter((q) => !!q.symbol && q.quoteType === 'EQUITY' && !q.symbol.startsWith('0P'))
    .sort((a, b) => {
      const aIsIndia = a.exchange === 'NSI' || a.exchange === 'BSE' || a.symbol.endsWith('.NS') || a.symbol.endsWith('.BO');
      const bIsIndia = b.exchange === 'NSI' || b.exchange === 'BSE' || b.symbol.endsWith('.NS') || b.symbol.endsWith('.BO');
      if (aIsIndia && !bIsIndia) return -1;
      if (!aIsIndia && bIsIndia) return 1;
      return 0;
    });
}

/**
 * GET /api/search?q=<query>
 * Returns matching equities from Yahoo Finance.
 * Falls back to a direct Yahoo Finance quote lookup if search fails.
 */
const searchCompany = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 1) {
    return res.status(400).json({ error: 'Search query is required.' });
  }

  const cleanQuery = q.trim();
  let results = [];

  // ── Primary: Yahoo Finance search ─────────────────────────────────────────
  try {
    const yahooResults = await yf.search(cleanQuery);
    const sortedQuotes = sortYahooQuotes(yahooResults?.quotes || []);
    results = sortedQuotes.map((item) => ({
      symbol: item.symbol,
      name: item.longname || item.shortname || item.symbol,
      exchange: item.exchDisp || item.exchange || '',
      type: item.quoteType || 'EQUITY',
    }));
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Search] Yahoo search failed for "${cleanQuery}":`, err.message);
    }
  }

  // ── Fallback: treat query as a direct symbol and try to quote it ───────────
  if (results.length === 0) {
    const candidates = [
      cleanQuery.toUpperCase(),                    // e.g. AAPL
      `${cleanQuery.toUpperCase()}.NS`,             // NSE
      `${cleanQuery.toUpperCase()}.BO`,             // BSE
    ];

    for (const sym of candidates) {
      try {
        const quote = await yf.quoteSummary(sym, { modules: ['price'] });
        const p = quote?.price;
        if (p && p.quoteType === 'EQUITY') {
          results.push({
            symbol: sym,
            name: p.longName || p.shortName || sym,
            exchange: p.exchangeName || '',
            type: 'EQUITY',
          });
          break; // Found one valid match — stop
        }
      } catch { /* not a valid symbol — continue */ }
    }
  }

  if (results.length === 0) {
    return res.status(404).json({
      error: `No stock found matching "${cleanQuery}". Try using the exact ticker symbol (e.g. AAPL, RELIANCE.NS).`,
    });
  }

  res.json(results);
});

module.exports = { searchCompany };