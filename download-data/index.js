const ccxt = require("ccxt");
const downloadData = require("./download-data");

const download = async (exchanger, symbol, from, to = null) => {
  let exchange = null;
  if (exchanger === "ftx") {
    exchange = new ccxt.ftx();
  } else {
    exchange = new ccxt.binance();
  }
  const timeframe = "1m";
  const since = new Date(from).getTime();
  const end = to !== null ? new Date(to).getTime() : null;
  await downloadData(exchange, symbol, timeframe, since, end);
};

module.exports = download;
