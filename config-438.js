export default {
  options: { console: false },
  symbols: [
    "btc/usdt",
    "luna/usdt",
    "vet/usdt",
    "sol/usdt",
    "ada/usdt",
    "ltc/usdt",
    "eth/usdt",
    "mana/usdt",
    "sand/usdt",
    "enj/usdt",
    "lrc/usdt",
    "waves/usdt",
    "dydx/usdt",
    "avax/usdt",
    "algo/usdt",
    "axs/usdt",
    "ftm/usdt",
    "bnb/usdt",
    "uni/usdt",
    "cake/usdt",
    "ftt/usdt",
    "dot/usdt",
    "link/usdt",
    "1inch/usdt",
    "ray/usdt",
    "comp/usdt",
    "hbar/usdt",
  ],
  from: "2021/11/09 00:00:00",
  to: "2022/04/29 23:59:00",
  fees: 0.1,
  exchanger: "binance",
  setups: [
    {
      name: "438",
      tp: [0.25, 0.5, 0.8, 1],
      bo: 10,
      so: [10, 20, 30],
      sos: 0.9,
      os: [
        1.6, 1.61, 1.62, 1.63, 1.64, 1.65, 1.66, 1.67, 1.68, 1.69, 1.7, 1.71,
        1.72,
      ],
      ss: [
        1.24, 1.25, 1.26, 1.27, 1.28, 1.29, 1.3, 1.31, 1.32, 1.33, 1.34, 1.35,
        1.36, 1.37, 1.38, 1.39, 1.4,
      ],
      mstc: 8,
    },
  ],
};
