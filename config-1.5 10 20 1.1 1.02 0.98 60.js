export default {
  options: { console: true },
  symbols: ["btc/usdt"],
  //from: "2022/05/04 00:00:00",
  from: "2020/01/01 21:00:00",
  to: "2023/04/20 00:00:00",
  // to: "2022/05/15 21:00:00",
  fees: 0.1,
  exchanger: "binance",
  setups: [
    {
      name: "test",
      tp: [
        0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9,
        2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3,
      ],
      bo: [10],
      so: [20],
      sos: [1.1],
      os: [1.02],
      ss: [0.98],
      mstc: 60,
      sl: 0,
      maxslfromlastdeviation: undefined,
    },
  ],
};