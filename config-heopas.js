export default {
  options: { console: false },
  symbols: ["btc/usdt"],
  from: "2017/12/11 00:00:00",
  to: "2022/05/12 15:00:00",
  fees: 0.1,
  exchanger: "binance",
  setups: [
    {
      name: "Test",
      tp: [0.5, 1, 1.25, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2.5, 3],
      bo: 10,
      so: 10,
      sos: 2,
      os: 1.05,
      ss: 0.96,
      mstc: 40,
    },
  ],
};
