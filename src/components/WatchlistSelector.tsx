"use client";

import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { ASTRO_COMPANIES } from "@/lib/agents/agentCatalog";
import { 
  Search, 
  Sparkles, 
  X, 
  Check, 
  Building2, 
  Zap,
  ChevronDown
} from "lucide-react";

interface WatchlistSelectorProps {
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  currentPrices: Record<string, number>;
}

export function WatchlistSelector({
  selectedSymbol,
  onSelectSymbol,
  currentPrices,
}: WatchlistSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const currentAsset = ASTRO_COMPANIES[selectedSymbol];
  const [activeSegment, setActiveSegment] = useState<"INDIAN_ANGEL" | "DELTA_EXCHANGE">(
    currentAsset?.segment === "DELTA_EXCHANGE" ? "DELTA_EXCHANGE" : "INDIAN_ANGEL"
  );

  const allAssets = useMemo(() => {
    return Object.values(ASTRO_COMPANIES);
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return allAssets;
    return allAssets.filter(asset => 
      asset.symbol.toLowerCase().includes(q) ||
      asset.name.toLowerCase().includes(q) ||
      asset.exchange.toLowerCase().includes(q) ||
      asset.rashi.toLowerCase().includes(q) ||
      asset.rashiEnglish.toLowerCase().includes(q)
    );
  }, [allAssets, searchQuery]);

  const handleSelectMarket = (segment: "INDIAN_ANGEL" | "DELTA_EXCHANGE") => {
    setActiveSegment(segment);
    const segmentAssets = allAssets.filter(a => a.segment === segment);
    const isCurrentInSegment = segmentAssets.some(a => a.symbol === selectedSymbol);
    if (!isCurrentInSegment && segmentAssets.length > 0) {
      onSelectSymbol(segmentAssets[0].symbol);
    }
  };

  const selectedData = ASTRO_COMPANIES[selectedSymbol];

  return (
    <div className="w-full border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        {/* Market Selector Tabs (Clean Fintech Switcher) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl w-full sm:w-auto sm:shrink-0">
          <button
            onClick={() => handleSelectMarket("INDIAN_ANGEL")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 min-h-9 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
              activeSegment === "INDIAN_ANGEL"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Angel One (NSE)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeSegment === "INDIAN_ANGEL" ? "bg-white/20 text-white font-mono" : "text-slate-500"
            }`}>
              11
            </span>
          </button>

          <button
            onClick={() => handleSelectMarket("DELTA_EXCHANGE")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 min-h-9 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
              activeSegment === "DELTA_EXCHANGE"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Delta Exchange</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeSegment === "DELTA_EXCHANGE" ? "bg-white/20 text-white font-mono" : "text-slate-500"
            }`}>
              12
            </span>
          </button>
        </div>

        {/* Clean Search Input with Quick Dropdown Trigger */}
        <div className="relative flex-1 sm:max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search stock, index or crypto (${activeSegment === "INDIAN_ANGEL" ? "Reliance, TCS, Nifty..." : "BTC, SOL, Gold..."})`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsModalOpen(true)}
              className="w-full pl-9 pr-8 py-2 sm:py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition font-medium"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            ) : (
              <span className="absolute right-3 top-2 text-[10px] text-slate-500 font-mono hidden sm:inline">
                Click to browse
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Asset Selector Modal — portaled so the header's backdrop-blur does not
          become the containing block for this fixed-position overlay. */}
      {isModalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[92dvh] sm:max-h-[85vh] flex flex-col text-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Select Instrument</h3>
                  <p className="text-xs text-slate-400">
                    Indian equities (Angel One) & global crypto/forex (Delta Exchange)
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition shrink-0"
                  aria-label="Close instrument picker"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Segment Tabs */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveSegment("INDIAN_ANGEL")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 border ${
                    activeSegment === "INDIAN_ANGEL"
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-white"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Angel One (NSE)</span>
                </button>

                <button
                  onClick={() => setActiveSegment("DELTA_EXCHANGE")}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 border ${
                    activeSegment === "DELTA_EXCHANGE"
                      ? "bg-purple-600 border-purple-500 text-white"
                      : "bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-white"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Delta Exchange (Crypto/Forex)</span>
                </button>
              </div>

              {/* Search input inside modal */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search symbol, company or rashi (e.g. Reliance, Nifty, BTC, Mesh)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Assets Grid */}
            <div className="p-3 space-y-2 overflow-y-auto flex-1 text-xs">
              {searchResults.filter(a => {
                if (searchQuery) return true;
                if (activeSegment === "INDIAN_ANGEL") return a.segment === "INDIAN_ANGEL";
                return a.segment === "DELTA_EXCHANGE" || a.segment === "FOREX";
              }).length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  No instrument found matching "{searchQuery}".
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {searchResults
                    .filter(a => {
                      if (searchQuery) return true;
                      if (activeSegment === "INDIAN_ANGEL") return a.segment === "INDIAN_ANGEL";
                      return a.segment === "DELTA_EXCHANGE" || a.segment === "FOREX";
                    })
                    .map(asset => {
                      const isSelected = selectedSymbol === asset.symbol;
                      const price = currentPrices[asset.symbol] || 1000;
                      const curr = asset.currencyPrefix || "₹";

                      return (
                        <div
                          key={asset.symbol}
                          onClick={() => {
                            if (asset.segment === "INDIAN_ANGEL") {
                              setActiveSegment("INDIAN_ANGEL");
                            } else {
                              setActiveSegment("DELTA_EXCHANGE");
                            }
                            onSelectSymbol(asset.symbol);
                            setIsModalOpen(false);
                            setSearchQuery("");
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-blue-600/15 border-blue-500 shadow-sm"
                              : "bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-sm text-yellow-400 font-bold shrink-0">
                              {asset.rashiSymbol}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white text-xs">{asset.symbol}</span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {asset.segment === "INDIAN_ANGEL" ? "NSE" : "Delta"}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-300 truncate">{asset.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                Rashi: {asset.rashi}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0 ml-2">
                            <div className="font-mono font-bold text-white text-xs">
                              {curr}{price.toLocaleString(undefined, { minimumFractionDigits: asset.symbol.includes("PEPE") ? 6 : 2 })}
                            </div>
                            {isSelected ? (
                              <span className="text-[10px] text-emerald-400 font-medium flex items-center justify-end gap-0.5 mt-0.5">
                                <Check className="w-3 h-3" /> Selected
                              </span>
                            ) : (
                              <span className="text-[10px] text-blue-400 hover:underline">
                                Select →
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs text-slate-400 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-3">
              <span className="flex items-center gap-1.5 min-w-0">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span>30-Agent consensus and Astrologer agent enabled</span>
              </span>
              <span className="shrink-0">{allAssets.length} Instruments</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
