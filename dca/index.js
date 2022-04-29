import PQueue from "p-queue";
import Exceljs from "exceljs";
import * as fs from "fs";
import path from "path";
import config from "../config.js";
import downloadData from "../download-data/index.js";
import symbolBacktest from "./symbol.js";
import prepareSetups from "./prepareSetups.js";
import { insertProperty, roundToTwo } from "../utils.js";

(async () => {
  const symbols = Object.values(config.symbols);
  const setups = prepareSetups(Object.values(config.setups), config);
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
        "ROI %": roundToTwo(result.totalProfit + result.upnl),
        "ROI Without Upnl %": roundToTwo(result.totalProfit),
        "Upnl %": roundToTwo(result.upnl),
        DU: result.deviationsUsed,
        "Coverage %": result.setup.maxDeviation,
        "Total Trades": result.totalTrades,
        "MD (h)": result.maxDeal,
        "RC %": roundToTwo(
          result.setup.requiredChange[result.setup.requiredChange.length - 1]
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
            ...insertProperty(
              { ...result },
              "Profitable Pairs",
              result["ROI %"] >= 0 ? 1 : 0,
              4
            ),
          };
        } else {
          allSetups[index]["ROI %"] =
            allSetups[index]["ROI %"] + result["ROI %"];
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
          allSetups[index]["DU"] = Math.max(
            allSetups[index]["DU"],
            result["DU"]
          );
          allSetups[index]["Profitable Pairs"] =
            allSetups[index]["Profitable Pairs"] +
            (result["ROI %"] >= 0 ? 1 : 0);
        }
      }
    });
    for (let index = 0; index < allSetups.length; index++) {
      allSetups[index]["ROI %"] = roundToTwo(
        allSetups[index]["ROI %"] / config.symbols.length
      );
      allSetups[index]["ROI Without Upnl %"] = roundToTwo(
        allSetups[index]["ROI Without Upnl %"] / config.symbols.length
      );
      allSetups[index]["Upnl %"] = roundToTwo(
        allSetups[index]["Upnl %"] / config.symbols.length
      );
    }
    console.log(`Start date ${from} - End date ${to}`);
    console.log(`Symbols ${config.symbols.join(", ")}`);
    console.log(`---------------------------------------------`);
    console.log("All symbols");
    console.table(allSetups);
    console.log(`---------------------------------------------`);
    Object.keys(final).forEach((symbol) => {
      console.log(`Symbol ${symbol}`);
      console.table(final[symbol]);
      console.log(`---------------------------------------------`);
    });
    getFooterInfo().forEach((info) => console.log(info));
    console.log(`---------------------------------------------`);
    console.timeEnd("All backtests completed");
    console.log("Writing to excel file");
    const workbook = new Exceljs.Workbook();
    const dateFrom = new Date(from);
    const dateTo = new Date(to);
    let worksheet = workbook.addWorksheet("All symbols", {
      views: [{ state: "frozen", ySplit: 5 }],
    });
    worksheet.getCell("A1").value = `Start`;
    worksheet.getCell("B1").value = from;
    worksheet.getCell("A2").value = `End`;
    worksheet.getCell("B2").value = to;
    worksheet.getCell("A3").value = `Total pairs`;
    worksheet.getCell("B3").value = symbols.length;
    worksheet.getRow(5).values = Object.keys(allSetups[0]);
    let columns = Object.keys(allSetups[0]).map((column) => {
      return {
        key: column,
      };
    });
    worksheet.columns = columns;
    allSetups.forEach((row) => worksheet.addRow(Object.values(row)));
    worksheet.columns.forEach(function (column, i) {
      var maxLength = 0;
      column["eachCell"]({ includeEmpty: true }, function (cell) {
        if (cell.row >= 5) {
          var columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
          cell.style.alignment = { horizontal: "center" };
          cell.style.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength;
    });
    let count = worksheet.rowCount + 2;
    getFooterInfo().forEach((info) => {
      worksheet.getCell(`A${count}`).value = info;
      worksheet.mergeCells(`A${count}:R${count}`);
      count = worksheet.rowCount + 1;
    });
    Object.keys(final).forEach((symbol) => {
      worksheet = workbook.addWorksheet(symbol.replace("/", "-"), {
        views: [{ state: "frozen", ySplit: 1 }],
      });
      columns = Object.keys(final[symbol][0]).map((column) => {
        return {
          header: column,
          key: column,
        };
      });
      worksheet.columns = columns;
      final[symbol].forEach((row) => worksheet.addRow(Object.values(row)));
      worksheet.columns.forEach(function (column, i) {
        var maxLength = 0;
        column["eachCell"]({ includeEmpty: true }, function (cell) {
          var columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
          cell.style.alignment = { horizontal: "center" };
          cell.style.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
        column.width = maxLength < 10 ? 10 : maxLength;
      });
      let count = worksheet.rowCount + 2;
      getFooterInfo().forEach((info) => {
        worksheet.getCell(`A${count}`).value = info;
        worksheet.getCell(`A${count}`).style.border = {};
        worksheet.mergeCells(`A${count}:R${count}`);
        count = worksheet.rowCount + 1;
      });
    });
    let file = path.resolve(
      `./results`,
      `${dateFrom.getFullYear()}-${
        dateFrom.getMonth() + 1
      }-${dateFrom.getDate()} - ${dateTo.getFullYear()}-${
        dateTo.getMonth() + 1
      }-${dateTo.getDate()} ${Math.round(new Date().getTime() / 100)}.xlsx`
    );
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
    await workbook.xlsx.writeFile(file);
  }
  console.log("Finished.");
  process.exit(0);
})();

const getFooterInfo = () => {
  return [
    "ROI = Total unrealized profit and loss if you close all deals at the end of backtest from initial amount",
    "ROI Without Upnl = Profit from initial amount without upnl",
    "Upnl = Unrealized profit and loss from initial amount",
    "DU (Deviations used) = Max safety orders used",
    "MD (Max deal) = Max hours a deal took",
    "RC (Required change) = Required change from last safety order",
    "TV (Total volume) = Minimum amount required per coin to start the bot",
  ];
};
