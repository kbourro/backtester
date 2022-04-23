export default ({
  botEmulator,
  low,
  high,
  type = null,
  gridStep = null,
  grids = null,
}) => {
  let grid = { prices: [], percentageUp: [], percentageDown: [] };
  //   if (botEmulator === "bitsgap") {
  //     if (grids !== null) {
  //       gridStep = (high - low) / grids;
  //     } else if (gridStep !== null) {
  //         grids =
  //     }
  //     if (type === "sbot") {
  //     }
  //   }
  if (botEmulator === "3commas") {
    let newLow = low - (high - low) / grids;
    let priceDif = (high - newLow) / grids;
    grid.prices.push({ value: low, status: null, from: null });
    grid.percentageUp.push((priceDif / (low + priceDif)) * 100);
    grid.percentageDown.push((priceDif / (low + priceDif)) * 100);
    for (let index = 1; index < grids; index++) {
      let last = grid.prices[grid.prices.length - 1].value;
      grid.prices.push({ value: last + priceDif, status: null, from: null });
      grid.percentageUp.push((priceDif / last) * 100);
      grid.percentageDown.push((priceDif / (last + priceDif)) * 100);
    }
    return grid;
  }
};

// console.log(
//   createGrid({ botEmulator: "3commas", high: 40000, low: 20000, grids: 40 })
// );
