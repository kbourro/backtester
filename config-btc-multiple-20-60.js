export default {
  options: { console: false },
  symbols: {
    binance: ["btc/usdt", "btc/busd"],
    binanceusdm: ["btc/usdt"],
    kucoin: ["btc/usdt"],
  },
  from: "2021/01/01 00:00:00",
  to: "2023/04/20 21:00:00",
  fees: 0.1,
  setups: [
    {
      name: "multiple 20-60",
      tp: [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5],
      bo: [10],
      so: [10, 20, 30],
      sos: [
        0.8, 0.9, 1, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2, 2.1, 2.2,
        2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3,
      ],
      os: [
        1.02, 1.03, 1.04, 1.05, 1.06, 1.07, 1.08, 1.09, 1.1, 1.11, 1.12, 1.13,
        1.14, 1.15, 1.16, 1.17, 1.18, 1.19, 1.2, 1.21, 1.22, 1.23, 1.24, 1.25,
        1.26, 1.27, 1.28, 1.3, 1.31, 1.32, 1.33,
      ],
      ss: [
        0.74, 0.75, 0.76, 0.77, 0.78, 0.79, 0.8, 0.81, 0.82, 0.83, 0.84, 0.85,
        0.86, 0.87, 0.88, 0.89, 0.9, 0.91, 0.92, 0.93, 0.94, 0.95, 0.96, 0.97,
        0.98, 0.99, 1, 1.1, 1.11, 1.12, 1.13, 1.14,
      ],
      mstc: [20, 25, 30, 40, 50, 60],
      sl: 0,
      maxslfromlastdeviation: undefined,
    },
  ],
};
