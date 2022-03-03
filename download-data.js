const sql = require("./sql");

const download = (exchange, symbol, timeframe, since) => {
  return new Promise((resolve, reject) => {
    let lastTimestamp = sql.getLastTimestamp(symbol);
    if (lastTimestamp !== null && lastTimestamp > since) {
      since = lastTimestamp + 1;
    }
    const timeoutFunc = async () => {
      let response = await fetchOHLCVSince(exchange, symbol, timeframe, since);
      if (response.ohlcvs.length > 0) {
        sql.insertCandles(response.symbol, response.ohlcvs);
        since = response.lastTimestamp + 1;
        setTimeout(timeoutFunc, 100);
      } else {
        resolve(true);
      }
    };
    setTimeout(timeoutFunc, 100);
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

module.exports = download;
