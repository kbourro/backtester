export default {
  options: { console: true },
  symbols: {
    binance: ["eth/usdt"],
  },
  from: "2021/01/01 21:00:00",
  to: "2023/04/30 00:00:00",
  fees: 0.1,
  setups: [
    {
      name: "test",
      tp: [1],
      bo: [10],
      so: [10],
      sos: [2],
      os: [5],
      ss: [1],
      mstc: 6,
      sl: 0,
      maxslfromlastdeviation: 30,
    },
  ],
};
