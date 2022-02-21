const ccxt = require("ccxt");
const downloadData = require("./download-data");

async function main() {
  const exchange = new ccxt.binance();
  const markets = await exchange.loadMarkets();
  const timeframe = "1m";
  const symbol = "BTC/USDT";
  const since = exchange.milliseconds() - new Date("01/01/2000").getTime();
  await downloadData(exchange, symbol, timeframe, since);
  console.log("Done");
}

main();
