import ccxt from "ccxt";
import config from "../config.js";
const symbols = Object.values(config.symbols);
const exchanger = config.exchanger;
(async () => {
  let exchange = null;
  if (exchanger === "ftx") {
    exchange = new ccxt.ftx();
  } else {
    exchange = new ccxt.binance();
  }
  let notExistSymbols = [];
  for (let index = 0; index < symbols.length; index++) {
    const symbol = symbols[index];
    try {
      await exchange.fetchTicker(symbol);
    } catch (error) {
      notExistSymbols.push(symbol);
    }
  }
  if (notExistSymbols.length > 0) {
    console.log(`Not exist ${notExistSymbols.join(", ")}`);
    symbols.forEach((symbol) => {
      if (!notExistSymbols.includes(symbol)) {
        console.log(`"${symbol}",`);
      }
    });
    process.exit(0);
  }
})();
