import ccxt from "ccxt";
import downloadData from "./download-data.js";
import { HttpsProxyAgent } from "https-proxy-agent";
// You can geo-target multiple countries by separating the country abbrevations by a comma, like this:
const username = "stealthcode;country=DE,GR,IT,ES,FR,DK";
//  In order to geo-target multiple countries you will need to switch the syntax to use a semicolon, as you see above
const password = "3e4d37-87ac4b-f80ca7-c587f1-8076a7";
const PROXY_RACK_DNS = "global.rotating.proxyrack.net";
const PROXYRACK_PORT = 10000;
const proxyUrl =
  "http://" +
  username +
  ":" +
  password +
  "@" +
  PROXY_RACK_DNS +
  ":" +
  PROXYRACK_PORT;

const exchangers = new Map();
export default async (exchanger, symbol, from, to = null) => {
  let exchange = null;
  if (!exchangers.has(exchanger)) {
    exchange = new ccxt[exchanger]({
      enableRateLimit: true,
      rateLimit: 200,
      agent: new HttpsProxyAgent(proxyUrl),
      timeout: 5000,
    });
    exchangers.set(exchanger, exchange);
  } else {
    exchange = exchangers.get(exchanger);
  }
  const timeframe = "1m";
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
