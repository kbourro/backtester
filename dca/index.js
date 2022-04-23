import pLimit from "p-limit";
const limit = pLimit(10);
import downloadData from "../download-data/index.js";
import symbolBacktest from "./symbol.js";
import prepareSetups from "./prepareSetups.js";
import config from "../config.js";
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
    await symbolBacktest({ config, setups, symbol });
  }
})();
