const YahooFinance = require("yahoo-finance2").default;

const yf = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

(async () => {
  try {
    console.log("===== BALANCE SHEET =====");

    const balance = await yf.fundamentalsTimeSeries("AAPL", {
      period1: "2020-01-01",
      type: "annual",
      module: "balance-sheet",
    });

    console.dir(balance, { depth: 2 });

    console.log("\n===== CASH FLOW =====");

    const cash = await yf.fundamentalsTimeSeries("AAPL", {
      period1: "2020-01-01",
      type: "annual",
      module: "cash-flow",
    });

    console.dir(cash, { depth: 2 });

  } catch (err) {
    console.error(err);
  }
})();