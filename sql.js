const db = require("better-sqlite3")("./data.db");

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
  return db.prepare("SELECT * FROM " + table).all();
};

const getAllDataInRange = (symbol, from, to) => {
  let table = symbol.replace("/", "").toLowerCase();
  return db
    .prepare("SELECT * FROM " + table + " WHERE timestamp>=? AND timestamp<=?")
    .all(from, to);
};

const insertCandles = (symbol, ohlcvs) => {
  let table = symbol.replace("/", "").toLowerCase();
  createTable(symbol);
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
  db.exec(
    'CREATE TABLE IF NOT EXISTS "' +
      symbol +
      '" ("timestamp" integer NOT NULL,"open" integer,"high" integer,"low" integer,"close" integer,"volume" integer, PRIMARY KEY ("timestamp"));'
  );
};

module.exports = {
  getLastTimestamp,
  getFirstTimestamp,
  insertCandles,
  getAllData,
  getAllDataInRange,
};
