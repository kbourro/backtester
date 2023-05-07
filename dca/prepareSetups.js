import { fork } from "child_process";
import delay from "delay";
import os from "os";
const processes = os.cpus().length - 1;
let childs = [];
let finalSetups = [];
for (let index = 0; index < processes; index++) {
  const child = fork("./dca/generateSetupsFromRanges.js");
  let started = false;
  let running = 0;
  const handleMessage = (message) => {
    if (message === "done") {
      const waitForRunning = () =>
        new Promise((resolve) => {
          if (running > 0) {
            setTimeout(waitForRunning, 100);
          } else {
            resolve(true);
          }
        });
      waitForRunning().then(() => {
        childs = childs.filter((val) => val !== child);
        child.off("message", handleMessage);
        child.kill();
      });
      return;
    }
    if (started) {
      running++;
      for (let index = 0; index < message.length; index++) {
        const setup = message[index];
        finalSetups.push(setup);
      }
      running--;
    } else if (message === "started") {
      started = true;
      childs.push(child);
    }
  };
  child.on("message", handleMessage);
}
function getSetupKey(setup) {
  const { os, ss, sos, mstc, tp, bo, so, sl } = setup;
  return `${os}|${ss}|${sos}|${mstc}|${tp}|${bo}|${so}|${sl}`;
}
const run = (setups, config) => {
  return new Promise((resolve) => {
    let childIndex = 0;
    for (let index = 0; index < setups.length; index++) {
      const setup = setups[index];
      childs[childIndex].send(setup);
      childIndex++;
      if (childIndex >= childs.length) {
        childIndex = 0;
      }
    }
    for (let index = 0; index < childs.length; index++) {
      const child = childs[index];
      child.send("start");
    }
    const finalize = () => {
      if (childs.length > 0) {
        setTimeout(finalize, 1000);
        return;
      }
      // Remove duplicates and Rename setups with same name
      let tempSetups = [];
      let finalSetupsLength = finalSetups.length;
      console.log(`Preparing setups`);
      let uniqueCombinations = new Set();
      let uniqueNames = new Set();
      for (let index = 0; index < finalSetupsLength; index++) {
        const setup = finalSetups[index];
        if (setup.bo > 10 && setup.bo === setup.so) {
          continue;
        }
        const uniqueKey = getSetupKey(setup);
        if (uniqueCombinations.has(uniqueKey)) {
          continue;
        }
        if (uniqueNames.has(setup.name)) {
          setup.name = `${setup.name} ${index}`;
        }
        uniqueCombinations.add(uniqueKey);
        uniqueNames.add(setup.name);
        tempSetups.push({ ...setup });
      }
      console.log(
        `Preparing setups filters completed with ${tempSetups.length} setups.`
      );
      finalSetups = [];
      for (const setup of tempSetups) {
        if (setup.sl === undefined || setup.sl === null) {
          setup.sl = 0;
        }
        setup.deviations = new Array(setup.mstc + 1);
        setup.volume = new Array(setup.mstc + 1);
        setup.totalVolume = new Array(setup.mstc + 1);
        setup.requiredChange = new Array(setup.mstc + 1);

        setup.deviations[0] = 0;
        setup.volume[0] = setup.bo;
        setup.totalVolume[0] = setup.bo;
        setup.requiredChange[0] = setup.tp;

        let tempTotalCoins = 1;
        let maxDeviation = 0;

        for (let i = 1; i <= setup.mstc; i++) {
          let volume = i === 1 ? setup.so : setup.volume[i - 1] * setup.os;
          maxDeviation = maxDeviation * setup.ss + setup.sos;

          setup.volume[i] = volume;
          setup.totalVolume[i] = setup.totalVolume[i - 1] + volume;

          let tempPricePerCoin = setup.bo - (setup.bo * maxDeviation) / 100;
          tempTotalCoins += volume / tempPricePerCoin;

          let tempAveragePrice = setup.totalVolume[i] / tempTotalCoins;
          setup.requiredChange[i] =
            ((tempAveragePrice - tempPricePerCoin) / tempPricePerCoin) * 100 +
            setup.tp;
          setup.deviations[i] = maxDeviation;
        }

        // Correct way to round to 2 decimals
        setup.maxDeviation = +(Math.round(maxDeviation + "e+2") + "e-2");

        setup.initialBalance = Math.round(
          setup.volume.reduce((partialSum, a) => partialSum + a, 0)
        );
        if (
          setup.initialBalance >= 50000 ||
          setup.initialBalance < 1000 ||
          setup.maxDeviation <= 10 ||
          setup.maxDeviation >= 100 ||
          (setup.sl !== 0 && setup.sl <= setup.maxDeviation) ||
          (setup.maxslfromlastdeviation !== undefined &&
            setup.sl - setup.maxDeviation > setup.maxslfromlastdeviation)
        ) {
          continue;
        } else {
          finalSetups.push(setup);
        }
      }
      console.log("Preparing setups completed.");
      resolve(finalSetups);
    };
    setTimeout(finalize, 10);
  });
};

export default async (setups, config) => {
  while (childs.length < processes) {
    await delay(200);
  }
  return await run(setups, config);
};
