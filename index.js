const ccxt = require("ccxt");
const downloadData = require("./download-data");

async function main() {
  const exchange = new ccxt.ftx();
  const timeframe = "1m";
  const symbol = "TSLA/USD";
  const since = new Date("2020/10/31").getTime();
  await downloadData(exchange, symbol, timeframe, since);
  console.log("Done");
}

main();
