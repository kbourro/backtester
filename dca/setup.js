import fs from "fs";
//import PQueue from "p-queue";
import { getAllDataInRangeLimit } from "../db/sql.js";
//let tempCompleted = 0;
//const queue = new PQueue({ concurrency: 2 });
const run = ({ config, setup, symbol, id }) => {
  return new Promise((resolve) => {
    let fromTimestamp = new Date(config.from).getTime();
    const toTimestamp = new Date(config.to).getTime();
    let mstcDir = `./results/${symbol
      .replace("/", "")
      .toLowerCase()}/${fromTimestamp}${toTimestamp}/${setup.mstc}`;
    if (!fs.existsSync(mstcDir)) {
      fs.mkdirSync(mstcDir, { recursive: true });
    }
    let finalFile = `${mstcDir}/${setup.tp}${setup.bo}${setup.so}${setup.sos}${setup.os}${setup.ss}.json`;
    if (fs.existsSync(finalFile)) {
      let response = JSON.parse(fs.readFileSync(finalFile));
      if (response.setup.name !== setup.name) {
        response.setup.name = setup.name;
      }
      resolve(response);
      return;
    }
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
      let ohlcvsLength = ohlcvs.length;
      if (ohlcvsLength <= 0) {
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
        for (let dataIndex = 0; dataIndex < ohlcvsLength; dataIndex++) {
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
        let response = {
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
        };
        fs.writeFileSync(finalFile, JSON.stringify(response));
        trades = [];
        resolve(response);
        return;
      } else {
        runBacktestsInAllTimestamps();
      }
    };
    runBacktestsInAllTimestamps();
  });
};

const runMiltiple = async (tasks) => {
  let results = [];
  let totalTasks = tasks.length;
  for (let index = 0; index < totalTasks; index++) {
    const task = tasks[index];
    results.push(await run({ ...task }));
    //tempCompleted++;
  }
  return results;
};

process.on("message", function (message) {
  if (Array.isArray(message)) {
    runMiltiple(message).then((response) => {
      process.send({ multiple: response });
    });
  } else {
    run({ ...message }).then((response) => {
      process.send({ single: response });
    });
  }

  //queue.add(() => run({ ...message }));
});

process.send("started");
// const updateCompletedCounter = () => {
//   if (tempCompleted > 0) {
//     process.send({ completed: tempCompleted });
//     tempCompleted = 0;
//   }
//   setTimeout(updateCompletedCounter, 1000);
// };
// setTimeout(updateCompletedCounter, 1000);
