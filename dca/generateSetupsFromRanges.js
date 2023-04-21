let setupsToRun = [];
function generateSetupsFromRanges(setups) {
  const result = [];
  const stack = setups.slice();

  while (stack.length) {
    const setup = stack.pop();
    let arrayFound = false;

    for (const key in setup) {
      if (Array.isArray(setup[key])) {
        arrayFound = true;
        const values = setup[key];
        for (let i = 0; i < values.length; i++) {
          const newSetup = Object.assign({}, setup);
          newSetup[key] = values[i];
          stack.push(newSetup);
        }
        break;
      }
    }

    if (!arrayFound) {
      result.push(setup);
    }
  }

  return result;
}

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
