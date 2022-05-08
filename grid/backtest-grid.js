//import sql from "../db/sql.js";
import createGrid from "./grid.js";
// let firstTimestamp = sql.getFirstTimestamp("BTC/USDT");
// let oneDayMS = 3600 * 1000 * 24;
// let ohlcvs = sql.getAllDataInRange(
//   "BTC/USDT",
//   firstTimestamp,
//   firstTimestamp + oneDayMS
// );
let grid = createGrid({
  botEmulator: "3commas",
  high: 4300,
  low: 4000,
  grids: 40,
});
let balance = 10000;
let amountInUsdPerGrid = balance / grid.prices.length;
let startingPrice = 4200;
for (let index = 0; index < grid.prices.length; index++) {
  const price = grid.prices[index];
  if (price.value > startingPrice) {
    grid.prices[index].status = "sell";
    grid.prices[index].from = startingPrice;
  } else {
    grid.prices[index].status = "buy";
  }
}
console.log(grid.prices);
