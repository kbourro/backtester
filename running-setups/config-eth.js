export default {
  options: { console: false },
  symbols: {
    binance: ["eth/usdt", "eth/busd"],
    binanceusdm: ["eth/usdt"],
    kucoin: ["eth/usdt"],
  },
  from: "2020/01/01 00:00:00",
  to: "2023/04/20 21:00:00",
  fees: 0.1,
  setups: [
    {
      name: "7",
      tp: [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5],
      bo: [10],
      so: [30],
      sos: [1.3],
      os: [2.2],
      ss: [1.3],
      mstc: [7],
      sl: 0,
      maxslfromlastdeviation: undefined,
    },
    {
      name: "40",
      tp: [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5],
      bo: [10],
      so: [20],
      sos: [1.3],
      os: [1.06],
      ss: [0.95],
      mstc: [40],
      sl: 0,
      maxslfromlastdeviation: undefined,
    },
    {
      name: "60",
      tp: [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5],
      bo: [10],
      so: [10],
      sos: [1.2],
      os: [1.02],
      ss: [0.95],
      mstc: [60],
      sl: 0,
      maxslfromlastdeviation: undefined,
    },
  ],
};
