import { fork } from "child_process";
import delay from "delay";
import os from "os";
const processes = os.cpus().length - 1;
let totalSetups = 0;
let tasks = [];
let tasksIndex = 0;
let totalTasks = 0;
let childs = [];
let results = [];
for (let index = 0; index < processes; index++) {
  const child = fork("./dca/setup.js");
  let started = false;
  const handleMessage = (message) => {
    if (started) {
      results.push(message);
      if (tasksIndex < totalTasks) {
        child.send({ ...tasks[tasksIndex], id: tasksIndex });
        tasksIndex++;
      }
    } else if (message === "started") {
      started = true;
      childs.push(child);
    }
  };
  child.on("message", handleMessage);
}

const add = async ({ config, setups, symbol }) => {
  while (childs.length < processes) {
    await delay(200);
  }
  totalSetups += setups.length;
  for (let index = 0; index < setups.length; index++) {
    const setup = setups[index];
    tasks.push({ config, setup, symbol });
  }
};

const start = () => {
  return new Promise((resolve) => {
    totalTasks = tasks.length;
    let tasksToSend = Math.min(childs.length, totalTasks);
    for (let index = 0; index < tasksToSend; index++) {
      childs[index].send(tasks[tasksIndex]);
      tasksIndex++;
    }
    const printCompletedResults = () => {
      console.log(`Setups completed: ${results.length}/${totalSetups}`);
      setTimeout(printCompletedResults, 5000);
    };
    const checkIfAllFinished = () => {
      if (results.length === totalTasks) {
        tasks = [];
        console.log(`Setups completed: ${results.length}/${totalSetups}`);
        resolve(results);
        return;
      }
      setTimeout(checkIfAllFinished, 1000);
    };
    setTimeout(printCompletedResults, 5000);
    setTimeout(checkIfAllFinished, 1000);
  });
};

// const runSetupInChild = ({ config, setup, symbol, child }) => {
//   return new Promise((resolve, reject) => {
//     const handleMessage = function (message) {
//       if (
//         message.symbol === symbol &&
//         message.setup.tp === setup.tp &&
//         message.setup.bo === setup.bo &&
//         message.setup.so === setup.so &&
//         message.setup.sos === setup.sos &&
//         message.setup.os === setup.os &&
//         message.setup.ss === setup.ss &&
//         message.setup.mstc === setup.mstc
//       ) {
//         child.off("message", handleMessage);
//         resolve(message);
//       }
//     };
//     child.on("message", handleMessage);
//     child.send({
//       config: { from: config.from, to: config.to },
//       setup,
//       symbol,
//     });
//   });
// };

export { add, start };
