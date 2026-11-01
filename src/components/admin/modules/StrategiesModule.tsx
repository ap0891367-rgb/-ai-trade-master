"use client";

import React, { useState } from "react";
import {
  Cpu,
  TrendingUp,
  BarChart2,
  Sliders,
  CheckCircle2,
  Sparkles,
  Zap,
  Activity,
  Layers,
  Flame,
  ShieldCheck,
  Compass
} from "lucide-react";

interface StrategyItem {
  id: string;
  name: string;
  category: "QUANT_TECHNICAL" | "F_AND_O_OI" | "ASTRO_TECHNICAL" | "VOLATILITY";
  description: string;
  sharpeRatio: string;
  winRate: string;
  profitFactor: string;
  maxDrawdown: string;
  activeBots: number;
  timeframe: string;
  formula: string;
  parameters: {
    name: string;
    value: string;
  }[];
}

export function StrategiesModule() {
  const [strategies, setStrategies] = useState<StrategyItem[]>([
    {
      id: "strat-1",
      name: "AGNI 30-Agent Multi-Indicator Neural Consensus",
      category: "QUANT_TECHNICAL",
      description: "Aggregates 29 mathematical momentum, trend, volatility, and volume indicators plus Agent #30 Astrologer into a unified directional consensus score.",
      sharpeRatio: "2.42",
      winRate: "74.8%",
      profitFactor: "2.85",
      maxDrawdown: "5.4%",
      activeBots: 2,
      timeframe: "5m / 15m / 1h",
      formula: "Consensus Score = Σ(Weight_i × Verdict_i × Confidence_i) / Σ(Weight_i) ≥ 70%",
      parameters: [
        { name: "Minimum Confluence Threshold", value: "22/30 Agents (73.3%)" },
        { name: "Risk-Reward Filter", value: "1:2.3 Minimum" },
        { name: "Dynamic ATR Trail Multiplier", value: "3.0x" },
      ],
    },
    {
      id: "strat-2",
      name: "NSE 09:15 AM Market Open Open-Interest Surge",
      category: "F_AND_O_OI",
      description: "Captures rapid institutional liquidity buildup within the first 45 minutes of the NSE trading bell strictly filtering for +5.0% to +7.0% Open Interest expansion.",
      sharpeRatio: "2.88",
      winRate: "78.4%",
      profitFactor: "3.20",
      maxDrawdown: "4.8%",
      activeBots: 1,
      timeframe: "9:15 - 10:00 AM IST",
      formula: "OI Surge = 5.0% ≤ ΔOI_open ≤ 7.0% AND Price_delta > 0 (Long Buildup)",
      parameters: [
        { name: "OI Lower Bound", value: "5.0%" },
        { name: "OI Upper Bound", value: "7.0%" },
        { name: "Universe Filter", value: "NSE Top 184 F&O Stocks" },
      ],
    },
    {
      id: "strat-3",
      name: "VWAP & Order Flow Institutional Delta Scalper",
      category: "QUANT_TECHNICAL",
      description: "Tracks aggressive market buyer absorption at institutional VWAP anchors with Order Book delta imbalance exceeding +50,000 lots.",
      sharpeRatio: "2.15",
      winRate: "69.5%",
      profitFactor: "2.40",
      maxDrawdown: "6.2%",
      activeBots: 1,
      timeframe: "1m / 5m Intraday",
      formula: "Delta Scalp = Close > VWAP AND Bid-Ask Delta > +30,000 Lots",
      parameters: [
        { name: "VWAP Anchor Period", value: "Daily Session Rolling" },
        { name: "Delta Imbalance Ratio", value: "1.8x Ask Absorption" },
      ],
    },
    {
      id: "strat-4",
      name: "Astro-Technical Rashi Kundali & Gochar Confluence",
      category: "ASTRO_TECHNICAL",
      description: "Aligns classical Technical breakouts with company incorporation Sthapana horoscope, planetary Gochar (Guru, Surya, Shukra), and Shubh Choghadiya windows.",
      sharpeRatio: "2.30",
      winRate: "72.7%",
      profitFactor: "2.70",
      maxDrawdown: "5.8%",
      activeBots: 1,
      timeframe: "Hourly / Daily EOD",
      formula: "Confluence = Technical BUY AND Graha Gochar in Kendra/Trikona AND Shubh Muhurat",
      parameters: [
        { name: "Astro Weight Factor", value: "1.25x in Master Arbiter" },
        { name: "Muhurat Filter", value: "Abhijit / Amrit Kaal Priority" },
      ],
    },
    {
      id: "strat-5",
      name: "Keltner Channel Squeeze & Bollinger Mean Reversion",
      category: "VOLATILITY",
      description: "Identifies extreme volatility compression squeezes inside Keltner bands and fires explosive breakout sniper entries upon bandwidth release.",
      sharpeRatio: "1.98",
      winRate: "65.0%",
      profitFactor: "2.10",
      maxDrawdown: "7.1%",
      activeBots: 1,
      timeframe: "15m / 1h",
      formula: "Squeeze = Bollinger_20_2 Inside Keltner_20_ATR(20)",
      parameters: [
        { name: "Bollinger Standard Deviation", value: "2.0σ" },
        { name: "Keltner ATR Multiplier", value: "1.5x" },
      ],
    },
  ]);

  const [activeTab, setActiveTab] = useState<string>("ALL");

  const filtered = strategies.filter((s) => {
    if (activeTab === "ALL") return true;
    return s.category === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-[#0d1630] border border-slate-800 p-2 rounded-2xl text-xs">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-3 py-1.5 rounded-xl font-bold transition ${
            activeTab === "ALL" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          All Strategies ({strategies.length})
        </button>
        <button
          onClick={() => setActiveTab("QUANT_TECHNICAL")}
          className={`px-3 py-1.5 rounded-xl font-bold transition ${
            activeTab === "QUANT_TECHNICAL" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Quantitative Technical (2)
        </button>
        <button
          onClick={() => setActiveTab("F_AND_O_OI")}
          className={`px-3 py-1.5 rounded-xl font-bold transition ${
            activeTab === "F_AND_O_OI" ? "bg-orange-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          NSE 9:15 AM OI Models (1)
        </button>
        <button
          onClick={() => setActiveTab("ASTRO_TECHNICAL")}
          className={`px-3 py-1.5 rounded-xl font-bold transition ${
            activeTab === "ASTRO_TECHNICAL" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Astro-Technical Confluence (1)
        </button>
        <button
          onClick={() => setActiveTab("VOLATILITY")}
          className={`px-3 py-1.5 rounded-xl font-bold transition ${
            activeTab === "VOLATILITY" ? "bg-cyan-600 text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          Volatility Squeeze (1)
        </button>
      </div>

      {/* Strategies List */}
      <div className="grid grid-cols-1 gap-5">
        {filtered.map((strat) => (
          <div
            key={strat.id}
            className="p-5 rounded-2xl bg-[#0d1630] border border-slate-800 hover:border-slate-700 transition space-y-4"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl text-white ${
                  strat.category === "F_AND_O_OI"
                    ? "bg-orange-600/30 text-orange-400"
                    : strat.category === "ASTRO_TECHNICAL"
                    ? "bg-purple-600/30 text-yellow-300"
                    : "bg-blue-600/30 text-blue-400"
                }`}>
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{strat.name}</h4>
                  <span className="text-xs text-slate-400 font-mono">
                    Timeframe: {strat.timeframe} • Active Bots: {strat.activeBots}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                  Win Rate: {strat.winRate}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 font-mono font-bold">
                  Sharpe: {strat.sharpeRatio}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {strat.description}
            </p>

            {/* Formula Block */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-300 flex items-center justify-between">
              <span>{strat.formula}</span>
              <span className="text-[10px] text-slate-500 uppercase">Quant Rule</span>
            </div>

            {/* Backtest & Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block uppercase">Profit Factor</span>
                <span className="font-bold text-white text-sm">{strat.profitFactor}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block uppercase">Max Drawdown</span>
                <span className="font-bold text-rose-400 text-sm">{strat.maxDrawdown}</span>
              </div>
              {strat.parameters.slice(0, 2).map((param, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block uppercase truncate">{param.name}</span>
                  <span className="font-bold text-blue-300 text-sm truncate block">{param.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
