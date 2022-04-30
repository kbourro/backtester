import { fork } from "child_process";
import PQueue from "p-queue";
import delay from "delay";
const queue = new PQueue({ concurrency: 20 });
let totalSetups = 0;
queue.on("completed", (result) => {
  console.log(`Setups pending: ${queue.size + queue.pending}/${totalSetups}`);
});
let childs = [];
for (let index = 0; index < 20; index++) {
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

export default async ({ config, setups, symbol }) => {
  while (childs.length < 20) {
    await delay(200);
  }
  totalSetups += setups.length;
  let promises = [];

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
  let results = await Promise.all(promises);
  return { symbol, results };
};

const runSetupInChild = ({ config, setup, symbol, child }) => {
  return new Promise((resolve, reject) => {
    const handleMessage = function (message) {
      if (
        message.symbol === symbol &&
        JSON.stringify(message.setup) === JSON.stringify(setup)
      ) {
        child.off("message", handleMessage);
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
