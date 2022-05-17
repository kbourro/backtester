let setupsToRun = [];
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

process.on("message", function (message) {
  if (message === "start") {
    process.send(generateSetupsFromRanges(setupsToRun));
  } else if (Array.isArray(message)) {
    setupsToRun = setupsToRun.concat(message);
  } else {
    setupsToRun.push(message);
  }
});

process.send("started");

export default generateSetupsFromRanges;
