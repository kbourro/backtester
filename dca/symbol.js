import { getAllDataInRangeLimit } from "../db/sql.js";
export default async ({ config, setups, symbol }) => {
  let results = [];
  for (let setupIndex = 0; setupIndex < setups.length; setupIndex++) {
    let fromTimestamp = new Date(config.from).getTime();
    const toTimestamp = new Date(config.to).getTime();
    const setup = setups[setupIndex];
    const tradeTemplate = {
      open: null,
      close: null,
      deviationsUsed: 0,
      startTimestamp: null,
      endTimestamp: null,
      profit: 0,
      tpPrice: null,
      soPrices: [],
    };
    let trade = { ...tradeTemplate };
    const trades = [];
    let lastClosePrice = 0;
    while (true) {
      let ohlcvs = getAllDataInRangeLimit(
        symbol,
        fromTimestamp,
        toTimestamp,
        10000
      );
      if (ohlcvs.length <= 0) {
        if (trade.open !== null) {
          if (trade.endTimestamp === null) {
            trade.endTimestamp = toTimestamp;
          }
          if (trade.close === null) {
            trade.close = lastClosePrice;
          }
          trades.push({ ...trade });
        }
        break;
      }
      for (let dataIndex = 0; dataIndex < ohlcvs.length; dataIndex++) {
        const ohlcv = ohlcvs[dataIndex];
        lastClosePrice = ohlcv.close;
        if (trade.open === null) {
          trade.open = ohlcv.open;
          trade.tpPrice =
            (trade.open * setup.requiredChange[0]) / 100 + trade.open;
          trade.startTimestamp = ohlcv.timestamp;
          for (
            let deviationsIndex = 1;
            deviationsIndex < setup.deviations.length;
            deviationsIndex++
          ) {
            const deviation = setup.deviations[deviationsIndex];
            trade.soPrices.push(trade.open - (trade.open * deviation) / 100);
          }
        }
        if (ohlcv.high >= trade.tpPrice) {
          trade.close = trade.tpPrice;
          trade.endTimestamp = ohlcv.timestamp;
          trade.profit =
            (setup.totalVolume[trade.deviationsUsed] * setup.tp) / 100;
          trades.push({ ...trade });
          trade = { ...tradeTemplate };
          trade.soPrices = [];
        } else {
          const deviationsUsed = trade.deviationsUsed;
          for (
            let soPricesIndex = deviationsUsed;
            soPricesIndex < trade.soPrices.length;
            soPricesIndex++
          ) {
            const soPrice = trade.soPrices[soPricesIndex];
            if (ohlcv.low <= soPrice) {
              // We use soPricesIndex + 1 soPricesIndex table has a field lower than others. All other tables contains BO order info too.
              trade.tpPrice =
                (soPrice * setup.requiredChange[soPricesIndex + 1]) / 100 +
                soPrice;
              trade.deviationsUsed++;
            }
          }
        }
      }
      fromTimestamp = ohlcvs[ohlcvs.length - 1].timestamp + 1;
    }
    let totalProfit = 0;
    let deviationsUsed = 0;
    let maxDeal = 0;
    let upnl = 0;
    for (let tradesIndex = 0; tradesIndex < trades.length; tradesIndex++) {
      const trade = trades[tradesIndex];
      totalProfit += trade.profit;
      deviationsUsed = Math.max(deviationsUsed, trade.deviationsUsed);
      maxDeal = Math.max(
        maxDeal,
        (trade.endTimestamp - trade.startTimestamp) / 1000 / 60 / 60
      );
      if (trade.close === null) {
        upnl = trade.totalVolume[trade.deviationsUsed];
      }
    }
    results.push({
      deviationsUsed,
      totalProfit: parseFloat(
        ((totalProfit / setup.maxAmount) * 100).toFixed(2)
      ),
      totalTrades: trades.length,
      maxDeal: Math.round(maxDeal),
      setup,
    });
  }
  console.log(`Symbol ${symbol}`);
  console.log(`Start date ${config.from} - End date ${config.to}`);
  // results.forEach((result) => {
  //   console.log(`Max deviations used ${result.deviationsUsed}`);
  //   console.log(`Total profits ${result.totalProfit}%`);
  //   console.log(`Total trades ${result.totalTrades}`);
  // });
  let tableToPrint = [];
  results.forEach((result) => {
    tableToPrint.push({
      "Total Profit %": result.totalProfit,
      "Deviations Used": result.deviationsUsed,
      "Total Trades": result.totalTrades,
      "Max Deal (h)": result.maxDeal,
      "Last SO Required change": parseFloat(
        result.setup.requiredChange[
          result.setup.requiredChange.length - 1
        ].toFixed(2)
      ),
      "Total volume": Math.round(
        result.setup.totalVolume[result.setup.totalVolume.length - 1]
      ),
      tp: result.setup.tp,
      bo: result.setup.bo,
      so: result.setup.so,
      sos: result.setup.sos,
      os: result.setup.os,
      ss: result.setup.ss,
      mstc: result.setup.mstc,
    });
  });
  console.table(tableToPrint);
  console.log(`---------------------------------------------`);
  return { symbol, startDate: config.from, endDate: config.to, results };
};
