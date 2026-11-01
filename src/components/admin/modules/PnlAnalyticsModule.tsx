"use client";

import React from "react";
import {
  TrendingUp,
  BarChart3,
  Percent,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Calendar
} from "lucide-react";

export function PnlAnalyticsModule() {
  const dailyPnlHistory = [
    { day: "Mon", pnl: 24500, trades: 18, winRate: "72%" },
    { day: "Tue", pnl: 31200, trades: 24, winRate: "79%" },
    { day: "Wed", pnl: -6400, trades: 14, winRate: "57%" },
    { day: "Thu", pnl: 48900, trades: 28, winRate: "82%" },
    { day: "Fri", pnl: 38200, trades: 21, winRate: "76%" },
    { day: "Sat (Crypto)", pnl: 12100, trades: 12, winRate: "66%" },
    { day: "Sun (Crypto)", pnl: 18800, trades: 15, winRate: "73%" },
  ];

  const totalWeeklyPnl = dailyPnlHistory.reduce((acc, d) => acc + d.pnl, 0);

  const topSymbols = [
    { symbol: "BANKNIFTY", trades: 44, winRate: "77.2%", pnl: "+₹42,100", exchange: "Angel One (NSE)" },
    { symbol: "RELIANCE", trades: 38, winRate: "73.6%", pnl: "+₹28,450", exchange: "Angel One (NSE)" },
    { symbol: "XAU/USD", trades: 31, winRate: "70.9%", pnl: "+₹21,600", exchange: "Forex" },
    { symbol: "BTC/USDT", trades: 29, winRate: "69.0%", pnl: "+₹18,200", exchange: "Delta Exchange" },
    { symbol: "TATASTEEL", trades: 22, winRate: "72.7%", pnl: "+₹14,800", exchange: "Angel One (NSE)" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0d1630] border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">7-Day Net P&L</span>
          <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-2">
            +₹{totalWeeklyPnl.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-slate-400 mt-1">Across 132 simulated trades</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d1630] border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Overall Win Rate</span>
          <div className="text-2xl font-mono font-extrabold text-blue-400 mt-2">
            73.4%
          </div>
          <div className="text-xs text-slate-400 mt-1">97 Wins / 35 Losses</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d1630] border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Sharpe Ratio</span>
          <div className="text-2xl font-mono font-extrabold text-purple-400 mt-2">
            2.48
          </div>
          <div className="text-xs text-emerald-400 mt-1">Institutional Grade (&gt; 2.0)</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d1630] border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Max Drawdown</span>
          <div className="text-2xl font-mono font-extrabold text-rose-400 mt-2">
            -5.2%
          </div>
          <div className="text-xs text-slate-400 mt-1">Safe within 10% circuit limit</div>
        </div>
      </div>

      {/* Visual Simulated Cumulative Equity Curve */}
      <div className="p-5 rounded-2xl bg-[#0d1630] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Simulated Cumulative Equity Growth Curve (7-Day Trend)</span>
            </h3>
            <p className="text-xs text-slate-400">Continuous execution compounding across active AI strategies</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-lg">
            +18.4% Return on Virtual Capital
          </span>
        </div>

        {/* SVG Equity Graph */}
        <div className="h-44 w-full">
          <svg viewBox="0 0 700 160" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="pnlGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <polyline
              fill="url(#pnlGrad)"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points="20,130 110,105 200,90 290,110 380,60 470,45 560,35 680,18"
            />
            {/* Grid line */}
            <line x1="20" y1="140" x2="680" y2="140" stroke="#1e293b" strokeDasharray="3 3" />
          </svg>
        </div>

        <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800">
          {dailyPnlHistory.map((d, i) => (
            <div key={i} className="text-center">
              <div className="text-white font-bold">{d.day}</div>
              <div className={d.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}>
                {d.pnl >= 0 ? "+" : ""}₹{Math.abs(d.pnl / 1000).toFixed(1)}k
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Asset Breakdown */}
      <div className="p-5 rounded-2xl bg-[#0d1630] border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <span>Top Performing Simulated Instruments by Alpha Generation</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {topSymbols.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-sm">{item.symbol}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-blue-300 font-mono">
                  #{idx + 1}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">{item.exchange}</div>
              <div className="text-base font-mono font-bold text-emerald-400 pt-1">{item.pnl}</div>
              <div className="text-[10px] text-slate-400 font-mono flex justify-between pt-1 border-t border-slate-800">
                <span>{item.trades} Trades</span>
                <span className="text-emerald-400 font-bold">{item.winRate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
