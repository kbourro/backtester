export default (setups) => {
  for (let index = 0; index < setups.length; index++) {
    const setup = setups[index];
    setup.deviations = [0];
    setup.volume = [setup.bo];
    setup.totalVolume = [setup.bo];
    setup.requiredChange = [setup.tp];
    let tempTotalCoins = 1;
    let maxDeviation = 0;
    for (let i = 0; i < setup.mstc; i++) {
      let volume = 0;
      if (i === 0) {
        volume = setup.so;
        maxDeviation = setup.sos;
        setup.volume.push(setup.so);
        setup.totalVolume.push(setup.bo + setup.so);
      } else {
        volume = setup.volume[setup.volume.length - 1] * setup.os;
        maxDeviation = maxDeviation * setup.ss + setup.sos;
        setup.volume.push(volume);
        setup.totalVolume.push(
          setup.totalVolume[setup.totalVolume.length - 1] + volume
        );
      }
      let tempPricePerCoin = setup.bo - (setup.bo * maxDeviation) / 100;
      tempTotalCoins += volume / tempPricePerCoin;
      let tempAveragePrice =
        setup.totalVolume[setup.totalVolume.length - 1] / tempTotalCoins;
      setup.requiredChange.push(
        ((tempAveragePrice - tempPricePerCoin) / tempPricePerCoin) * 100 +
          setup.tp
      );
      setup.deviations.push(maxDeviation);
    }
    // Correct way to round to 2 decimals
    setup.maxDeviation = +(Math.round(maxDeviation + "e+2") + "e-2");
    setup.maxAmount = Math.round(
      setup.volume.reduce((partialSum, a) => partialSum + a, 0)
    );
  }
  return setups;
};
