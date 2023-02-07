import ccxt from "ccxt";
import downloadData from "./download-data.js";
const binance = new ccxt.binance({ enableRateLimit: true, rateLimit: 60 });

export default async (exchanger, symbol, from, to = null) => {
  let exchange = null;
  if (exchanger === "binance") {
    exchange = binance;
  } else {
    throw new Error("Exchange not supported");
  }
  const timeframe = "1m";
  const since = new Date(from).getTime();
  const end = to !== null ? new Date(to).getTime() : null;
  await downloadData(exchange, symbol, timeframe, since, end);
};
