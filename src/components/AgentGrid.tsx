"use client";

import React, { useState } from "react";
import { AgentSignal, AgentCategory } from "@/lib/agents/types";
import { 
  Activity, 
  GitCompare, 
  TrendingUp, 
  Maximize2, 
  Compass, 
  Gauge, 
  Anchor, 
  BarChart2, 
  Waves, 
  Cloud, 
  Divide, 
  Zap, 
  Crosshair, 
  CandlestickChart, 
  Flame, 
  Layers, 
  ShieldAlert, 
  Sliders, 
  Target, 
  DollarSign, 
  Percent, 
  Cpu, 
  Shield, 
  Minimize, 
  FastForward, 
  Scale, 
  Newspaper, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  Search,
  CheckCircle,
  XCircle,
  HelpCircle,
  Info
} from "lucide-react";

interface AgentGridProps {
  signals: AgentSignal[];
}

// Icon mapper
const ICON_MAP: Record<string, React.ReactNode> = {
  Activity: <Activity className="w-4 h-4" />,
  GitCompare: <GitCompare className="w-4 h-4" />,
  Maximize2: <Maximize2 className="w-4 h-4" />,
  TrendingUp: <TrendingUp className="w-4 h-4" />,
  Compass: <Compass className="w-4 h-4" />,
  Gauge: <Gauge className="w-4 h-4" />,
  Anchor: <Anchor className="w-4 h-4" />,
  BarChart2: <BarChart2 className="w-4 h-4" />,
  Waves: <Waves className="w-4 h-4" />,
  Cloud: <Cloud className="w-4 h-4" />,
  Divide: <Divide className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  Crosshair: <Crosshair className="w-4 h-4" />,
  CandlestickChart: <CandlestickChart className="w-4 h-4" />,
  Flame: <Flame className="w-4 h-4" />,
  Layers: <Layers className="w-4 h-4" />,
  ShieldAlert: <ShieldAlert className="w-4 h-4" />,
  Sliders: <Sliders className="w-4 h-4" />,
  Target: <Target className="w-4 h-4" />,
  DollarSign: <DollarSign className="w-4 h-4" />,
  Percent: <Percent className="w-4 h-4" />,
  Cpu: <Cpu className="w-4 h-4" />,
  Shield: <Shield className="w-4 h-4" />,
  Minimize: <Minimize className="w-4 h-4" />,
  FastForward: <FastForward className="w-4 h-4" />,
  Scale: <Scale className="w-4 h-4" />,
  Newspaper: <Newspaper className="w-4 h-4" />,
  Clock: <Clock className="w-4 h-4" />,
  ShieldCheck: <ShieldCheck className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
};

export function AgentGrid({ signals }: AgentGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    { key: "ALL", label: `All 30 Agents (${signals.length})` },
    { key: "MOMENTUM", label: "Momentum (6)" },
    { key: "TREND", label: "Trend (7)" },
    { key: "VOLATILITY", label: "Volatility (3)" },
    { key: "VOLUME", label: "Volume & Flow (5)" },
    { key: "PRICE_ACTION", label: "Price Action (3)" },
    { key: "SENTIMENT", label: "Sentiment & News (1)" },
    { key: "RISK", label: "Risk Guard (1)" },
    { key: "ASTROLOGY", label: "✨ Astrologer Agent (1)" },
  ];

  const filteredSignals = signals.filter(signal => {
    const matchesCat = selectedCategory === "ALL" || signal.category === selectedCategory;
    const matchesQuery = 
      signal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      signal.reading.toLowerCase().includes(searchQuery.toLowerCase()) ||
      signal.detailHi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(signal.agentNumber).includes(searchQuery);
    return matchesCat && matchesQuery;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-white">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>30-AGENT LIVE ANALYSIS MATRIX</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
              All 30 Specialist Agents
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time feed of mathematical indicators, order flow, patterns, and zodiac rashi signals reporting to the Main Agent.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64 min-w-0">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search agents or indicators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 sm:py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar touch-scroll border-b border-slate-800/80">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3 py-2 sm:py-1.5 min-h-9 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.key
                ? cat.key === "ASTROLOGY" 
                  ? "bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/30"
                  : "bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30"
                : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 30 Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {filteredSignals.map(signal => {
          const isAstro = signal.agentNumber === 30 || signal.category === "ASTROLOGY";
          const isBuy = signal.verdict === "BUY";
          const isSell = signal.verdict === "SELL";

          return (
            <div
              key={signal.agentId}
              className={`rounded-xl p-4 border transition-all duration-200 hover:translate-y-[-2px] flex flex-col justify-between ${
                isAstro
                  ? "bg-gradient-to-br from-purple-950/40 via-indigo-950/30 to-slate-900 border-purple-500/40 shadow-lg shadow-purple-500/10"
                  : isBuy
                  ? "bg-slate-800/40 border-slate-700/70 hover:border-emerald-500/40"
                  : isSell
                  ? "bg-slate-800/40 border-slate-700/70 hover:border-rose-500/40"
                  : "bg-slate-800/40 border-slate-700/70 hover:border-amber-500/40"
              }`}
            >
              {/* Agent Title & Icon */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      isAstro
                        ? "bg-purple-500/20 text-yellow-300"
                        : isBuy
                        ? "bg-emerald-500/20 text-emerald-400"
                        : isSell
                        ? "bg-rose-500/20 text-rose-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {ICON_MAP[signal.icon] || <Activity className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-300">
                          #{signal.agentNumber}
                        </span>
                        <h4 className="text-xs font-bold text-white line-clamp-1">
                          {signal.name}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {signal.category}
                      </span>
                    </div>
                  </div>

                  {/* Verdict badge */}
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 ${
                    isBuy
                      ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                      : isSell
                      ? "bg-rose-500/20 border border-rose-500/40 text-rose-400"
                      : "bg-amber-500/20 border border-amber-500/40 text-amber-400"
                  }`}>
                    {isBuy ? <CheckCircle className="w-3 h-3" /> : isSell ? <XCircle className="w-3 h-3" /> : <HelpCircle className="w-3 h-3" />}
                    {signal.verdict}
                  </span>
                </div>

                {/* Live Reading */}
                <div className={`p-2 rounded-lg text-xs font-mono font-medium mb-2 border ${
                  isAstro
                    ? "bg-purple-900/30 border-purple-500/30 text-yellow-200"
                    : "bg-slate-900/90 border-slate-800 text-slate-200"
                }`}>
                  {signal.reading}
                </div>

                {/* Hindi Explanation */}
                <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                  {signal.detailHi}
                </p>
              </div>

              {/* Bottom Meta & Confidence */}
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                  <span>Confidence:</span>
                  <strong className="text-white font-mono">{signal.confidence}%</strong>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px]">Weight:</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px] font-mono">
                    {signal.weight}x
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
