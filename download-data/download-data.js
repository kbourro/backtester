import ccxt from "ccxt";
import * as db from "../db/sql.js";

export default (exchange, symbol, timeframe, since, end) => {
  symbol = symbol.toUpperCase();
  const exchangersymbol = exchange.id + "" + symbol;
  return new Promise((resolve, reject) => {
    (async () => {
      let firstTimestamp = db.getFirstTimestamp(exchangersymbol);
      let lastTimestamp = db.getLastTimestamp(exchangersymbol);
      if (firstTimestamp !== null && since < firstTimestamp) {
        const ohlcvs = await exchange.fetchOHLCV(symbol, timeframe, since);
        let firstTimestampOnExchanger = exchange.safeInteger(
          exchange.safeValue(ohlcvs, 0),
          0
        );
        if (firstTimestampOnExchanger < firstTimestamp) {
          db.dropTable(exchangersymbol);
        } else {
          since = lastTimestamp + 1;
        }
      } else if (lastTimestamp !== null && lastTimestamp > since) {
        since = lastTimestamp + 1;
      }
      const timeoutFunc = async () => {
        if (end !== null && since > end) {
          resolve(true);
          return;
        }
        let response = await fetchOHLCVSince(
          exchange,
          symbol,
          timeframe,
          since
        );
        if (response.ohlcvs.length > 0) {
          try {
            db.insertCandles(exchangersymbol, response.ohlcvs);
          } catch (error) {
            console.error(error);
          }
          since = response.lastTimestamp + 1;
          setTimeout(timeoutFunc, 100);
        } else {
          resolve(true);
        }
      };
      setTimeout(timeoutFunc, 10);
    })();
  });
};

const fetchOHLCVSince = async (exchange, symbol, timeframe, since) => {
  try {
    const ohlcvs = await exchange.fetchOHLCV(symbol, timeframe, since);
    const firstTimestamp = exchange.safeInteger(
      exchange.safeValue(ohlcvs, 0),
      0
    );
    const lastTimestamp = exchange.safeInteger(
      exchange.safeValue(ohlcvs, ohlcvs.length - 1),
      0
    );
    if (ohlcvs.length > 0) {
      console.log(
        new Date().toLocaleString(),
        symbol,
        timeframe,
        "fetched",
        ohlcvs.length,
        "candles since",
        exchange.iso8601(firstTimestamp),
        "till",
        exchange.iso8601(lastTimestamp)
      );
    }
    return { symbol, lastTimestamp, ohlcvs };
  } catch (e) {
    console.error(exchange.id, e.message);
    if (
      e instanceof ccxt.RateLimitExceeded ||
      e instanceof ccxt.ExchangeNotAvailable
    ) {
      const oldRateLimit = exchange.rateLimit;
      exchange.rateLimit = oldRateLimit * 2;
      console.log(
        `${exchange.id} Changing rate limit from ${oldRateLimit} to ${exchange.rateLimit}`
      );
    }
    await new Promise((r) => {
      setTimeout(r, 1000);
    });
    const response = await fetchOHLCVSince(exchange, symbol, timeframe, since);
    return response;
  }
};
