import { fork } from "child_process";
import fs from "fs";
import PQueue from "p-queue";
import delay from "delay";
import os from "os";
const processes = os.cpus().length;
const queue = new PQueue({ concurrency: 20, autoStart: false });
let totalSetups = 0;
let promises = [];
let childs = [];
queue.on("completed", (result) => {
  console.log(`Setups pending: ${queue.size + queue.pending}/${totalSetups}`);
});
for (let index = 0; index < processes; index++) {
  const child = fork("./dca/setup.js");
  const handleMessage = (message) => {
    if (message === "started") {
      child.off("message", handleMessage);
      childs.push(child);
    }
  };
  child.on("message", handleMessage);
}
let childsIndex = 0;

const add = async ({ config, setups, symbol }) => {
  while (childs.length < processes) {
    await delay(200);
  }
  totalSetups += setups.length;
  for (let index = 0; index < setups.length; index++) {
    const setup = setups[index];
    let child = childs[childsIndex];
    promises.push(
      queue.add(() => runSetupInChild({ config, setup, symbol, child }))
    );
    childsIndex++;
    if (childsIndex >= childs.length) {
      childsIndex = 0;
    }
  }
};

const start = async () => {
  queue.start();
  let results = await Promise.all(promises);
  return results;
};

const runSetupInChild = ({ config, setup, symbol, child }) => {
  return new Promise((resolve, reject) => {
    const fromTimestamp = new Date(config.from).getTime();
    const toTimestamp = new Date(config.to).getTime();
    let mstcDir = `./results/${symbol
      .replace("/", "")
      .toLowerCase()}/${fromTimestamp}${toTimestamp}/${setup.mstc}`;
    if (!fs.existsSync(mstcDir)) {
      fs.mkdirSync(mstcDir, { recursive: true });
    }
    let finalFile = `${mstcDir}/${setup.tp}${setup.bo}${setup.so}${setup.sos}${setup.os}${setup.ss}.json`;
    if (fs.existsSync(finalFile)) {
      let message = JSON.parse(fs.readFileSync(finalFile));
      resolve(message);
      return;
    }
    const handleMessage = function (message) {
      if (
        message.symbol === symbol &&
        message.setup.tp === setup.tp &&
        message.setup.bo === setup.bo &&
        message.setup.so === setup.so &&
        message.setup.sos === setup.sos &&
        message.setup.os === setup.os &&
        message.setup.ss === setup.ss &&
        message.setup.mstc === setup.mstc
      ) {
        child.off("message", handleMessage);
        fs.writeFileSync(finalFile, JSON.stringify(message));
        resolve(message);
      }
    };
    child.on("message", handleMessage);
    child.send({
      config: { from: config.from, to: config.to },
      setup,
      symbol,
    });
  });
};

export { add, start };
