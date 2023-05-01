import ccxt from "ccxt";
const symbol = "btc";

(async () => {
  const exchange = new ccxt.bitstamp();
  console.log(await exchange.fetchOHLCV("BTC/USDT", "1m"));
  let tickers = await exchange.fetchTickers();
  for (const ticker in tickers) {
    if (ticker.toLowerCase().startsWith(symbol)) {
      console.log(ticker);
    }
  }
  console.log("Done");
})();
