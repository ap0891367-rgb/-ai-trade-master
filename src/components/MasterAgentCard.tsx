"use client";

import React from "react";
import { MasterAgentAnalysis } from "@/lib/agents/types";
import { 
  Bot, 
  Sparkles, 
  Zap, 
  ArrowUpRight, 
  Activity,
  Target,
  Shield,
  TrendingUp,
  TrendingDown,
  Info
} from "lucide-react";

interface MasterAgentCardProps {
  analysis: MasterAgentAnalysis | null;
  onExecuteTrade: (side: "BUY" | "SELL", amount: number) => void;
  onRefreshScan: () => void;
  isScanning: boolean;
  autoTradingEnabled: boolean;
  onToggleAutoTrading: () => void;
}

export function MasterAgentCard({
  analysis,
  onExecuteTrade,
  onRefreshScan,
  isScanning,
  autoTradingEnabled,
  onToggleAutoTrading,
}: MasterAgentCardProps) {
  if (!analysis) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
        <p className="text-xs">Analyzing 30 quantitative indicators & astrological factors...</p>
      </div>
    );
  }

  const curr = analysis.currencyPrefix || "₹";

  const getVerdictBadge = () => {
    switch (analysis.verdict) {
      case "STRONG_BUY":
        return {
          bg: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400",
          dot: "bg-emerald-400",
          label: "Strong Buy Recommended",
        };
      case "BUY":
        return {
          bg: "bg-green-500/15 border-green-500/40 text-green-400",
          dot: "bg-green-400",
          label: "Buy Signal Active",
        };
      case "STRONG_SELL":
        return {
          bg: "bg-rose-500/15 border-rose-500/40 text-rose-400",
          dot: "bg-rose-400",
          label: "Strong Sell / Exit",
        };
      case "SELL":
        return {
          bg: "bg-amber-500/15 border-amber-500/40 text-amber-400",
          dot: "bg-amber-400",
          label: "Sell / Profit Booking",
        };
      default:
        return {
          bg: "bg-slate-800 border-slate-700 text-slate-300",
          dot: "bg-slate-400",
          label: "Hold / Range Consolidation",
        };
    }
  };

  const badge = getVerdictBadge();

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Main Agent Consensus Arbiter
              </h2>
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {analysis.exchange}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Synthesis of 29 technical indicators & Astrologer Agent #30
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAutoTrading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              autoTradingEnabled
                ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300"
                : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${autoTradingEnabled ? "fill-emerald-400 text-emerald-400" : ""}`} />
            <span>Auto-Trading: {autoTradingEnabled ? "Active" : "Off"}</span>
          </button>

          <button
            onClick={onRefreshScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition disabled:opacity-50"
          >
            <Activity className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            <span>{isScanning ? "Evaluating..." : "Scan 30 Agents"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Consensus, Levels & Astrologer */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Consensus Meter (5 cols) */}
        <div className="md:col-span-5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Instrument: <strong className="text-white">{analysis.symbol}</strong></span>
              <span>{analysis.overallConfidence}% Confidence</span>
            </div>

            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-bold ${badge.bg}`}>
              <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
              <span>{badge.label}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Agent Voting Ratio</span>
              <span className="font-mono font-semibold text-white">{analysis.buyVotes}/30 Buy</span>
            </div>

            {/* Voting Bar */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${(analysis.buyVotes / 30) * 100}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`${analysis.buyVotes} Buy Votes`}
              />
              <div
                style={{ width: `${(analysis.holdVotes / 30) * 100}%` }}
                className="bg-amber-500 h-full transition-all"
                title={`${analysis.holdVotes} Hold Votes`}
              />
              <div
                style={{ width: `${(analysis.sellVotes / 30) * 100}%` }}
                className="bg-rose-500 h-full transition-all"
                title={`${analysis.sellVotes} Sell Votes`}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-0.5">
              <span className="text-emerald-400 font-semibold">{analysis.buyVotes} Buy</span>
              <span className="text-amber-400 font-semibold">{analysis.holdVotes} Hold</span>
              <span className="text-rose-400 font-semibold">{analysis.sellVotes} Sell</span>
            </div>
          </div>
        </div>

        {/* Order Levels & Trade Execution (4 cols) */}
        <div className="md:col-span-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Entry & Exit Plan</span>
            <span className="text-blue-400 font-mono text-[11px]">R:R {analysis.riskRewardRatio}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Entry Price</span>
              <span className="text-white font-bold text-xs">{curr}{analysis.entryPrice.toFixed(2)}</span>
            </div>
            <div className="bg-emerald-950/20 p-2 rounded-lg border border-emerald-900/40">
              <span className="text-[10px] text-emerald-400 block font-sans">Target (TP)</span>
              <span className="text-emerald-300 font-bold text-xs">{curr}{analysis.targetPrice.toFixed(2)}</span>
            </div>
            <div className="bg-rose-950/20 p-2 rounded-lg border border-rose-900/40">
              <span className="text-[10px] text-rose-400 block font-sans">Stop Loss (SL)</span>
              <span className="text-rose-300 font-bold text-xs">{curr}{analysis.stopLoss.toFixed(2)}</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Est. Return</span>
              <span className="text-emerald-400 font-bold text-xs">+3.6%</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onExecuteTrade("BUY", 25000)}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Buy ({curr}25k)</span>
            </button>
            <button
              onClick={() => onExecuteTrade("SELL", 25000)}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition"
            >
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* Astrologer Agent #30 (3 cols) */}
        <div className="md:col-span-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between space-y-2.5">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-yellow-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Agent #30</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
                {analysis.astroHighlights.muhurat}
              </span>
            </div>

            <div className="font-bold text-white text-xs mt-1">
              {analysis.astroHighlights.rashi} ({analysis.astroHighlights.rashiLord})
            </div>

            <p className="text-[11px] text-slate-300 leading-snug line-clamp-3 mt-1">
              {analysis.astroHighlights.summary}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Astro Signal:</span>
            <span className="text-emerald-400 font-bold">{analysis.astroHighlights.verdict}</span>
          </div>
        </div>
      </div>

      {/* Human-Readable Advice Message */}
      <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-blue-400 font-semibold mr-1">Consensus Note:</strong>
          <span>{analysis.recommendedActionHi}</span>
        </div>
      </div>
    </div>
  );
}
