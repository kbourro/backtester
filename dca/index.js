import PQueue from "p-queue";
import downloadData from "../download-data/index.js";
import symbolBacktest from "./symbol.js";
import prepareSetups from "./prepareSetups.js";
import config from "../config.js";
import { insertProperty } from "../utils.js";

(async () => {
  const symbols = Object.values(config.symbols);
  const setups = prepareSetups(Object.values(config.setups));
  const from = config.from;
  const to = config.to;
  const exchanger = config.exchanger;
  const queue = new PQueue({ concurrency: 10 });
  let promises = symbols.map((symbol) =>
    queue.add(() => downloadData(exchanger, symbol, from, to))
  );
  await Promise.all(promises);
  promises = [];
  console.time("All backtests completed");
  promises = symbols.map((symbol) =>
    queue.add(() => symbolBacktest({ config, setups, symbol }))
  );
  const results = await Promise.all(promises);
  let final = [];
  results.forEach((symbolResults) => {
    let temp = [];
    symbolResults.results.forEach((result) => {
      temp.push({
        Name: result.setup.name,
        "ROI %": parseFloat((result.totalProfit + result.upnl).toFixed(2)),
        "ROI Without Upnl %": result.totalProfit,
        "Upnl %": parseFloat(result.upnl.toFixed(2)),
        DU: result.deviationsUsed,
        "Coverage %": result.setup.maxDeviation,
        "Total Trades": result.totalTrades,
        "MD (h)": result.maxDeal,
        "RC %": parseFloat(
          result.setup.requiredChange[
            result.setup.requiredChange.length - 1
          ].toFixed(2)
        ),
        TV: Math.round(
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
    final[symbolResults.symbol] = temp;
  });
  let allSetups = [];
  if (Object.keys(final).length > 0) {
    Object.keys(final).forEach((symbol) => {
      let setupsResults = final[symbol];
      for (let index = 0; index < setupsResults.length; index++) {
        const result = setupsResults[index];
        if (
          allSetups[index] === undefined ||
          allSetups[index] === null ||
          allSetups[index].length <= 0
        ) {
          allSetups[index] = {
            ...result,
          };
          allSetups[index] = {
            ...insertProperty(
              allSetups[index],
              "Profitable Pairs",
              result["ROI %"] >= 0 ? 1 : 0,
              4
            ),
          };
        } else {
          allSetups[index]["ROI %"] = parseFloat(
            (allSetups[index]["ROI %"] + result["ROI %"]).toFixed(2)
          );
          allSetups[index]["ROI Without Upnl %"] =
            allSetups[index]["ROI Without Upnl %"] +
            result["ROI Without Upnl %"];
          allSetups[index]["Upnl %"] =
            allSetups[index]["Upnl %"] + result["Upnl %"];
          allSetups[index]["Total Trades"] =
            allSetups[index]["Total Trades"] + result["Total Trades"];
          allSetups[index]["MD (h)"] = Math.max(
            allSetups[index]["MD (h)"],
            result["MD (h)"]
          );
          allSetups[index]["Profitable Pairs"] =
            allSetups[index]["Profitable Pairs"] +
            (result["ROI %"] >= 0 ? 1 : 0);
        }
      }
    });
    console.log(`Start date ${from} - End date ${to}`);
    console.log(`---------------------------------------------`);
    console.log("All symbols");
    console.table(allSetups);
    console.log(`---------------------------------------------`);
    Object.keys(final).forEach((symbol) => {
      console.log(`Symbol ${symbol}`);
      console.table(final[symbol]);
      console.log(`---------------------------------------------`);
    });
    console.log(
      "ROI = Total unrealized profit and loss if you close all deals at the end of backtest from initial amount"
    );
    console.log("ROI Without Upnl = Profit from initial amount without upnl");
    console.log("Upnl = Unrealized profit and loss from initial amount");
    console.log("DU (Deviations used) = Max safety orders used");
    console.log("MD (Max deal) = Max hours a deal took");
    console.log(
      "RC (Required change) = Required change from last safety order"
    );
    console.log(
      "TV (Total volume) = Minimum amount required per coin to start the bot"
    );
    console.log(`---------------------------------------------`);
  }
  console.timeEnd("All backtests completed");
})();
