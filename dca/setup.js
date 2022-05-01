import PQueue from "p-queue";
import { getAllDataInRangeLimit } from "../db/sql.js";
const queue = new PQueue({ concurrency: 1 });
const run = ({ config, setup, symbol }) => {
  return new Promise((resolve) => {
    let fromTimestamp = new Date(config.from).getTime();
    const toTimestamp = new Date(config.to).getTime();
    const tradeTemplate = {
      open: null,
      close: null,
      deviationsUsed: 0,
      startTimestamp: null,
      endTimestamp: null,
      profit: 0,
      averageBuyPrice: 0,
      tpPrice: null,
      upnl: 0,
      soPrices: [],
      lastSOPrice: null,
      requiredChangeForTP: setup.requiredChange[0],
    };
    let trade = { ...tradeTemplate };
    let trades = [];
    let lastClosePrice = 0;
    const runBacktestsInAllTimestamps = () => {
      let keepRunning = true;
      let ohlcvs = getAllDataInRangeLimit(
        symbol,
        fromTimestamp,
        toTimestamp,
        10000
      );
      if (ohlcvs.length <= 0) {
        keepRunning = false;
        if (trade.open !== null) {
          if (trade.endTimestamp === null) {
            trade.endTimestamp = toTimestamp;
          }
          if (trade.close === null) {
            trade.close = lastClosePrice;
            trade.upnl =
              (setup.totalVolume[trade.deviationsUsed] *
                (((trade.close - trade.averageBuyPrice) /
                  trade.averageBuyPrice) *
                  100)) /
              setup.maxAmount;
          }
          trades.push({ ...trade });
        }
      } else {
        for (let dataIndex = 0; dataIndex < ohlcvs.length; dataIndex++) {
          const ohlcv = ohlcvs[dataIndex];
          lastClosePrice = ohlcv.close;
          if (trade.open === null) {
            if (dataIndex === 0) {
              trade.open = ohlcv.open;
            } else {
              trade.open = ohlcvs[dataIndex - 1].close;
            }
            trade.averageBuyPrice = trade.open;
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
            trade.upnl = 0;
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
                trade.lastSOPrice = soPrice;
                trade.requiredChangeForTP =
                  setup.requiredChange[soPricesIndex + 1];
                trade.averageBuyPrice =
                  (soPrice *
                    (setup.requiredChange[soPricesIndex + 1] - setup.tp)) /
                    100 +
                  soPrice;
                trade.deviationsUsed++;
              } else {
                break;
              }
            }
          }
        }
        fromTimestamp = ohlcvs[ohlcvs.length - 1].timestamp + 1;
      }
      if (!keepRunning) {
        let totalProfit = 0;
        let deviationsUsed = 0;
        let maxDeal = 0;
        let longerTrade = null;
        let totalTrades = trades.length;
        for (let tradesIndex = 0; tradesIndex < totalTrades; tradesIndex++) {
          const trade = trades[tradesIndex];
          const tradeTime =
            (trade.endTimestamp - trade.startTimestamp) / 1000 / 60 / 60;
          totalProfit += trade.profit;
          deviationsUsed = Math.max(deviationsUsed, trade.deviationsUsed);
          if (tradeTime >= maxDeal) {
            maxDeal = tradeTime;
            longerTrade = trade;
          }
        }
        let lastTrade = trades[trades.length - 1];

        process.send({
          deviationsUsed,
          totalProfit: parseFloat(
            ((totalProfit / setup.maxAmount) * 100).toFixed(2)
          ),
          totalTrades: trades.filter((trade) => trade.upnl === 0).length,
          maxDeal: Math.round(maxDeal),
          upnl: trades[trades.length - 1].upnl,
          longerTrade,
          lastTrade,
          lastTradeTime: Math.round(
            (lastTrade.endTimestamp - lastTrade.startTimestamp) / 1000 / 60 / 60
          ),
          setup,
          symbol,
        });
        trades = [];
        resolve();
      } else {
        setTimeout(runBacktestsInAllTimestamps, 10);
      }
    };
    runBacktestsInAllTimestamps();
  });
};

process.on("message", function (message) {
  queue.add(() => run({ ...message }));
});
process.send("started");
