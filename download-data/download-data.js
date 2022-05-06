import * as db from "../db/sql.js";

export default (exchange, symbol, timeframe, since, end) => {
  symbol = symbol.toUpperCase();
  return new Promise((resolve, reject) => {
    (async () => {
      let firstTimestamp = db.getFirstTimestamp(symbol);
      let lastTimestamp = db.getLastTimestamp(symbol);
      if (firstTimestamp !== null && since < firstTimestamp) {
        const ohlcvs = await exchange.fetchOHLCV(symbol, timeframe, since);
        let test = exchange.safeInteger(exchange.safeValue(ohlcvs, 0), 0);
        console.log(test);
        process.exit();
        // if (response.ohlcvs.length > 0 && ) {

        // }
        db.dropTable(symbol);
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
            db.insertCandles(response.symbol, response.ohlcvs);
          } catch (error) {
            //ignore
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
        Date.now(),
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
    console.log(e.constructor.name, e.message);
  }
};
