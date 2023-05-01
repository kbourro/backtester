import ccxt from "ccxt";
import downloadData from "./download-data.js";
const exchangers = new Map();
export default async (exchanger, symbol, from, to = null) => {
  let exchange = null;
  if (!exchangers.has(exchanger)) {
    exchange = new ccxt[exchanger]({ enableRateLimit: true, rateLimit: 100 });
    exchangers.set(exchanger, exchange);
  } else {
    exchange = exchangers.get(exchanger);
  }
  const timeframe = "5m";
  const since = new Date(from).getTime();
  const end = to !== null ? new Date(to).getTime() : null;
  // Object.keys(exchange).forEach((key) => {
  //   const value = exchange[key];
  //   if (typeof value === "string" || value instanceof String) {
  //     if (value.toLowerCase().includes("binance")) {
  //       console.log(key, value);
  //     }
  //   }
  // });
  await downloadData(exchange, symbol, timeframe, since, end);
};
