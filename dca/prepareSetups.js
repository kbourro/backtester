const generateSetupsFromRanges = (setups) => {
  let tempSetups = [];
  for (let setupsIndex = 0; setupsIndex < setups.length; setupsIndex++) {
    let arrayFound = false;
    const setup = setups[setupsIndex];
    let keys = Object.keys(setup);
    for (let keysIndex = 0; keysIndex < keys.length; keysIndex++) {
      const key = keys[keysIndex];
      if (Array.isArray(setup[key])) {
        arrayFound = true;
        let internalSetups = [];
        for (
          let valuesIndex = 0;
          valuesIndex < setup[key].length;
          valuesIndex++
        ) {
          const value = setup[key][valuesIndex];
          let tempSetup = { ...setup };
          tempSetup[key] = value;
          internalSetups.push({ ...tempSetup });
        }
        tempSetups = tempSetups.concat(
          generateSetupsFromRanges([...internalSetups])
        );
        break;
      }
    }
    if (!arrayFound) {
      tempSetups.push({ ...setup });
    }
  }
  return tempSetups;
};

export default (setups, config) => {
  setups = generateSetupsFromRanges(setups);
  // Remove duplicate
  setups = setups.filter(
    (setup, index, self) =>
      index ===
      self.findIndex((t) => JSON.stringify(t) === JSON.stringify(setup))
  );
  // Rename setups with same name
  let tempSetups = [];
  for (let index = 0; index < setups.length; index++) {
    const setup = setups[index];
    if (tempSetups.filter((s) => s.name === setup.name).length > 0) {
      setup.name = `${setup.name} ${index}`;
    }
    tempSetups.push({ ...setup });
  }
  setups = [...tempSetups];
  for (let index = 0; index < setups.length; index++) {
    const setup = setups[index];
    setup.deviations = [0];
    setup.volume = [setup.bo];
    setup.totalVolume = [setup.bo];
    let tempFees = config.fees * 2;
    setup.requiredChange = [setup.tp + config.fees * 2];
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
      tempFees += config.fees;
      setup.requiredChange.push(
        ((tempAveragePrice - tempPricePerCoin) / tempPricePerCoin) * 100 +
          (setup.tp + tempFees)
      );
      setup.deviations.push(maxDeviation);
    }
    // console.log(setup);
    // process.exit(0);
    // Correct way to round to 2 decimals
    setup.maxDeviation = +(Math.round(maxDeviation + "e+2") + "e-2");
    setup.maxAmount = Math.round(
      setup.volume.reduce((partialSum, a) => partialSum + a, 0)
    );
  }
  return setups;
};
