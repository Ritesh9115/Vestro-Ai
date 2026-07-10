const YahooFinance = require('yahoo-finance2').default;
const yf = new YahooFinance();
async function run() {
  try {
    const res = await yf.quoteSummary('AAPL', { modules: ["incomeStatementHistory"] });
    console.log(res.incomeStatementHistory.incomeStatementHistory.map(i => i.endDate));
  } catch(e) {
    console.error(e.message);
  }
}
run();
