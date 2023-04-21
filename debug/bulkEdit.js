import fs from "fs";
import obj from "../config-btc.js";

obj.setups.forEach((setup) => {
  setup["sl"] = [
    1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80,
  ];
  setup["maxslfromlastdeviation"] = 30;
});

fs.writeFileSync(
  "./config-btc.js",
  "export default " + JSON.stringify(obj) + ";",
  { encoding: "utf8", flag: "w+" }
);
