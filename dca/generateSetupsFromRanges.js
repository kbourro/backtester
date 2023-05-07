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
    const toSend = generateSetupsFromRanges(setupsToRun);
    const chunkSize = 3000000;
    const chunks = [];
    for (let i = 0; i < toSend.length; i += chunkSize) {
      chunks.push(toSend.slice(i, i + chunkSize));
    }
    chunks.forEach((chunk) => {
      process.send(chunk);
    });
    process.send("done");
  } else if (Array.isArray(message)) {
    setupsToRun = setupsToRun.concat(message);
  } else {
    setupsToRun.push(message);
  }
});

process.send("started");

export default generateSetupsFromRanges;
