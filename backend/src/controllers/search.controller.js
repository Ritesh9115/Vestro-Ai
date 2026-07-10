const axios = require('axios');
const YahooFinance = require('yahoo-finance2').default;
const config = require('../config/config');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { asyncHandler } = require('../utils/errors');

const proxyAgent = new HttpsProxyAgent('http://ulzjeywo:3ql39155i2he@142.111.67.146:5611');

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const originalFetch = yf._env.fetch;

yf._env.fetch = (url, init = {}) => {
  return originalFetch(url, {
    ...init,
    dispatcher: proxyAgent,
  });
};



function sortYahooQuotes(quotes) {
  if (!quotes || quotes.length === 0) return [];
  return quotes
    .filter((q) => !!q.symbol)
    .sort((a, b) => {
      const aIsIndia = a.exchange === 'NSI' || a.exchange === 'BSE' || a.symbol.endsWith('.NS') || a.symbol.endsWith('.BO');
      const bIsIndia = b.exchange === 'NSI' || b.exchange === 'BSE' || b.symbol.endsWith('.NS') || b.symbol.endsWith('.BO');
      if (aIsIndia && !bIsIndia) return -1;
      if (!aIsIndia && bIsIndia) return 1;
      return 0;
    });
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

const searchCompany = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 1) {
    return res.status(400).json({ error: 'Search query is required.' });
  }

  const cleanQuery = q.trim();
  let results = [];

  try {
    const yahooResults = await yf.search(cleanQuery);
    const sortedQuotes = sortYahooQuotes(yahooResults?.quotes);
    results = sortedQuotes.map((item) => ({
      symbol: item.symbol,
      name: item.longname || item.shortname || item.symbol,
      exchange: item.exchDisp || item.exchange || '',
      type: item.quoteType || 'EQUITY',
    }));
  } catch (err) {
    console.log(`Yahoo Search failed for "${cleanQuery}":`, err.message);
    results = [];
  }

  if (results.length === 0 && config.fmpKey) {
    try {
      const url = `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(cleanQuery)}&limit=5&apikey=${config.fmpKey}`;
      const response = await axios.get(url, { timeout: 8000 });
      const sortedFmp = sortFMPResults(response.data || []);
      results = sortedFmp.map((item) => ({
        symbol: item.symbol,
        name: item.name,
        exchange: item.exchangeShortName,
        type: item.type,
      }));
    } catch (err) {
      console.log(`FMP Search failed for "${cleanQuery}":`, err.message);
      results = [];
    }
  }

  if (results.length === 0) {
    return res.status(404).json({
      error: `Whoops! We scanned the entire financial galaxy, but couldn't find any stock matching "${cleanQuery}". Your spelling might be slightly off, or this stock is hiding from public exchanges. Double-check and try again! 🚀`
    });
  }

  res.json(results);
});

module.exports = { searchCompany };