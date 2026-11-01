"use client";

import React, { useState, useEffect } from "react";
import { 
  Sun, 
  TrendingUp, 
  Activity, 
  Zap, 
  X, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Layers, 
  RefreshCw, 
  ShieldAlert, 
  Flame,
  ArrowRight
} from "lucide-react";
import { NseOiSymbolData } from "@/app/api/agents/nse-oi/route";

interface NseOiScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSymbol: (symbol: string) => void;
}

export function NseOiScannerModal({
  isOpen,
  onClose,
  onSelectSymbol,
}: NseOiScannerModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filterBuildup, setFilterBuildup] = useState<string>("ALL");

  const fetchNseOi = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agents/nse-oi");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error("Failed to fetch NSE OI data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNseOi();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const symbols: NseOiSymbolData[] = data?.symbols || [];
  const filteredSymbols = symbols.filter(s => {
    if (filterBuildup === "ALL") return true;
    return s.buildupType === filterBuildup;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col text-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 shrink-0">
              <Sun className="w-6 h-6 animate-spin" style={{ animationDuration: "20s" }} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  NSE 9:15 AM OI Scanner Agent
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-mono font-bold border border-orange-500/30">
                  5% to 7% OI FILTER
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Morning 9:15 AM NSE Derivative Feed • Scans 184 F&O Stocks for 5% to 7% Open Interest Spikes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchNseOi}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Re-run 9:15 AM Scan"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Metrics Banner */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Scheduled Scan</span>
            <div className="text-sm font-bold text-amber-400 mt-0.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>09:15 AM Daily</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">OI Range Target</span>
            <div className="text-sm font-bold text-emerald-400 mt-0.5 font-mono">
              5.0% — 7.0% OI
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">NSE F&O Scanned</span>
            <div className="text-sm font-bold text-blue-400 mt-0.5 font-mono">
              {data?.totalNseScanned || 184} Universe
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Symbols Discovered</span>
            <div className="text-sm font-bold text-white mt-0.5 font-mono">
              {filteredSymbols.length} Candidates
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-900/40 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider shrink-0">Filter Buildup:</span>
          <button
            onClick={() => setFilterBuildup("ALL")}
            className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 ${
              filterBuildup === "ALL" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            All 5-7% OI ({symbols.length})
          </button>
          <button
            onClick={() => setFilterBuildup("LONG_BUILDUP")}
            className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 ${
              filterBuildup === "LONG_BUILDUP" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            🟢 Long Buildup (Bullish Breakouts)
          </button>
          <button
            onClick={() => setFilterBuildup("SHORT_BUILDUP")}
            className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 ${
              filterBuildup === "SHORT_BUILDUP" ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            🔴 Short Buildup
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {filteredSymbols.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              {loading ? "Scanning NSE Website for 5% to 7% Open Interest..." : "No symbols currently matching the 5% to 7% OI filter."}
            </div>
          ) : (
            filteredSymbols.map((item) => {
              const isBull = item.buildupType === "LONG_BUILDUP";

              return (
                <div
                  key={item.symbol}
                  className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/80 hover:border-orange-500/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md"
                >
                  {/* Left Column: Symbol & Astrological Rashi */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-sm font-bold text-yellow-400 shrink-0">
                        {item.rashiSymbol}
                      </div>
                      <span className="font-extrabold text-white text-sm">{item.symbol}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40">
                        ⚡ +{item.oiChangePercent}% OI
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                        isBull ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                      }`}>
                        {isBull ? "LONG BUILDUP" : "SHORT BUILDUP"}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 font-medium">
                      {item.companyName} • <span className="text-yellow-300/80 font-mono text-[11px]">{item.rashi}</span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                      {item.actionHi}
                    </p>
                  </div>

                  {/* Right Column: Price & 30-Agent Action Button */}
                  <div className="flex items-center md:flex-col md:items-end justify-between md:justify-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-700/60">
                    <div className="text-left md:text-right font-mono">
                      <div className="text-base font-bold text-white">
                        ₹{item.cmp.toFixed(2)}
                      </div>
                      <div className={`text-xs font-semibold ${item.priceChangePercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {item.priceChangePercent >= 0 ? "+" : ""}{item.priceChangePercent}% Price Move
                      </div>
                      <div className="text-[10px] text-slate-500">
                        OI Contracts: {item.totalOiContracts.toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectSymbol(item.symbol);
                        onClose();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-orange-600/25"
                    >
                      <span>Analyze in 30 Agents</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-orange-400" />
            <span>Agent 9:15 AM triggers immediately at NSE Market Open bell</span>
          </span>
          <span className="font-mono text-emerald-400 font-bold">
            9:15 AM Open OI Stream Active
          </span>
        </div>
      </div>
    </div>
  );
}
