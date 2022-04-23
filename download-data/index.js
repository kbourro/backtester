import ccxt from "ccxt";
import downloadData from "./download-data.js";

export default async (exchanger, symbol, from, to = null) => {
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
