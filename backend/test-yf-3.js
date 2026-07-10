const YahooFinance = require('yahoo-finance2').default;
const yf = new YahooFinance();
async function run() {
  try {
    const fiveYearsAgo = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const res = await yf.fundamentalsTimeSeries('AAPL', { period1: fiveYearsAgo, type: 'annual', module: 'financials' });
    console.log("Financials array length:", res.length);
    if(res.length) console.log("Financials keys:", Object.keys(res[0]));
    
    const res2 = await yf.fundamentalsTimeSeries('AAPL', { period1: fiveYearsAgo, type: 'annual', module: 'balance-sheet' });
    console.log("Balance sheet array length:", res2.length);
    if(res2.length) console.log("Balance sheet keys:", Object.keys(res2[0]));

    const res3 = await yf.fundamentalsTimeSeries('AAPL', { period1: fiveYearsAgo, type: 'annual', module: 'cash-flow' });
    console.log("Cash flow array length:", res3.length);
    if(res3.length) console.log("Cash flow keys:", Object.keys(res3[0]));
  } catch(e) {
    console.error("Error:", e.message);
  }
}
run();
