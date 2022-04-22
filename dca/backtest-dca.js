const downloadData = require("../download-data");
const db = require("../db/sql");
const prepareSetups = require("./prepareSetups");
const config = require("../config.json");
const symbols = Object.values(config.symbols);
const setups = prepareSetups(Object.values(config.setups));
const from = config.from;
const to = config.to;
const exchanger = config.exchanger;
console.log(setups);
process.exit();
(async () => {
  for (let index = 0; index < symbols.length; index++) {
    const symbol = symbols[index];
    await downloadData(exchanger, symbol, from, to);
  }
  for (let index = 0; index < symbols.length; index++) {
    const symbol = symbols[index];
    let fromTimestamp = new Date(from).getTime();
    const toTimestamp = new Date(to).getTime();
    let data = db.getAllDataInRangeLimit(
      symbol,
      fromTimestamp,
      toTimestamp,
      10000
    );

    fromTimestamp = data[data.length - 1].timestamp + 1;
  }
})();
