const YahooFinance = require("yahoo-finance2").default;
const { ProxyAgent } = require("undici");

const proxy = new ProxyAgent(
  "http://ulzjeywo:3ql39155i2he@142.111.67.146:5611"
);

const yf = new YahooFinance({
  suppressNotices: ["yahooSurvey"],

  fetch: (input, init = {}) => {
    console.log("Yahoo Request:", input);

    return fetch(input, {
      ...init,
      dispatcher: proxy,
    });
  },
});

(async () => {
  try {
    const data = await yf.quoteSummary("AAPL", {
      modules: ["price"],
    });

    console.dir(data, { depth: null });
  } catch (e) {
    console.error(e);
  }
})();