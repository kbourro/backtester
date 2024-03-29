import PQueue from "p-queue";
import Exceljs from "exceljs";
import * as fs from "fs";
import path from "path";
import url from "url";
import { spawn } from "child_process";
if (!process.argv[2]) {
  console.error("Config argument is missing");
  process.exit(0);
}
import downloadData from "../download-data/index.js";
import * as symbolBacktest from "./symbol.js";
import prepareSetups from "./prepareSetups.js";
import { insertProperty, roundToTwo, calculateProximity } from "../utils.js";
process
  .on("unhandledRejection", (reason, _) => {
    console.log("unhandledRejection", reason);
    process.exit(1);
  })
  .on("uncaughtException", (err) => {
    console.log("uncaughtException", err);
    process.exit(1);
  });

const queue = new PQueue({ concurrency: 50, autoStart: false });

(async () => {
  const args = process.argv.slice(3);
  const config = (
    await import(url.pathToFileURL(path.resolve(process.argv[2])).href)
  ).default;
  const exchangers = Object.getOwnPropertyNames(config.symbols);
  let totalSymbols = 0;
  const allSymbols = [];
  exchangers.forEach((exchanger) => {
    config.symbols[exchanger].forEach((symbol) => {
      allSymbols.push(symbol);
    });
    totalSymbols += config.symbols[exchanger].length;
  });
  const setups = await prepareSetups(Object.values(config.setups), config);
  const from = config.from;
  const to = config.to;
  console.log(
    `Test started for ${
      setups.length
    } setups and ${totalSymbols} symbols. Total backtests ${
      setups.length * totalSymbols
    }`
  );
  console.time("All backtests completed");
  let final = [];
  let promises = [];
  for (let index = 0; index < exchangers.length; index++) {
    const exchanger = exchangers[index];
    const symbols = config.symbols[exchanger];
    for (let index = 0; index < symbols.length; index++) {
      const symbol = symbols[index];
      promises.push(queue.add(() => downloadData(exchanger, symbol, from, to)));
      await symbolBacktest.add({ config, setups, symbol, exchanger });
      final[`${exchanger}-${symbol}`] = [];
    }
  }
  queue.start();
  await Promise.all(promises);
  const results = await symbolBacktest.start();
  results.forEach((result) => {
    let lastTradeStart = new Date(result.lastTrade.startTimestamp);
    let lastTradeEnd = new Date(result.lastTrade.endTimestamp);
    let longerTradeStart = new Date(result.longerTrade.startTimestamp);
    let longerTradeEnd = new Date(result.longerTrade.endTimestamp);
    const exchangersymbol = `${result.exchanger}-${result.symbol}`;

    if (
      result.totalProfit === undefined ||
      result.totalProfit === null ||
      isNaN(result.totalProfit)
    ) {
      console.log("totalProfit", result.totalProfit);
    }
    if (
      result.upnl === undefined ||
      result.upnl === null ||
      isNaN(result.upnl)
    ) {
      console.log("upnl", result.upnl);
    }
    const temp = roundToTwo(result.totalProfit + result.upnl);
    if (temp === undefined || temp === null || isNaN(temp)) {
      console.log("temp", temp);
    }
    final[exchangersymbol].push({
      Name: result.setup.name,
      "ROI %": roundToTwo(result.totalProfit + result.upnl),
      "Max ROI %": roundToTwo(result.totalProfit + result.upnl),
      "ROI Without Upnl %": roundToTwo(result.totalProfit),
      "Upnl %": roundToTwo(result.upnl),
      DU: result.deviationsUsed,
      "SL hit": result.slHitCounter,
      "Max drawdown": Number(result.maxDrawdown),
      "Coverage %": result.setup.maxDeviation,
      "Total Trades": result.totalTrades,
      "MD trade started": `${longerTradeStart.getFullYear()}-${
        longerTradeStart.getMonth() + 1
      }-${longerTradeStart.getDate()}`,
      "MD trade ended": `${longerTradeEnd.getFullYear()}-${
        longerTradeEnd.getMonth() + 1
      }-${longerTradeEnd.getDate()}`,
      "MD (h)": result.maxDeal,
      "Last trade started": `${lastTradeStart.getFullYear()}-${
        lastTradeStart.getMonth() + 1
      }-${lastTradeStart.getDate()}`,
      "Last trade ended": `${lastTradeEnd.getFullYear()}-${
        lastTradeEnd.getMonth() + 1
      }-${lastTradeEnd.getDate()}`,
      "Last trade deal time (h)": result.lastTradeTime,
      "RC %": roundToTwo(
        result.setup.requiredChange[result.setup.requiredChange.length - 1]
      ),
      TV: Math.round(result.setup.initialBalance),
      tp: result.setup.tp,
      bo: result.setup.bo,
      so: result.setup.so,
      sos: result.setup.sos,
      os: result.setup.os,
      ss: result.setup.ss,
      mstc: result.setup.mstc,
      sl: result.setup.sl,
      groupid: `${result.setup.sos}${result.setup.os}${result.setup.ss}${result.setup.mstc}`,
      groupidboso: `${result.setup.sos}${result.setup.os}${result.setup.ss}${result.setup.mstc}${result.setup.bo}${result.setup.so}`,
    });
  });
  const allSetupsMap = new Map();
  if (Object.keys(final).length > 0) {
    Object.keys(final).forEach((exchangersymbol) => {
      let exchangesymbolResults = final[exchangersymbol];
      for (let index = 0; index < exchangesymbolResults.length; index++) {
        const result = exchangesymbolResults[index];
        if (!allSetupsMap.has(result.Name)) {
          allSetupsMap.set(result.Name, {
            ...insertProperty(
              (({
                "MD trade started": _deleted1,
                "MD trade ended": _deleted2,
                "Last trade started": _deleted3,
                "Last trade ended": _deleted4,
                "Last trade deal time (h)": _deleted5,
                ...o
              }) => o)(result),
              "Profitable Pairs",
              result["ROI %"] >= 0 ? 1 : 0,
              4
            ),
          });
        } else {
          const foundSetup = allSetupsMap.get(result.Name);
          foundSetup["SL hit"] = Math.max(
            foundSetup["SL hit"],
            result["SL hit"]
          );
          foundSetup["Max drawdown"] = Math.min(
            foundSetup["Max drawdown"],
            result["Max drawdown"]
          );
          foundSetup["Max ROI %"] = Math.max(
            foundSetup["Max ROI %"],
            result["Max ROI %"]
          );
          foundSetup["ROI %"] = roundToTwo(
            foundSetup["ROI %"] + result["ROI %"]
          );
          foundSetup["ROI Without Upnl %"] = roundToTwo(
            foundSetup["ROI Without Upnl %"] + result["ROI Without Upnl %"]
          );
          foundSetup["Upnl %"] = roundToTwo(
            foundSetup["Upnl %"] + result["Upnl %"]
          );
          foundSetup["Total Trades"] =
            foundSetup["Total Trades"] + result["Total Trades"];
          foundSetup["MD (h)"] = Math.max(
            foundSetup["MD (h)"],
            result["MD (h)"]
          );
          foundSetup["DU"] = Math.max(foundSetup["DU"], result["DU"]);
          foundSetup["Profitable Pairs"] =
            foundSetup["Profitable Pairs"] + (result["ROI %"] >= 0 ? 1 : 0);
        }
      }
    });
    // Convert allSetupsMap to allSetups array
    const allSetups = Array.from(allSetupsMap.values());
    const groupidMap = new Map();
    const groupidbosoMap = new Map();
    for (let index = 0; index < allSetups.length; index++) {
      const allSetup = allSetups[index];
      const temp = roundToTwo(allSetup["ROI %"] / totalSymbols);
      if (temp === undefined || temp === null || isNaN(temp)) {
        console.log("temp1", temp);
        console.log(`allSetup["ROI %"]`, allSetup["ROI %"]);
        console.log(`totalSymbols`, totalSymbols);
      }
      allSetup["ROI %"] = roundToTwo(allSetup["ROI %"] / totalSymbols);
      allSetup["ROI Without Upnl %"] = roundToTwo(
        allSetup["ROI Without Upnl %"] / totalSymbols
      );
      allSetup["Upnl %"] = roundToTwo(allSetup["Upnl %"] / totalSymbols);
      const roi = allSetup["ROI %"];
      const md = allSetup["MD (h)"];
      const maxDrawdown = allSetup["Max drawdown"];
      const coverage = allSetup["Coverage %"];
      const groupid = allSetup["groupid"];
      if (!groupidMap.has(groupid)) {
        groupidMap.set(groupid, {
          groupid: groupid,
          mdAverage: [md],
          maxRoi: roi,
          minMD: md,
          sumMD: md,
          coverageAndDrawdown: calculateProximity(maxDrawdown, coverage),
        });
      } else {
        const groupInfo = groupidMap.get(groupid);
        groupInfo.mdAverage.push(md);
        groupInfo.maxRoi = Math.max(roi, groupInfo.maxRoi);
        groupInfo.minMD = Math.min(md, groupInfo.minMD);
        groupInfo.sumMD = groupInfo.sumMD + md;
        groupInfo.coverageAndDrawdown = Math.max(
          groupInfo.coverageAndDrawdown,
          calculateProximity(maxDrawdown, coverage)
        );
      }
      const groupidboso = allSetup["groupidboso"];
      if (!groupidbosoMap.has(groupidboso)) {
        groupidbosoMap.set(groupidboso, {
          groupidboso: groupidboso,
          mdAverage: [md],
          maxRoi: roi,
          minMD: md,
          sumMD: md,
          coverageAndDrawdown: calculateProximity(maxDrawdown, coverage),
        });
      } else {
        const groupInfo = groupidbosoMap.get(groupidboso);
        groupInfo.mdAverage.push(md);
        groupInfo.maxRoi = Math.max(roi, groupInfo.maxRoi);
        groupInfo.minMD = Math.min(md, groupInfo.minMD);
        groupInfo.sumMD = groupInfo.sumMD + md;
        groupInfo.coverageAndDrawdown = Math.max(
          groupInfo.coverageAndDrawdown,
          calculateProximity(maxDrawdown, coverage)
        );
      }
    }
    groupidMap.forEach((groupInfo, _) => {
      groupInfo.mdAverage = roundToTwo(
        groupInfo.mdAverage.reduce((a, b) => a + b, 0) /
          groupInfo.mdAverage.length
      );
    });
    groupidbosoMap.forEach((groupInfo, _) => {
      groupInfo.mdAverage = roundToTwo(
        groupInfo.mdAverage.reduce((a, b) => a + b, 0) /
          groupInfo.mdAverage.length
      );
    });
    allSetups.sort(function (a, b) {
      return b["ROI %"] - a["ROI %"];
    });
    console.log(`Start date ${from} - End date ${to}`);
    console.log(`Symbols ${allSymbols.join(", ")}`);
    if (config.options.console) {
      console.log(`---------------------------------------------`);
      console.log("All symbols");
      console.table(allSetups);
      console.log(`---------------------------------------------`);
      Object.keys(final).forEach((exchangersymbol) => {
        final[exchangersymbol].sort(function (a, b) {
          return b["ROI %"] - a["ROI %"];
        });
        console.log(`Symbol ${exchangersymbol}`);
        console.table(final[exchangersymbol]);
        console.log(`---------------------------------------------`);
      });
      getFooterInfo().forEach((info) => console.log(info));
    } else {
      Object.keys(final).forEach((exchangersymbol) => {
        final[exchangersymbol].sort(function (a, b) {
          return b["ROI %"] - a["ROI %"];
        });
      });
    }
    console.log(`---------------------------------------------`);
    console.timeEnd("All backtests completed");
    console.log("Writing to excel file");
    const dateFrom = new Date(from);
    const dateTo = new Date(to);
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
    const workbook = new Exceljs.stream.xlsx.WorkbookWriter({
      filename: file,
      useStyles: true,
    });
    let worksheet = workbook.addWorksheet("All symbols", {
      views: [{ state: "frozen", ySplit: 5 }],
    });
    worksheet.getCell("A1").value = `Start`;
    worksheet.getCell("B1").value = from;
    worksheet.getCell("A2").value = `End`;
    worksheet.getCell("B2").value = to;
    worksheet.getCell("A3").value = `Total pairs`;
    worksheet.getCell("B3").value = totalSymbols;
    worksheet.getRow(5).values = Object.keys(allSetups[0]);
    let columnsLength = [];
    let sheetRow = worksheet.getRow(5);
    sheetRow.eachCell({ includeEmpty: true }, function (cell, colNumber) {
      cell.style.alignment = { horizontal: "center" };
      cell.style.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      let columnLength = cell.value ? cell.value.toString().length : 15;
      columnsLength[colNumber] = columnLength < 10 ? 10 : columnLength;
      worksheet.getColumn(colNumber).width = columnsLength[colNumber];
    });
    sheetRow.commit();
    let columns = Object.keys(allSetups[0]).map((column, i) => {
      return {
        key: column,
      };
    });
    worksheet.columns = columns;
    let rowCount = 0;
    allSetups.forEach((row) => {
      worksheet.addRow(row, "i+");
      sheetRow = worksheet.lastRow;
      // sheetRow.eachCell({ includeEmpty: true }, function (cell, colNumber) {
      //   cell.style.alignment = { horizontal: "center" };
      //   cell.style.border = {
      //     top: { style: "thin" },
      //     left: { style: "thin" },
      //     bottom: { style: "thin" },
      //     right: { style: "thin" },
      //   };
      //   let columnLength = cell.value ? cell.value.toString().length : 10;
      //   if (columnLength > columnsLength[colNumber]) {
      //     columnsLength[colNumber] = columnLength;
      //     worksheet.getColumn(colNumber).width = columnLength;
      //   }
      // });
      rowCount = sheetRow.number;
      sheetRow.commit();
    });
    rowCount += 2;
    getFooterInfo().forEach((info) => {
      worksheet.getCell(`A${rowCount}`).value = info;
      worksheet.mergeCells(`A${rowCount}:R${rowCount}`);
      rowCount++;
    });
    worksheet.commit();
    Object.keys(final).forEach((exchangersymbol) => {
      columnsLength = [];
      worksheet = workbook.addWorksheet(exchangersymbol.replace("/", "-"), {
        views: [{ state: "frozen", ySplit: 1 }],
      });
      columns = Object.keys(final[exchangersymbol][0]).map((column) => {
        return {
          header: column,
          key: column,
        };
      });
      worksheet.columns = columns;
      sheetRow = worksheet.getRow(1);
      sheetRow.eachCell({ includeEmpty: true }, function (cell, colNumber) {
        cell.style.alignment = { horizontal: "center" };
        cell.style.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        let columnLength = cell.value ? cell.value.toString().length : 10;
        columnsLength[colNumber] = columnLength < 10 ? 10 : columnLength;
        worksheet.getColumn(colNumber).width = columnsLength[colNumber];
      });
      sheetRow.commit();
      rowCount = 0;
      final[exchangersymbol].forEach((row) => {
        worksheet.addRow(row);
        let sheetRow = worksheet.lastRow;
        // sheetRow.eachCell({ includeEmpty: true }, function (cell, colNumber) {
        //   cell.style.alignment = { horizontal: "center" };
        //   cell.style.border = {
        //     top: { style: "thin" },
        //     left: { style: "thin" },
        //     bottom: { style: "thin" },
        //     right: { style: "thin" },
        //   };
        //   let columnLength = cell.value ? cell.value.toString().length : 10;
        //   if (
        //     !columnsLength[colNumber] ||
        //     columnLength > columnsLength[colNumber]
        //   ) {
        //     columnsLength[colNumber] = columnLength;
        //     worksheet.getColumn(colNumber).width = columnLength;
        //   }
        // });
        rowCount = sheetRow.number;
        sheetRow.commit();
      });
      rowCount += 2;
      getFooterInfo().forEach((info) => {
        worksheet.getCell(`A${rowCount}`).value = info;
        worksheet.getCell(`A${rowCount}`).style.border = {};
        worksheet.mergeCells(`A${rowCount}:R${rowCount}`);
        rowCount++;
      });
      worksheet.commit();
    });
    const groupidArray = Array.from(groupidMap.values());
    const groupidbosoArray = Array.from(groupidbosoMap.values());
    worksheet = workbook.addWorksheet("groupid", {
      views: [{ state: "frozen", ySplit: 1 }],
    });
    worksheet.columns = Object.keys(groupidArray[0]).map((column) => {
      return {
        header: column,
        key: column,
      };
    });
    sheetRow = worksheet.getRow(1);
    sheetRow.eachCell({ includeEmpty: true }, function (cell, colNumber) {
      cell.style.alignment = { horizontal: "center" };
      cell.style.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      let columnLength = cell.value ? cell.value.toString().length : 10;
      columnsLength[colNumber] = columnLength < 10 ? 10 : columnLength;
      worksheet.getColumn(colNumber).width = columnsLength[colNumber];
    });
    sheetRow.commit();
    groupidArray.forEach((row) => {
      worksheet.addRow(row);
      let sheetRow = worksheet.lastRow;
      // sheetRow.eachCell({ includeEmpty: true }, function (cell, colNumber) {
      //   cell.style.alignment = { horizontal: "center" };
      //   cell.style.border = {
      //     top: { style: "thin" },
      //     left: { style: "thin" },
      //     bottom: { style: "thin" },
      //     right: { style: "thin" },
      //   };
      //   let columnLength = cell.value ? cell.value.toString().length : 10;
      //   if (
      //     !columnsLength[colNumber] ||
      //     columnLength > columnsLength[colNumber]
      //   ) {
      //     columnsLength[colNumber] = columnLength;
      //     worksheet.getColumn(colNumber).width = columnLength;
      //   }
      // });
      sheetRow.commit();
    });
    worksheet.commit();
    worksheet = workbook.addWorksheet("groupidboso", {
      views: [{ state: "frozen", ySplit: 1 }],
    });
    worksheet.columns = Object.keys(groupidbosoArray[0]).map((column) => {
      return {
        header: column,
        key: column,
      };
    });
    sheetRow = worksheet.getRow(1);
    sheetRow.eachCell({ includeEmpty: true }, function (cell, colNumber) {
      cell.style.alignment = { horizontal: "center" };
      cell.style.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      let columnLength = cell.value ? cell.value.toString().length : 10;
      columnsLength[colNumber] = columnLength < 10 ? 10 : columnLength;
      worksheet.getColumn(colNumber).width = columnsLength[colNumber];
    });
    sheetRow.commit();
    groupidbosoArray.forEach((row) => {
      worksheet.addRow(row);
      let sheetRow = worksheet.lastRow;
      // sheetRow.eachCell({ includeEmpty: true }, function (cell, colNumber) {
      //   cell.style.alignment = { horizontal: "center" };
      //   cell.style.border = {
      //     top: { style: "thin" },
      //     left: { style: "thin" },
      //     bottom: { style: "thin" },
      //     right: { style: "thin" },
      //   };
      //   let columnLength = cell.value ? cell.value.toString().length : 10;
      //   if (
      //     !columnsLength[colNumber] ||
      //     columnLength > columnsLength[colNumber]
      //   ) {
      //     columnsLength[colNumber] = columnLength;
      //     worksheet.getColumn(colNumber).width = columnLength;
      //   }
      // });
      sheetRow.commit();
    });
    worksheet.commit();
    await workbook.commit();
  }

  console.log("Finished.");
  if (args.length > 0) {
    const appProcess = spawn("npm", ["start", ...args], {
      detached: true,
      stdio: "inherit",
      shell: true,
    });
    appProcess.unref();
  }
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
