import fs from "fs";
import obj from "../config-btc.js";

const setups = new Map();
obj.setups.forEach((setup) => {
  if (setups.has(setup.mstc)) {
    //setups.set(setup.mstc, setups.get(setup.mstc));
    setups.get(setup.mstc).push(setup);
  } else {
    setups.set(setup.mstc, [setup]);
  }
});

setups.forEach((setups2, key) => {
  fs.writeFileSync(
    `./config-btc-${key}.js`,
    "export default " + JSON.stringify({ ...obj, setups: setups2 }) + ";",
    { encoding: "utf8", flag: "w+" }
  );
});
