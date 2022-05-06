export default {
  options: { console: false },
  symbols: [
    "TSLA/USD",
    "SPY/USD",
    "NFLX/USD",
    "AAPL/USD",
    "AMZN/USD",
    "NVDA/USD",
    "FB/USD",
    "PFE/USD",
    "GOOGL/USD",
    "PYPL/USD",
    "GME/USD",
  ],
  from: "2021/11/09 00:00:00",
  to: "2022/04/29 23:59:00",
  fees: 0.1,
  exchanger: "ftx",
  setups: [
    {
      name: "Buy and Hold",
      tp: 1000000,
      bo: 10,
      so: 10,
      sos: 1,
      os: 1,
      ss: 1,
      mstc: 0,
    },
    {
      name: "itzwolf The Wolf Bot",
      tp: 2.0,
      bo: 10,
      so: 10,
      sos: 1.5,
      os: 1.1,
      ss: 1.0,
      mstc: 30,
    },
    {
      name: "TheAlpha Alpha Deep Drop 1.01 SS",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 2.0,
      os: 1.17,
      ss: 1.01,
      mstc: 20,
    },
    {
      name: "TheAlpha Alpha Deep Drop 1.01 SS",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 2.0,
      os: 1.17,
      ss: 1.01,
      mstc: 20,
    },
    {
      name: "ZachTech BitMan",
      tp: 2.0,
      bo: 11,
      so: 11,
      sos: 3.33,
      os: 1.33,
      ss: 1.11,
      mstc: 10,
    },
    {
      name: "Sellium Neimoidian",
      tp: 1.5,
      bo: 10,
      so: 10,
      sos: 1.24,
      os: 1.25,
      ss: 1.13,
      mstc: 15,
    },
    {
      name: "Ribsy Set 5 - Test 8",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.8,
      os: 1.25,
      ss: 1.05,
      mstc: 18,
    },
    {
      name: "MegaAramisoff Nutcracker-2",
      tp: 1.7,
      bo: 10,
      so: 20,
      sos: 1.6,
      os: 1.53,
      ss: 1.2,
      mstc: 10,
    },
    {
      name: "Trade Alts TA Standard",
      tp: 1.5,
      bo: 10,
      so: 20,
      sos: 2.0,
      os: 1.05,
      ss: 1.0,
      mstc: 30,
    },
    {
      name: "Ribsy Set 5 - Test 10",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.6,
      os: 1.2,
      ss: 1.01,
      mstc: 25,
    },
    {
      name: "Sellium Profundity",
      tp: 2.0,
      bo: 10,
      so: 10,
      sos: 1.75,
      os: 1.23,
      ss: 1.11,
      mstc: 15,
    },
    {
      name: "BlueCookie ScarTA+",
      tp: 2.0,
      bo: 10,
      so: 10,
      sos: 2.0,
      os: 1.08,
      ss: 0.97,
      mstc: 31,
    },
    {
      name: "Nooun Verrb",
      tp: 2.0,
      bo: 10,
      so: 10,
      sos: 1.4,
      os: 1.4,
      ss: 1.2,
      mstc: 12,
    },
    {
      name: "Trade Alts TA Safer",
      tp: 1.5,
      bo: 10,
      so: 10,
      sos: 2.4,
      os: 1.05,
      ss: 1.0,
      mstc: 25,
    },
    {
      name: "BlueCoockie ScarTA",
      tp: 1.1,
      bo: 10,
      so: 10,
      sos: 2.0,
      os: 1.05,
      ss: 0.97,
      mstc: 31,
    },
    {
      name: "Trade Alts TA Riskier",
      tp: 1.0,
      bo: 10,
      so: 15,
      sos: 2.0,
      os: 1.05,
      ss: 1.0,
      mstc: 30,
    },
    {
      name: "BlueCoockie ScarTEC",
      tp: 1.1,
      bo: 10,
      so: 10,
      sos: 2.0,
      os: 1.05,
      ss: 0.96,
      mstc: 40,
    },
    {
      name: "willieblunt halfnhalf",
      tp: 1.5,
      bo: 11,
      so: 11,
      sos: 2.2,
      os: 1.05,
      ss: 0.97,
      mstc: 38,
    },
    {
      name: "Trade Alts TA Very Aggressive",
      tp: 1.0,
      bo: 10,
      so: 20,
      sos: 2.5,
      os: 1.05,
      ss: 1.0,
      mstc: 20,
    },
    {
      name: "Mearin91 Mearin91",
      tp: 2.0,
      bo: 13,
      so: 17,
      sos: 1.56,
      os: 1.06,
      ss: 1.01,
      mstc: 33,
    },
    {
      name: "Trade Alts TA Riskier 2",
      tp: 1.0,
      bo: 10,
      so: 15,
      sos: 2.4,
      os: 1.05,
      ss: 1.0,
      mstc: 25,
    },
    {
      name: "TheAlpha Alpha Deep Drop MSTC 25 (Passive)",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 2.0,
      os: 1.17,
      ss: 1.0,
      mstc: 25,
    },
    {
      name: "Bobwood 0.6 SOS Sniping/DCA",
      tp: 1.0,
      bo: 10,
      so: 10,
      sos: 0.6,
      os: 1.4,
      ss: 1.3,
      mstc: 13,
    },
    {
      name: "Trade Alts TA Standard v2",
      tp: 1.25,
      bo: 10,
      so: 10,
      sos: 2.0,
      os: 1.09,
      ss: 1.0,
      mstc: 30,
    },
    {
      name: "Shwao Shwao - ConsoliKing",
      tp: 4.0,
      bo: 10,
      so: 35,
      sos: 1.55,
      os: 1.05,
      ss: 1.0,
      mstc: 36,
    },
    {
      name: "Bluecookie BlueTec (beta)",
      tp: 2.0,
      bo: 10,
      so: 10,
      sos: 1.8,
      os: 1.01,
      ss: 0.97,
      mstc: 79,
    },
    {
      name: "Ribsy Set 5 - Test 9",
      tp: 3.0,
      bo: 30,
      so: 10,
      sos: 1.65,
      os: 1.6,
      ss: 1.05,
      mstc: 14,
    },
    {
      name: "Ribsy Set 5 - Test 5",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.5,
      os: 1.7,
      ss: 1.26,
      mstc: 9,
    },
    {
      name: "Mantis Big BankRoll",
      tp: 1.0,
      bo: 10,
      so: 20,
      sos: 1.45,
      os: 1.06,
      ss: 1.0,
      mstc: 42,
    },
    {
      name: "Ribsy Set 5 - Test 1 (passive)",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.4,
      os: 1.15,
      ss: 1.07,
      mstc: 20,
    },
    {
      name: "Bobwood 1.0 SOS Sniping/DCA",
      tp: 1.0,
      bo: 10,
      so: 10,
      sos: 1.0,
      os: 1.3,
      ss: 1.23,
      mstc: 13,
    },
    {
      name: "Bluecookie GreenTec (beta)",
      tp: 2.0,
      bo: 10,
      so: 10,
      sos: 2.0,
      os: 1.01,
      ss: 0.97,
      mstc: 76,
    },
    {
      name: "Ribsy Set 5 - Test 5 (passive)",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.5,
      os: 1.7,
      ss: 1.26,
      mstc: 11,
    },
    {
      name: "Ribsy Set 5 - Test 7",
      tp: 3.0,
      bo: 30,
      so: 10,
      sos: 1.4,
      os: 1.7,
      ss: 1.27,
      mstc: 9,
    },
    {
      name: "Anked Scarlet",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.5,
      os: 1.03,
      ss: 0.97,
      mstc: 53,
    },
    {
      name: "Ribsy Set 5 - Test 6",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.5,
      os: 1.2,
      ss: 1.03,
      mstc: 20,
    },
    {
      name: "Ryzen Catalyst",
      tp: 2.0,
      bo: 10,
      so: 10,
      sos: 5.0,
      os: 1.12,
      ss: 1.0,
      mstc: 11,
    },
    {
      name: "Shwao ConsoliQueen",
      tp: 2.5,
      bo: 10,
      so: 23,
      sos: 2.3,
      os: 1.09,
      ss: 1.02,
      mstc: 18,
    },
    {
      name: "Trade Alts TA Strong Uptrend",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 2.0,
      os: 1.4,
      ss: 1.23,
      mstc: 10,
    },
    {
      name: "Trade Alts TA Deep Retracement",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 2.0,
      os: 2.0,
      ss: 1.4,
      mstc: 8,
    },
    {
      name: "Heopas Heopas",
      tp: 1.25,
      bo: 10,
      so: 20,
      sos: 1.45,
      os: 1.04,
      ss: 1.0,
      mstc: 30,
    },
    {
      name: "Ribsy Chimera",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.6,
      os: 1.2,
      ss: 1.11,
      mstc: 15,
    },
    {
      name: "Zeke Kiri v2",
      tp: 3.0,
      bo: 100,
      so: 10,
      sos: 1.25,
      os: 1.01,
      ss: 0.98,
      mstc: 100,
    },
    {
      name: "Ribsy Aqrabuamelu",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.0,
      os: 1.4,
      ss: 1.26,
      mstc: 12,
    },
    {
      name: "TheAlpha Alpha+",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 2.0,
      os: 1.5,
      ss: 1.2,
      mstc: 9,
    },
    {
      name: "Bobwood FrontLoaded 0.6 SOS Sniping/DCA",
      tp: 1.0,
      bo: 50,
      so: 10,
      sos: 0.6,
      os: 1.4,
      ss: 1.3,
      mstc: 13,
    },
    {
      name: "Ribsy Mercury",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 2.0,
      os: 1.5,
      ss: 1.3,
      mstc: 8,
    },
    {
      name: "Thrill  XL v2",
      tp: 3.0,
      bo: 100,
      so: 10,
      sos: 1.15,
      os: 1.05,
      ss: 1.0,
      mstc: 45,
    },
    {
      name: "Thrill + Sellium XL v3",
      tp: 3.0,
      bo: 100,
      so: 10,
      sos: 1.36,
      os: 1.17,
      ss: 1.06,
      mstc: 20,
    },
    {
      name: "Sellium Hammerhead",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 2.05,
      os: 1.41,
      ss: 1.21,
      mstc: 9,
    },
    {
      name: "Thrill  XL v1",
      tp: 3.0,
      bo: 100,
      so: 10,
      sos: 1.15,
      os: 1.16,
      ss: 1.07,
      mstc: 21,
    },
    {
      name: "Ribsy Set 5 - Test 2 (passive)",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.4,
      os: 1.01,
      ss: 0.99,
      mstc: 55,
    },
    {
      name: "Ribsy Set 5 - Test 4 (passive)",
      tp: 3.0,
      bo: 40,
      so: 15,
      sos: 1.2,
      os: 1.19,
      ss: 1.12,
      mstc: 17,
    },
    {
      name: "Sellium Profundity Value Opt3",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.58,
      os: 1.15,
      ss: 1.1,
      mstc: 16,
    },
    {
      name: "Bobwood FrontLoad 1.0 SOS Sniping/DCA",
      tp: 1.0,
      bo: 50,
      so: 10,
      sos: 1.0,
      os: 1.3,
      ss: 1.23,
      mstc: 13,
    },
    {
      name: "Zeke Kiri v4",
      tp: 3.0,
      bo: 50,
      so: 10,
      sos: 1.5,
      os: 1.02,
      ss: 0.99,
      mstc: 51,
    },
    {
      name: "Sellium Profundity Value",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.75,
      os: 1.15,
      ss: 1.09,
      mstc: 15,
    },
    {
      name: "TheAlpha Alpha",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 2.0,
      os: 1.4,
      ss: 1.2,
      mstc: 9,
    },
    {
      name: "Ribsy Banshee (passive)",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.5,
      os: 1.4,
      ss: 1.35,
      mstc: 9,
    },
    {
      name: "Ribsy Mars (passive)",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.8,
      os: 1.4,
      ss: 1.3,
      mstc: 9,
    },
    {
      name: "RN RN v1",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 3.0,
      os: 1.15,
      ss: 1.11,
      mstc: 11,
    },
    {
      name: "Matteo Cazu",
      tp: 2.0,
      bo: 100,
      so: 10,
      sos: 0.9,
      os: 1.52,
      ss: 1.39,
      mstc: 10,
    },
    {
      name: "Ali poise",
      tp: 1.5,
      bo: 10,
      so: 10,
      sos: 1.5,
      os: 1.3,
      ss: 1.3,
      mstc: 9,
    },
    {
      name: "Ribsy Set 5 - Test 1",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.4,
      os: 1.15,
      ss: 1.07,
      mstc: 16,
    },
    {
      name: "Ribsy Kraken",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.0,
      os: 1.55,
      ss: 1.45,
      mstc: 8,
    },
    {
      name: "Ribsy Set 5 - Test 4",
      tp: 3.0,
      bo: 40,
      so: 15,
      sos: 1.2,
      os: 1.19,
      ss: 1.12,
      mstc: 15,
    },
    {
      name: "Sellium Neimoidian Value Opt2",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.28,
      os: 1.13,
      ss: 1.11,
      mstc: 16,
    },
    {
      name: "Ribsy Banshee",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.5,
      os: 1.4,
      ss: 1.35,
      mstc: 8,
    },
    {
      name: "Sellium Acclamator",
      tp: 1.5,
      bo: 10,
      so: 10,
      sos: 1.3,
      os: 1.09,
      ss: 1.07,
      mstc: 17,
    },
    {
      name: "TheAlpha Alpha Lite",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 3.0,
      os: 1.4,
      ss: 1.22,
      mstc: 7,
    },
    {
      name: "Ribsy Set 5 - Test 3 (passive)",
      tp: 3.0,
      bo: 10,
      so: 15,
      sos: 1.0,
      os: 1.01,
      ss: 1.0,
      mstc: 50,
    },
    {
      name: "RN RN v4",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 2.5,
      os: 1.3,
      ss: 1.3,
      mstc: 8,
    },
    {
      name: "Ribsy Mars",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.8,
      os: 1.4,
      ss: 1.3,
      mstc: 8,
    },
    {
      name: "Sellium Ghost",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 2.1,
      os: 1.3,
      ss: 1.3,
      mstc: 8,
    },
    {
      name: "Sellium Neimoidian Value",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.24,
      os: 1.15,
      ss: 1.13,
      mstc: 15,
    },
    {
      name: "C2-Dre Fuze",
      tp: 3.0,
      bo: 12,
      so: 12,
      sos: 1.5,
      os: 1.29,
      ss: 1.22,
      mstc: 10,
    },
    {
      name: "Urma Urma V6",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.87,
      os: 1.4,
      ss: 1.5,
      mstc: 7,
    },
    {
      name: "Burak00 BRK Ultra V2",
      tp: 3.0,
      bo: 10,
      so: 15,
      sos: 1.5,
      os: 1.01,
      ss: 1.0,
      mstc: 30,
    },
    {
      name: "Ribsy Set 5 - Test 2",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.4,
      os: 1.01,
      ss: 0.99,
      mstc: 35,
    },
    {
      name: "Sellium Scimitar",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.44,
      os: 1.33,
      ss: 1.27,
      mstc: 9,
    },
    {
      name: "Sellium OutRider",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.81,
      os: 1.31,
      ss: 1.28,
      mstc: 8,
    },
    {
      name: "Jupiter-Orange Jora",
      tp: 3.0,
      bo: 75,
      so: 10,
      sos: 1.2,
      os: 1.19,
      ss: 1.12,
      mstc: 15,
    },
    {
      name: "Ribsy Set 5 - Test 3",
      tp: 3.0,
      bo: 10,
      so: 15,
      sos: 1.0,
      os: 1.01,
      ss: 1.0,
      mstc: 40,
    },
    {
      name: "Ribsy Oni",
      tp: 3.0,
      bo: 10,
      so: 10,
      sos: 1.0,
      os: 1.4,
      ss: 1.45,
      mstc: 8,
    },
    {
      name: "Mizukage Mizukage v3.1",
      tp: 3.0,
      bo: 100,
      so: 10,
      sos: 0.35,
      os: 1.0,
      ss: 1.01,
      mstc: 100,
    },
    {
      name: "Thrill L v1 - (as in large)",
      tp: 3.0,
      bo: 50,
      so: 50,
      sos: 1.0,
      os: 1.1,
      ss: 1.33,
      mstc: 10,
    },
    {
      name: "Sellium The 69er",
      tp: 2.0,
      bo: 69,
      so: 69,
      sos: 1.89,
      os: 0.85,
      ss: 1.05,
      mstc: 12,
    },
    {
      name: "Sellium The 69er SS",
      tp: 1.5,
      bo: 69,
      so: 69,
      sos: 1.0,
      os: 0.85,
      ss: 1.04,
      mstc: 12,
    },
    {
      name: "Dynamix RedBull(BullMarketOnly)",
      tp: 2.0,
      bo: 13,
      so: 13,
      sos: 0.47,
      os: 0.99,
      ss: 1.1,
      mstc: 21,
    },
    {
      name: "Beam",
      tp: 1.25,
      bo: 10,
      so: 18,
      sos: 1.42,
      os: 1.56,
      ss: 1.23,
      mstc: 10,
    },
    {
      name: "Nutscracker",
      tp: 1.25,
      bo: 10,
      so: 20,
      sos: 1.6,
      os: 1.53,
      ss: 1.2,
      mstc: 10,
    },
    {
      name: "411",
      tp: 0.25,
      bo: 10,
      so: 20,
      sos: 0.9,
      os: 1.48,
      ss: 1.11,
      mstc: 11,
    },
    {
      name: "438",
      tp: 0.25,
      bo: 10,
      so: 30,
      sos: 0.9,
      os: 1.72,
      ss: 1.24,
      mstc: 8,
    },
  ],
};