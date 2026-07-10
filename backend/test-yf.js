
const { fetch, ProxyAgent } = require("undici");

const proxyAgent = new ProxyAgent({
  uri: "http://ulzjeywo:3ql39155i2he@142.111.67.146:5611",
});

(async () => {
  try {
    const res = await fetch("https://httpbin.org/ip", {
      dispatcher: proxyAgent,
    });

    console.log(await res.text());
  } catch (e) {
    console.error(e);
  }
})();