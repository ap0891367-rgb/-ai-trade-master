"use client";

import React, { useState } from "react";
import {
  FastForward,
  Play,
  RotateCcw,
  BarChart2,
  TrendingUp,
  Percent,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";

interface BacktestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSymbol: string;
}

export function BacktestRunnerModal({
  isOpen,
  onClose,
  selectedSymbol,
}: BacktestRunnerModalProps) {
  const [strategyCode, setStrategyCode] = useState("30-Agent Consensus");
  const [symbol, setSymbol] = useState(selectedSymbol || "RELIANCE");
  const [timeframe, setTimeframe] = useState("15m");
  const [initialCapital, setInitialCapital] = useState("500000");
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-09-30");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleRunBacktest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/backtests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategyCode,
          symbol,
          timeframe,
          initialCapital,
          startDate,
          endDate,
        }),
      });
      const data = await res.json();
      if (data.backtest) {
        setResult(data.backtest);
      }
    } catch (e) {
      console.error("Backtest failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 text-white">
      <div className="bg-[#0b1329] border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#090f20]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
              <FastForward className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Strategy Backtesting Engine</h3>
              <p className="text-xs text-slate-400">Tick-by-tick simulation without lookahead bias</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          <form onSubmit={handleRunBacktest} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Strategy Algorithm</label>
                <select
                  value={strategyCode}
                  onChange={(e) => setStrategyCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                >
                  <option value="30-Agent Consensus">30-Agent Consensus Engine</option>
                  <option value="NSE 9:15 OI Surge">NSE 9:15 AM Open Interest Surge</option>
                  <option value="VWAP Institutional Scalper">VWAP Institutional Scalper</option>
                  <option value="Astro-Technical Confluence">Astro-Technical Rashi Confluence</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Asset Symbol</label>
                <input
                  type="text"
                  required
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">Timeframe</label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                >
                  <option value="5m">5 Minute</option>
                  <option value="15m">15 Minute</option>
                  <option value="1h">1 Hour</option>
                  <option value="1D">1 Day (EOD)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition mt-2"
            >
              <Play className="w-4 h-4" />
              <span>{loading ? "Running Quant Backtest Simulation..." : "Run Historical Backtest"}</span>
            </button>
          </form>

          {/* Results Output */}
          {result && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white text-xs">{result.strategyCode} on {result.symbol}</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  +{result.netProfitPct}% Total Net Profit
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Net Profit</span>
                  <span className="font-bold text-emerald-400">₹{Number(result.netProfit).toLocaleString("en-IN")}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Win Rate</span>
                  <span className="font-bold text-blue-400">{result.winRate}%</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Total Trades</span>
                  <span className="font-bold text-white">{result.totalTrades}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Sharpe Ratio</span>
                  <span className="font-bold text-purple-400">{result.sharpeRatio}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 font-mono pt-1 flex justify-between">
                <span>Drawdown: <strong className="text-rose-400">-{result.maxDrawdownPct}%</strong></span>
                <span>Period: {result.startDate} to {result.endDate}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
