"use client";

import React, { useState } from "react";
import {
  Briefcase,
  PieChart,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Layers,
  ArrowUpRight,
  DollarSign
} from "lucide-react";

export function PortfolioModule() {
  const assetAllocation = [
    { name: "NSE Indian Equities (Angel One)", allocation: "54.5%", value: "₹34,80,000", color: "bg-emerald-500", trades: 48 },
    { name: "Delta Exchange Crypto Perpetuals", allocation: "28.0%", value: "₹17,90,000", color: "bg-purple-500", trades: 31 },
    { name: "Global Forex & Bullion (Gold/Crude)", allocation: "17.5%", value: "₹11,15,000", color: "bg-cyan-500", trades: 22 },
  ];

  const openPositions = [
    { symbol: "RELIANCE", assetClass: "NSE Equities", exchange: "Angel One (NSE)", side: "BUY", qty: 25, entryPrice: 2942.50, currentPrice: 2986.05, pnl: +1088.75, pnlPct: +1.48, margin: "₹73,562" },
    { symbol: "BANKNIFTY", assetClass: "NSE F&O", exchange: "Angel One (NSE)", side: "BUY", qty: 15, entryPrice: 48250.00, currentPrice: 49234.30, pnl: +14764.50, pnlPct: +2.04, margin: "₹1,20,000" },
    { symbol: "BTC/USDT", assetClass: "Crypto Perp", exchange: "Delta Exchange", side: "BUY", qty: 0.25, entryPrice: 88400.00, currentPrice: 87906.30, pnl: -123.42, pnlPct: -0.56, margin: "₹45,000" },
    { symbol: "XAU/USD", assetClass: "Bullion", exchange: "Forex / Commodities", side: "BUY", qty: 5, entryPrice: 2745.50, currentPrice: 2768.20, pnl: +113.50, pnlPct: +0.83, margin: "₹35,000" },
    { symbol: "TATASTEEL", assetClass: "NSE Equities", exchange: "Angel One (NSE)", side: "BUY", qty: 150, entryPrice: 162.40, currentPrice: 164.35, pnl: +292.50, pnlPct: +1.20, margin: "₹24,360" },
  ];

  return (
    <div className="space-y-6">
      {/* Allocation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {assetAllocation.map((item, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-[#0d1630] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.name}</span>
              <span className={`w-3 h-3 rounded-full ${item.color}`} />
            </div>

            <div className="text-2xl font-mono font-extrabold text-white">
              {item.value}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Share: <strong className="text-blue-400">{item.allocation}</strong></span>
              <span>{item.trades} Active Demo Trades</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div style={{ width: item.allocation }} className={`h-full ${item.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Aggregate Open Positions Table */}
      <div className="bg-[#0d1630] border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Consolidated Demo Open Positions (Market Exposure)</h3>
          </div>
          <span className="text-xs text-emerald-400 font-mono font-bold">
            Live Risk: Normal (Margin Exposure: 38.5%)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Asset</th>
                <th className="p-3">Exchange</th>
                <th className="p-3">Side</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Avg Entry</th>
                <th className="p-3">Live Price</th>
                <th className="p-3">Margin Utilized</th>
                <th className="p-3 text-right">Unrealized P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {openPositions.map((pos, idx) => {
                const isProfit = pos.pnl >= 0;
                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-bold text-white text-xs">{pos.symbol}</td>
                    <td className="p-3 font-mono text-slate-400 text-[11px]">{pos.exchange}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-500/20 text-emerald-400">
                        {pos.side}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-300">{pos.qty}</td>
                    <td className="p-3 font-mono text-slate-300">₹{pos.entryPrice.toFixed(2)}</td>
                    <td className="p-3 font-mono font-bold text-white">₹{pos.currentPrice.toFixed(2)}</td>
                    <td className="p-3 font-mono text-blue-300">{pos.margin}</td>
                    <td className="p-3 text-right font-mono font-bold">
                      <span className={isProfit ? "text-emerald-400" : "text-rose-400"}>
                        {isProfit ? "+" : ""}₹{pos.pnl.toFixed(2)} ({isProfit ? "+" : ""}{pos.pnlPct}%)
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
