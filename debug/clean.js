import { getDirectories } from "../utils.js";
import fs from "fs";
import path from "path";

let dirs = getDirectories(path.resolve("./results"));

for (let index = 0; index < dirs.length; index++) {
  const dir = path.resolve("./results/" + dirs[index]);
  fs.rmSync(dir, { recursive: true, force: true });
}
