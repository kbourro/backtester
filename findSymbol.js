const ccxt = require("ccxt");
const symbol = "FB";

async function main() {
  const exchange = new ccxt.ftx();
  let tickers = await exchange.fetchTickers();
  for (const ticker in tickers) {
    if (ticker.includes(symbol)) {
      console.log(tickers[ticker]);
    }
  }
  console.log("Done");
}

main();
