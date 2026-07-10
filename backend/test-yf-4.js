const YahooFinance = require('yahoo-finance2').default;
const yf = new YahooFinance();
async function run() {
  try {
    const quoteSummary = await yf.quoteSummary('AAPL', {
      modules: ["price", "summaryProfile", "financialData", "defaultKeyStatistics", "incomeStatementHistory", "balanceSheetHistory", "cashflowStatementHistory"],
    });
    console.log("quoteSummary keys:", Object.keys(quoteSummary));
    
    if(quoteSummary.incomeStatementHistory) {
      console.log("Income statements:", quoteSummary.incomeStatementHistory.incomeStatementHistory.length);
      console.log("Income keys:", Object.keys(quoteSummary.incomeStatementHistory.incomeStatementHistory[0]));
    }
  } catch(e) {
    console.error("Error:", e.message);
  }
}
run();
