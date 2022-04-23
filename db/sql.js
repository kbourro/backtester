import bsql from "better-sqlite3";
const db = bsql("./db/data.db");

const getLastTimestamp = (symbol) => {
  let table = symbol.replace("/", "").toLowerCase();
  createTable(table);
  return db
    .prepare("SELECT MAX(`timestamp`) FROM " + table)
    .pluck()
    .get();
};

const getFirstTimestamp = (symbol) => {
  let table = symbol.replace("/", "").toLowerCase();
  createTable(table);
  return db
    .prepare("SELECT MIN(`timestamp`) FROM " + table)
    .pluck()
    .get();
};

const getAllData = (symbol) => {
  let table = symbol.replace("/", "").toLowerCase();
  createTable(table);
  return db.prepare("SELECT * FROM " + table).all();
};

const getAllDataInRange = (symbol, from, to) => {
  let table = symbol.replace("/", "").toLowerCase();
  createTable(table);
  return db
    .prepare(
      "SELECT * FROM " +
        table +
        " WHERE timestamp>=? AND timestamp<=? ORDER BY timestamp"
    )
    .all(from, to);
};

const getAllDataInRangeLimit = (symbol, from, to, limit) => {
  let table = symbol.replace("/", "").toLowerCase();
  createTable(table);
  return db
    .prepare(
      "SELECT * FROM " +
        table +
        " WHERE timestamp>=? AND timestamp<=? ORDER BY timestamp LIMIT ?"
    )
    .all(from, to, limit);
};

const insertCandles = (symbol, ohlcvs) => {
  let table = symbol.replace("/", "").toLowerCase();
  createTable(table);
  const insert = db.prepare(
    "INSERT INTO " +
      table +
      " (timestamp, open, high, low, close, volume) VALUES (?, ?, ?, ?, ?, ?)"
  );

  const insertMany = db.transaction((ohlcvs) => {
    for (const ohlcv of ohlcvs) {
      insert.run(ohlcv);
    }
  });

  insertMany(ohlcvs);
};

const createTable = (symbol) => {
  let table = symbol.replace("/", "").toLowerCase();
  db.exec(
    'CREATE TABLE IF NOT EXISTS "' +
      table +
      '" ("timestamp" integer NOT NULL,"open" integer,"high" integer,"low" integer,"close" integer,"volume" integer, PRIMARY KEY ("timestamp"));'
  );
};

export {
  getLastTimestamp,
  getFirstTimestamp,
  insertCandles,
  getAllData,
  getAllDataInRange,
  getAllDataInRangeLimit,
};
