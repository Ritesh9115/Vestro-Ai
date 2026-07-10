const yf = require('yahoo-finance2').default;
async function run() {
  try {
    const fiveYearsAgo = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const res = await yf.fundamentalsTimeSeries('AAPL', { period1: fiveYearsAgo, type: 'annual', module: 'financials' });
    console.log("Success! Array length:", res.length);
    console.log("Keys of first item:", Object.keys(res[0] || {}));
  } catch(e) {
    console.error("Error:", e.message);
  }
}
run();
