import fs from "fs";
//import PQueue from "p-queue";
//import { getAllDataInRangeLimit } from "../db/sql.js";
import { getAllDataInRange } from "../db/sql.js";
//let tempCompleted = 0;
//const queue = new PQueue({ concurrency: 2 });
const ohlcvsGlobal = new Map();
const run = ({ config, setup, symbol, id, exchanger }) => {
  return new Promise((resolve) => {
    const exchangersymbol = exchanger + "" + symbol;
    let fromTimestamp = new Date(config.from).getTime();
    const toTimestamp = new Date(config.to).getTime();
    let mstcDir = `./results/${exchanger}${symbol
      .replace("/", "")
      .toLowerCase()}/${fromTimestamp}${toTimestamp}/${setup.mstc}`;
    if (!fs.existsSync(mstcDir)) {
      fs.mkdirSync(mstcDir, { recursive: true });
    }
    let finalFile = `${mstcDir}/${setup.tp}${setup.bo}${setup.so}${setup.sos}${setup.os}${setup.ss}${setup.sl}.json`;
    if (fs.existsSync(finalFile)) {
      try {
        let response = JSON.parse(fs.readFileSync(finalFile));
        if (response.upnl === undefined || response.upnl === null) {
          fs.unlinkSync(finalFile);
          response = null;
        } else {
          if (response.setup.name !== setup.name) {
            response.setup.name = setup.name;
          }
          if (response.exchanger === undefined) {
            response.exchanger = exchanger;
          }
          resolve(response);
          return;
        }
      } catch (error) {
        console.error("Cache file is corrupted. Deleting it.");
        fs.unlinkSync(finalFile);
        response = null;
      }
    }
    const ohlcvsKey = `${exchangersymbol}${fromTimestamp}${toTimestamp}`;
    if (!ohlcvsGlobal.has(ohlcvsKey)) {
      ohlcvsGlobal.set(
        ohlcvsKey,
        getAllDataInRange(exchangersymbol, fromTimestamp, toTimestamp)
      );
    }
    const ohlcvs = ohlcvsGlobal.get(ohlcvsKey);
    const tradeTemplate = {
      open: null,
      close: null,
      deviationsUsed: 0,
      startTimestamp: null,
      endTimestamp: null,
      averageBuyPrice: 0,
      tpPrice: null,
      upnl: 0,
      soPrices: [],
      slPrice: null,
      slHit: false,
      lastSOPrice: null,
      requiredChangeForTP: setup.requiredChange[0],
    };
    let balance = setup.maxAmount;
    let trade = { ...tradeTemplate };
    let trades = [];
    let lastClosePrice = 0;
    let maxDrawdown = 0;
    // process.send({ log: setup });
    let ohlcvsLength = ohlcvs.length;
    let ohlcvsLastDataIndex = ohlcvsLength - 1;
    for (let dataIndex = 0; dataIndex < ohlcvsLength; dataIndex++) {
      const ohlcv = ohlcvs[dataIndex];
      lastClosePrice = ohlcv.close;
      if (trade.open === null) {
        trade.open = ohlcv.open;
        trade.averageBuyPrice = trade.open;
        trade.slPrice = trade.open - (trade.open * setup.sl) / 100;
        trade.tpPrice =
          (trade.open * setup.requiredChange[0]) / 100 + trade.open;
        trade.startTimestamp = ohlcv.timestamp;
        trade.upnl = 0;
        trade.soPrices = setup.deviations
          .slice(1)
          .map((deviation) => trade.open - (trade.open * deviation) / 100);
      }
      let maxDrawdownCalc = percentageChange(trade.open, lastClosePrice);
      if (maxDrawdown > maxDrawdownCalc) {
        maxDrawdown = maxDrawdownCalc;
      }
      if (ohlcv.high >= trade.tpPrice) {
        trade.upnl = 0;
        trade.close = trade.tpPrice;
        trade.endTimestamp = ohlcv.timestamp;
        balance =
          balance + (setup.totalVolume[trade.deviationsUsed] * setup.tp) / 100;
        trades.push({ ...trade });
        // process.send({ log: trade });
        // process.send({ log: balance })
        trade = { ...tradeTemplate };
        trade.soPrices = [];
      } else {
        const deviationsUsed = trade.deviationsUsed;
        const soPricesLength = trade.soPrices.length;
        let i = deviationsUsed;
        while (i < soPricesLength) {
          const soPrice = trade.soPrices[i];
          if (ohlcv.low <= soPrice) {
            const requiredChange = setup.requiredChange[i + 1];
            // We use soPricesIndex + 1 soPricesIndex table has a field lower than others. All other tables contains BO order info too.
            trade.tpPrice = (soPrice * requiredChange) / 100 + soPrice;
            trade.lastSOPrice = soPrice;
            trade.requiredChangeForTP = requiredChange;
            trade.averageBuyPrice =
              (soPrice * (requiredChange - setup.tp)) / 100 + soPrice;
            trade.deviationsUsed++;
            i++;
          } else {
            break;
          }
        }
        if (setup.sl !== 0 && trade.slPrice >= ohlcv.low) {
          trade.upnl = 0;
          trade.slHit = true;
          trade.close = trade.slPrice;
          trade.endTimestamp = ohlcv.timestamp;
          balance = percentageIncreaseOrDecrease(
            balance,
            percentageChange(trade.averageBuyPrice, trade.slPrice)
          );
          trades.push({ ...trade });
          // process.send({ log: trade });
          // process.send({ log: balance });
          trade = { ...tradeTemplate };
          trade.soPrices = [];
          if (balance <= 0 || balance <= setup.maxAmount) {
            break;
          }
        }
        if (dataIndex === ohlcvsLastDataIndex) {
          trade.endTimestamp = ohlcv.timestamp;
          trade.close = lastClosePrice;
          trade.upnl =
            (setup.totalVolume[trade.deviationsUsed] *
              (((trade.close - trade.averageBuyPrice) / trade.averageBuyPrice) *
                100)) /
            setup.maxAmount;
          trades.push({ ...trade });
        }
      }
    }
    let deviationsUsed = 0;
    let maxDeal = 0;
    let longerTrade = null;
    let slHitCounter = 0;
    let totalTrades = trades.length;
    let lastTradeIndex = trades.length - 1;
    for (let tradesIndex = 0; tradesIndex < totalTrades; tradesIndex++) {
      const trade = trades[tradesIndex];
      const tradeTime =
        (trade.endTimestamp - trade.startTimestamp) / 1000 / 60 / 60;
      deviationsUsed = Math.max(deviationsUsed, trade.deviationsUsed);
      if (tradeTime >= maxDeal) {
        maxDeal = tradeTime;
        longerTrade = trade;
      }
      if (trade.slHit) {
        slHitCounter++;
      }
    }
    let lastTrade = trades[lastTradeIndex];
    if (
      trades[lastTradeIndex] === undefined ||
      trades[lastTradeIndex].upnl === undefined
    ) {
      console.log(symbol);
    }
    let response = {
      deviationsUsed,
      totalProfit: parseFloat(
        percentageChange(setup.maxAmount, balance).toFixed(2)
      ),
      totalTrades: trades.filter((trade) => trade.upnl === 0).length,
      maxDeal: Math.round(maxDeal),
      upnl: trades[lastTradeIndex].upnl,
      slHitCounter,
      maxDrawdown: maxDrawdown.toFixed(2),
      longerTrade,
      lastTrade,
      lastTradeTime: Math.round(
        (lastTrade.endTimestamp - lastTrade.startTimestamp) / 1000 / 60 / 60
      ),
      setup,
      symbol,
      exchanger,
    };
    fs.writeFileSync(finalFile, JSON.stringify(response));
    trades = [];
    resolve(response);
    return;
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

// Function that calculates percentage change between two numbers including negative values
const percentageChange = (start, end) => {
  return ((end - start) / start) * 100;
};

// Function that reduce or increase a number by a percentage
const percentageIncreaseOrDecrease = (number, percentage) => {
  return number + (number * percentage) / 100;
};

function splitNumberByWeight(originalNumber, bo, so) {
  // Calculate total weight of the two numbers
  const totalWeight = bo + so;

  // Calculate weight of each number relative to the total weight
  const weight1 = bo / totalWeight;
  const weight2 = so / totalWeight;

  // Calculate the values of the two numbers based on weight
  const value1 = originalNumber * weight1;
  const value2 = originalNumber * weight2;

  // Round the values to two decimal places
  const roundedValue1 = Math.round(value1 * 100) / 100;
  const roundedValue2 = Math.round(value2 * 100) / 100;

  // Return an object with the two calculated values
  return { bo: roundedValue1, so: roundedValue2 };
}

function calculateNewOrders(
  baseOrder,
  safetyOrder,
  safetyOrderVolumeScale,
  maxSafetyOrdersCount,
  additionalInvestment
) {
  // Calculate current total invested amount
  let totalInvestedAmount = baseOrder;
  for (let i = 1; i <= maxSafetyOrdersCount; i++) {
    totalInvestedAmount +=
      safetyOrder * Math.pow(safetyOrderVolumeScale, i - 1);
  }

  // Calculate new total invested amount
  const newTotalInvestedAmount = totalInvestedAmount + additionalInvestment;

  // Calculate scaling factor
  const scalingFactor = newTotalInvestedAmount / totalInvestedAmount;

  // Calculate new base order and safety order amounts
  const newBaseOrder = baseOrder * scalingFactor;
  const newSafetyOrder = safetyOrder * scalingFactor;

  // Return the new base order and safety order amounts
  return {
    newBaseOrder: Math.floor(newBaseOrder),
    newSafetyOrder: Math.floor(newSafetyOrder),
  };
}
