const axios = require('axios');
const YahooFinance = require('yahoo-finance2').default;
const config = require('../config/config');
const { asyncHandler } = require('../utils/errors');

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const searchCompany = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 1) {
    return res.status(400).json({ error: 'Search query is required.' });
  }

  const cleanQuery = q.trim();
  let results = [];

  try {
    const yahooResults = await yf.search(cleanQuery);
    const quotes = yahooResults?.quotes || [];
    results = quotes
      .filter((item) => item.quoteType === 'EQUITY' || item.quoteType === 'ETF')
      .map((item) => ({
        symbol: item.symbol,
        name: item.longname || item.shortname || item.symbol,
        exchange: item.exchDisp || item.exchange || '',
        type: item.quoteType || 'EQUITY',
      }));
  } catch {
    results = [];
  }

  if (results.length === 0 && config.fmpKey) {
    try {
      const url = `https://financialmodelingprep.com/api/v3/search?query=${encodeURIComponent(cleanQuery)}&limit=8&apikey=${config.fmpKey}`;
      const response = await axios.get(url, { timeout: 8000 });
      results = (response.data || []).map((item) => ({
        symbol: item.symbol,
        name: item.name,
        exchange: item.exchangeShortName,
        type: item.type,
      }));
    } catch {
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
