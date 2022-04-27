import { fork } from "child_process";
import PQueue from "p-queue";
const queue = new PQueue({ concurrency: 10 });
export default async ({ config, setups, symbol }) => {
  let promises = setups.map((setup) =>
    queue.add(() => runSetupAsChild({ config, setup, symbol }))
  );
  let results = await Promise.all(promises);
  return { symbol, results };
};

const runSetupAsChild = ({ config, setup, symbol }) => {
  return new Promise((resolve, reject) => {
    let results = null;
    const child = fork("./dca/setup.js");
    child.on("message", function (message) {
      if (message === "started") {
        child.send({
          config: { from: config.from, to: config.to },
          setup,
          symbol,
        });
      } else {
        child.kill();
        results = message;
      }
    });
    child.on("close", function (code) {
      resolve(results);
    });
  });
};
