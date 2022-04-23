const downloadData = require("../download-data");
const db = require("../db/sql");
const prepareSetups = require("./prepareSetups");
const config = require("../config.json");
const symbols = Object.values(config.symbols);
const setups = prepareSetups(Object.values(config.setups));
const from = config.from;
const to = config.to;
const exchanger = config.exchanger;
(async () => {
  for (let index = 0; index < symbols.length; index++) {
    const symbol = symbols[index];
    await downloadData(exchanger, symbol, from, to);
  }
  for (let index = 0; index < symbols.length; index++) {
    const symbol = symbols[index];
    let fromTimestamp = new Date(from).getTime();
    const toTimestamp = new Date(to).getTime();
    for (let setupIndex = 0; setupIndex < setups.length; setupIndex++) {
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
      console.time("Backtest time");
      while (true) {
        let ohlcvs = db.getAllDataInRangeLimit(
          symbol,
          fromTimestamp,
          toTimestamp,
          10000
        );
        if (ohlcvs.length <= 0) {
          if (trade.open !== null) {
            trades.push({ ...trade });
          }
          break;
        }
        for (let dataIndex = 0; dataIndex < ohlcvs.length; dataIndex++) {
          const ohlcv = ohlcvs[dataIndex];
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
      for (let tradesIndex = 0; tradesIndex < trades.length; tradesIndex++) {
        const trade = trades[tradesIndex];
        totalProfit += trade.profit;
        deviationsUsed = Math.max(deviationsUsed, trade.deviationsUsed);
      }
      console.log(`Symbol ${symbol}`);
      console.log(`Start date ${config.from} - End date ${config.to}`);
      console.log(`Max deviations used ${deviationsUsed}`);
      console.log(
        `Total profits ${((totalProfit / setup.maxAmount) * 100).toFixed(2)}%`
      );
      console.log(`Total trades ${trades.length}`);
      console.log(`---------------------------------------------`);
      console.timeEnd("Backtest time");
    }
  }
})();
