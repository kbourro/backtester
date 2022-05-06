import { fork } from "child_process";
import delay from "delay";
import os from "os";
const processes = os.cpus().length - 1;
let totalSetups = 0;
let tasks = [];
let tasksIndex = 0;
let totalTasks = 0;
let tasksPerCPU = 0;
let childs = [];
let results = [];
let totalCompleted = 0;
for (let index = 0; index < processes; index++) {
  const child = fork("./dca/setup.js");
  let started = false;
  const handleMessage = (message) => {
    if (started) {
      if (message.single) {
        results.push(message.single);
        totalCompleted++;
      } else if (message.multiple) {
        for (let index = 0; index < message.multiple.length; index++) {
          results.push(message.multiple[index]);
          totalCompleted++;
        }
        let childTasks = [];
        for (let i = 0; i < tasksPerCPU; i++) {
          if (tasksIndex < totalTasks) {
            childTasks.push({ ...tasks[tasksIndex], id: tasksIndex });
            tasksIndex++;
          }
        }
        if (childTasks.length > 0) {
          child.send(childTasks);
        }
      }
      // if (tasksIndex < totalTasks) {
      //   child.send({ ...tasks[tasksIndex], id: tasksIndex });
      //   tasksIndex++;
      // }
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
    tasksPerCPU = Math.min(totalTasks / childs.length, 5);
    for (let index = 0; index < childs.length; index++) {
      const child = childs[index];
      let childTasks = [];
      for (let i = 0; i < tasksPerCPU; i++) {
        if (tasksIndex < totalTasks) {
          childTasks.push({ ...tasks[tasksIndex], id: tasksIndex });
          tasksIndex++;
        }
      }
      if (childTasks.length > 0) {
        child.send(childTasks);
      }
    }
    // let tasksToSend = Math.min(childs.length, totalTasks);
    // for (let index = 0; index < tasksToSend; index++) {
    //   childs[index].send(tasks[tasksIndex]);
    //   tasksIndex++;
    // }
    const printCompletedResults = () => {
      console.log(`Setups completed: ${totalCompleted}/${totalSetups}`);
      setTimeout(printCompletedResults, 2000);
    };
    const checkIfAllFinished = () => {
      if (totalCompleted === totalTasks) {
        tasks = [];
        console.log(`Setups completed: ${totalCompleted}/${totalSetups}`);
        resolve(results);
        return;
      }
      setTimeout(checkIfAllFinished, 1000);
    };
    setTimeout(printCompletedResults, 2000);
    setTimeout(checkIfAllFinished, 1000);
  });
};
export { add, start };
