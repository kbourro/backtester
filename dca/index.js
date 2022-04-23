import pLimit from "p-limit";
import downloadData from "../download-data/index.js";
import symbolBacktest from "./symbol.js";
import prepareSetups from "./prepareSetups.js";
import config from "../config.js";
const symbols = Object.values(config.symbols);
const setups = prepareSetups(Object.values(config.setups));
const from = config.from;
const to = config.to;
const exchanger = config.exchanger;
let promises = [];
(async () => {
  const limit = pLimit(10);
  for (let index = 0; index < symbols.length; index++) {
    const symbol = symbols[index];
    promises.push(limit(() => downloadData(exchanger, symbol, from, to)));
  }
  await Promise.all(promises);
  promises = [];
  console.time("All backtests completed in");
  for (let index = 0; index < symbols.length; index++) {
    const symbol = symbols[index];
    promises.push(limit(() => symbolBacktest({ config, setups, symbol })));
  }
  await Promise.all(promises);
  console.timeEnd("All backtests completed in");
})();
