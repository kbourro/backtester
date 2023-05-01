export default {
  options: { console: true },
  symbols: { binance: ["btc/usdt"] },
  from: "2021/01/01 00:00:00",
  to: "2023/04/30 21:00:00",
  fees: 0.1,
  setups: [
    {
      name: "test",
      tp: [4.5],
      bo: [10],
      so: [10],
      sos: [0.9],
      os: [1.04],
      ss: [0.95],
      mstc: 60,
      sl: 0,
      maxslfromlastdeviation: 30,
    },
  ],
};
