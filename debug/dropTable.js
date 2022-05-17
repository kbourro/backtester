import { dropTable, getFirstTimestamp } from "../db/sql.js";

dropTable("NVDA/USD");
console.log(getFirstTimestamp("NVDA/USD"));
