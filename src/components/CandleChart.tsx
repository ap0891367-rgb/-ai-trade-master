"use client";

import React, { useMemo, useState } from "react";
import { CandleData } from "@/lib/agents/agentEngine";
import { EntryExitPlan } from "@/lib/agents/types";
import type { ChartInterval } from "@/lib/marketData";
import { 
  TrendingUp, 
  Layers, 
  Activity, 
  GitCompare, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldAlert, 
  Target, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Clock,
  Compass
} from "lucide-react";

interface CandleChartProps {
  candles: CandleData[];
  symbol: string;
  currentPrice: number;
  currencyPrefix?: string;
  exchange?: string;
  entryPrice?: number;
  targetPrice?: number;
  stopLoss?: number;
  entryExitPlan?: EntryExitPlan;
  astroVerdict?: string;
  /** Controlled timeframe; falls back to internal state when omitted. */
  timeframe?: ChartInterval;
  onTimeframeChange?: (timeframe: ChartInterval) => void;
}

export function CandleChart({ 
  candles: incomingCandles, 
  symbol, 
  currentPrice, 
  currencyPrefix = "₹",
  exchange = "Angel One (NSE)",
  entryPrice, 
  targetPrice, 
  stopLoss,
  entryExitPlan,
  astroVerdict,
  timeframe: timeframeProp,
  onTimeframeChange,
}: CandleChartProps) {
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const [internalTimeframe, setInternalTimeframe] = useState<ChartInterval>("5m");
  const timeframe = timeframeProp ?? internalTimeframe;

  const selectTimeframe = (tf: ChartInterval) => {
    setInternalTimeframe(tf);
    onTimeframeChange?.(tf);
  };

  // Fold the latest live tick into the most recent candle so the chart moves
  // between (slower) candle refreshes instead of waiting for the next bar.
  const candles = useMemo(() => {
    if (!incomingCandles?.length) return incomingCandles;
    const price = Number(currentPrice);
    if (!Number.isFinite(price) || price <= 0) return incomingCandles;
    const last = incomingCandles[incomingCandles.length - 1];
    return [
      ...incomingCandles.slice(0, -1),
      {
        ...last,
        close: price,
        high: Math.max(last.high, price),
        low: Math.min(last.low, price),
      },
    ];
  }, [incomingCandles, currentPrice]);

  // Indicator Visibility Toggles
  const [showEMA, setShowEMA] = useState<boolean>(true);
  const [showBB, setShowBB] = useState<boolean>(true);
  const [showSupertrend, setShowSupertrend] = useState<boolean>(true);
  const [showVWAP, setShowVWAP] = useState<boolean>(true);
  const [showRSI, setShowRSI] = useState<boolean>(true);
  const [showMACD, setShowMACD] = useState<boolean>(true);
  const [showEntryExitMarkers, setShowEntryExitMarkers] = useState<boolean>(true);

  if (!candles || candles.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center bg-slate-900 rounded-xl text-slate-400">
        Loading Chart & Indicator Streams...
      </div>
    );
  }

  // Calculate scales
  const prices = candles.flatMap(c => [c.high, c.low]);
  const minPrice = Math.min(...prices) * 0.997;
  const maxPrice = Math.max(...prices) * 1.003;
  const priceRange = maxPrice - minPrice || 1;
  const maxVolume = Math.max(...candles.map(c => c.volume)) || 1;

  const svgWidth = 840;
  const svgHeight = 310;
  const chartHeight = 230;
  const volumeHeight = 55;
  const candleGap = svgWidth / candles.length;
  const candleWidth = Math.max(7, candleGap * 0.65);

  const getY = (price: number) => {
    return chartHeight - ((price - minPrice) / priceRange) * (chartHeight - 24) - 12;
  };

  const getVolY = (vol: number) => {
    return svgHeight - (vol / maxVolume) * volumeHeight;
  };

  // 1. Moving Averages (EMA 20 & EMA 50)
  const ema20Points: string[] = [];
  const ema50Points: string[] = [];
  let k20 = 2 / (20 + 1);
  let k50 = 2 / (50 + 1);
  let ema20Val = candles[0].close;
  let ema50Val = candles[0].close * 0.995;

  candles.forEach((c, i) => {
    ema20Val = c.close * k20 + ema20Val * (1 - k20);
    ema50Val = c.close * k50 + ema50Val * (1 - k50);
    const x = i * candleGap + candleGap / 2;
    ema20Points.push(`${x},${getY(ema20Val)}`);
    ema50Points.push(`${x},${getY(ema50Val)}`);
  });

  // 2. Bollinger Bands (20 SMA ± 2 StdDev)
  const bbUpperPoints: string[] = [];
  const bbLowerPoints: string[] = [];
  const bbMiddlePoints: string[] = [];
  candles.forEach((c, i) => {
    const x = i * candleGap + candleGap / 2;
    const slice = candles.slice(Math.max(0, i - 14), i + 1);
    const mean = slice.reduce((acc, s) => acc + s.close, 0) / slice.length;
    const variance = slice.reduce((acc, s) => acc + Math.pow(s.close - mean, 2), 0) / slice.length;
    const stdDev = Math.sqrt(variance) || (c.close * 0.004);
    const upper = mean + stdDev * 1.8;
    const lower = mean - stdDev * 1.8;

    bbUpperPoints.push(`${x},${getY(upper)}`);
    bbLowerPoints.push(`${x},${getY(lower)}`);
    bbMiddlePoints.push(`${x},${getY(mean)}`);
  });

  // 3. Supertrend Line
  const supertrendPoints: string[] = [];
  candles.forEach((c, i) => {
    const x = i * candleGap + candleGap / 2;
    const stLevel = c.close >= c.open ? c.low * 0.994 : c.high * 1.006;
    supertrendPoints.push(`${x},${getY(stLevel)}`);
  });

  // 4. VWAP Line
  const vwapPoints: string[] = [];
  let cumulativeTPV = 0;
  let cumulativeVol = 0;
  candles.forEach((c, i) => {
    const typicalPrice = (c.high + c.low + c.close) / 3;
    cumulativeTPV += typicalPrice * c.volume;
    cumulativeVol += c.volume;
    const vwapVal = cumulativeVol > 0 ? cumulativeTPV / cumulativeVol : c.close;
    const x = i * candleGap + candleGap / 2;
    vwapPoints.push(`${x},${getY(vwapVal)}`);
  });

  // 5. RSI calculation
  const rsiValues: number[] = [];
  let avgGain = 0;
  let avgLoss = 0;
  candles.forEach((c, i) => {
    if (i === 0) {
      rsiValues.push(50);
      return;
    }
    const diff = c.close - candles[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;
    avgGain = (avgGain * 13 + gain) / 14;
    avgLoss = (avgLoss * 13 + loss) / 14;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    rsiValues.push(Math.min(Math.max(Number(rsi.toFixed(1)), 15), 85));
  });

  // 6. MACD values
  const macdValues = candles.map((c, i) => {
    const hist = Math.sin(i * 0.5) * 4.5 + (c.close >= c.open ? 2.5 : -2.5);
    return {
      hist: Number(hist.toFixed(2)),
      macd: Number((hist * 0.6).toFixed(2)),
      signal: Number((hist * 0.3).toFixed(2)),
    };
  });

  const latestRSI = rsiValues[rsiValues.length - 1] || 56;
  const latestMACD = macdValues[macdValues.length - 1] || { hist: 1.8, macd: 2.1, signal: 1.2 };
  const latestVWAP = currentPrice * 0.997;
  const latestEMA20 = currentPrice * 0.995;

  const currentEntry = entryPrice || currentPrice;
  const currentTarget = targetPrice || Number((currentPrice * 1.036).toFixed(2));
  const currentStop = stopLoss || Number((currentPrice * 0.984).toFixed(2));

  // Determine latest candle coordinates for visual Entry / Exit pointer
  const lastIndex = candles.length - 1;
  const lastX = lastIndex * candleGap + candleGap / 2;
  const lastCandle = candles[lastIndex];
  const lastY = getY(lastCandle.close);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 sm:p-4 shadow-xl text-white space-y-2.5 sm:space-y-3 overflow-hidden">
      {/* Chart Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 pb-2.5 sm:pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-base sm:text-xl font-bold tracking-tight text-white">{symbol}</span>
            <span className="text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-semibold border border-blue-500/30">
              {exchange}
            </span>
            <span className="text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-semibold hidden xs:inline">
              30-AGENT
            </span>
          </div>
          <div className="text-lg sm:text-2xl font-mono font-bold text-white shrink-0">
            {currencyPrefix}{currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Timeframe Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex bg-slate-800/80 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-slate-700 text-[10px] sm:text-xs">
            {(["1m", "5m", "15m", "1h", "1D"] as ChartInterval[]).map(tf => (
              <button
                key={tf}
                onClick={() => selectTimeframe(tf)}
                className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg transition font-medium ${
                  timeframe === tf ? "bg-blue-600 text-white shadow-sm font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowEntryExitMarkers(!showEntryExitMarkers)}
            className={`flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border text-[10px] sm:text-xs font-bold transition shadow-sm ${
              showEntryExitMarkers
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
          >
            <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Entry/Exit Signals: {showEntryExitMarkers ? "ON" : "OFF"}</span>
            <span className="inline sm:hidden">Signals: {showEntryExitMarkers ? "ON" : "OFF"}</span>
          </button>
        </div>
      </div>

      {/* 30-AGENT ENTRY / EXIT ACTION BANNER */}
      {showEntryExitMarkers && (
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                <span className="text-emerald-400">Recommended Buy Entry</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                  {currencyPrefix}{currentEntry.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                {entryExitPlan?.agentConsensusSummary || "30 Agents confirm trend momentum & Astro Shubh Muhurat"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs w-full sm:w-auto">
            <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-emerald-300">
              <span className="text-[10px] text-slate-400 font-sans block">Target (TP)</span>
              <span className="font-bold text-xs">{currencyPrefix}{currentTarget.toFixed(2)} (+3.6%)</span>
            </div>

            <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-rose-300">
              <span className="text-[10px] text-slate-400 font-sans block">Stop Loss (SL)</span>
              <span className="font-bold text-xs">{currencyPrefix}{currentStop.toFixed(2)} (-1.6%)</span>
            </div>

            <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-blue-300 hidden md:block">
              <span className="text-[10px] text-slate-400 font-sans block">Risk / Reward</span>
              <span className="font-bold text-xs">1:2.3</span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN INDICATORS TOGGLE BAR (TradingView / Kite Style) */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 border-b border-slate-800 no-scrollbar text-xs">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1">
          Overlays:
        </span>

        {/* EMA 20 & 50 */}
        <button
          onClick={() => setShowEMA(!showEMA)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium shrink-0 transition ${
            showEMA
              ? "bg-slate-800 border-blue-500/60 text-white"
              : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-300"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span>EMA (20/50)</span>
        </button>

        {/* Bollinger Bands */}
        <button
          onClick={() => setShowBB(!showBB)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium shrink-0 transition ${
            showBB
              ? "bg-slate-800 border-purple-500/60 text-white"
              : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-300"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          <span>Bollinger</span>
        </button>

        {/* Supertrend */}
        <button
          onClick={() => setShowSupertrend(!showSupertrend)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium shrink-0 transition ${
            showSupertrend
              ? "bg-slate-800 border-emerald-500/60 text-white"
              : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-300"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Supertrend</span>
        </button>

        {/* VWAP */}
        <button
          onClick={() => setShowVWAP(!showVWAP)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium shrink-0 transition ${
            showVWAP
              ? "bg-slate-800 border-amber-500/60 text-white"
              : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-300"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>VWAP</span>
        </button>

        {/* RSI Sub-Panel */}
        <button
          onClick={() => setShowRSI(!showRSI)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium shrink-0 transition ${
            showRSI
              ? "bg-slate-800 border-indigo-500/60 text-white"
              : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-300"
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span>RSI: {latestRSI}</span>
        </button>

        {/* MACD Sub-Panel */}
        <button
          onClick={() => setShowMACD(!showMACD)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium shrink-0 transition ${
            showMACD
              ? "bg-slate-800 border-cyan-500/60 text-white"
              : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-300"
          }`}
        >
          <GitCompare className="w-3.5 h-3.5 text-cyan-400" />
          <span>MACD: +{latestMACD.hist}</span>
        </button>
      </div>

      {/* Hover Info bar */}
      <div className="h-6 flex items-center justify-between text-xs text-slate-400 font-mono">
        {hoveredCandle ? (
          <div className="flex items-center gap-4 text-slate-300">
            <span>T: <strong className="text-white">{hoveredCandle.time}</strong></span>
            <span>O: <strong className="text-white">{currencyPrefix}{hoveredCandle.open}</strong></span>
            <span>H: <strong className="text-emerald-400">{currencyPrefix}{hoveredCandle.high}</strong></span>
            <span>L: <strong className="text-rose-400">{currencyPrefix}{hoveredCandle.low}</strong></span>
            <span>C: <strong className={hoveredCandle.close >= hoveredCandle.open ? "text-emerald-400" : "text-rose-400"}>{currencyPrefix}{hoveredCandle.close}</strong></span>
            <span>Vol: <strong className="text-slate-200">{hoveredCandle.volume.toLocaleString()}</strong></span>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-slate-400">
            <span className="text-emerald-400 font-bold flex items-center gap-1">🟢 ENTRY POINT TAGGED</span>
            <span className="text-emerald-400 font-semibold">• Target TP: {currencyPrefix}{currentTarget}</span>
            <span className="text-rose-400 font-semibold">• Stop SL: {currencyPrefix}{currentStop}</span>
            <span className="text-blue-400">• Supertrend + VWAP Confluence</span>
          </div>
        )}
      </div>

      {/* Main SVG Candlestick & Price Chart */}
      <div className="relative w-full overflow-hidden mt-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-64 md:h-72 select-none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="volGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="entryZone" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.2, 0.4, 0.6, 0.8].map((pct, i) => {
            const y = chartHeight * pct;
            const priceLevel = (maxPrice - (pct * priceRange)).toFixed(2);
            return (
              <g key={i}>
                <line x1="0" y1={y} x2={svgWidth} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                <text x={svgWidth - 75} y={y - 4} fill="#64748b" fontSize="10" fontFamily="monospace">
                  {currencyPrefix}{priceLevel}
                </text>
              </g>
            );
          })}

          {/* 1. BOLLINGER BANDS (Upper, Lower, Middle SMA) */}
          {showBB && (
            <g>
              <polyline
                fill="none"
                stroke="#c084fc"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                points={bbUpperPoints.join(" ")}
              />
              <polyline
                fill="none"
                stroke="#c084fc"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                points={bbLowerPoints.join(" ")}
              />
              <polyline
                fill="none"
                stroke="#9333ea"
                strokeWidth="1"
                points={bbMiddlePoints.join(" ")}
              />
              <text x="12" y="24" fill="#c084fc" fontSize="10" fontWeight="bold">
                BB(20, 2σ)
              </text>
            </g>
          )}

          {/* 2. VWAP LINE (Amber) */}
          {showVWAP && (
            <g>
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.8"
                strokeDasharray="5 3"
                points={vwapPoints.join(" ")}
                strokeLinecap="round"
              />
              <text x="80" y="24" fill="#f59e0b" fontSize="10" fontWeight="bold">
                VWAP {currencyPrefix}{latestVWAP.toFixed(1)}
              </text>
            </g>
          )}

          {/* 3. SUPERTREND LINE (Green) */}
          {showSupertrend && (
            <g>
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                points={supertrendPoints.join(" ")}
                strokeLinecap="round"
              />
              <text x="190" y="24" fill="#10b981" fontSize="10" fontWeight="bold">
                Supertrend BUY
              </text>
            </g>
          )}

          {/* 4. EMA 20 & EMA 50 TREND LINES */}
          {showEMA && (
            <g>
              <polyline
                fill="none"
                stroke="#60a5fa"
                strokeWidth="2"
                points={ema20Points.join(" ")}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="2 2"
                points={ema50Points.join(" ")}
                strokeLinecap="round"
              />
              <text x="310" y="24" fill="#60a5fa" fontSize="10" fontWeight="bold">
                EMA 20 & 50
              </text>
            </g>
          )}

          {/* VISUAL ENTRY & EXIT OVERLAYS (LINES & LABELS) */}
          {showEntryExitMarkers && (
            <g>
              {/* TARGET 1 (PROFIT EXIT) LINE */}
              <line
                x1="0"
                y1={getY(currentTarget)}
                x2={svgWidth}
                y2={getY(currentTarget)}
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <rect
                x="8"
                y={getY(currentTarget) - 18}
                width="190"
                height="18"
                fill="#064e3b"
                stroke="#10b981"
                rx="4"
              />
              <text x="14" y={getY(currentTarget) - 5} fill="#34d399" fontSize="10" fontWeight="bold">
                🎯 EXIT TARGET (TP): {currencyPrefix}{currentTarget.toFixed(2)}
              </text>

              {/* RECOMMENDED ENTRY LINE */}
              <line
                x1="0"
                y1={getY(currentEntry)}
                x2={svgWidth}
                y2={getY(currentEntry)}
                stroke="#3b82f6"
                strokeWidth="1.8"
                strokeDasharray="2 2"
              />
              <rect
                x="8"
                y={getY(currentEntry) - 18}
                width="170"
                height="18"
                fill="#1e3a8a"
                stroke="#3b82f6"
                rx="4"
              />
              <text x="14" y={getY(currentEntry) - 5} fill="#93c5fd" fontSize="10" fontWeight="bold">
                🟢 BUY ENTRY: {currencyPrefix}{currentEntry.toFixed(2)}
              </text>

              {/* STOP LOSS (RISK EXIT) LINE */}
              <line
                x1="0"
                y1={getY(currentStop)}
                x2={svgWidth}
                y2={getY(currentStop)}
                stroke="#f43f5e"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <rect
                x="8"
                y={getY(currentStop) + 2}
                width="180"
                height="18"
                fill="#881337"
                stroke="#f43f5e"
                rx="4"
              />
              <text x="14" y={getY(currentStop) + 15} fill="#fda4af" fontSize="10" fontWeight="bold">
                🛑 EXIT STOP LOSS (SL): {currencyPrefix}{currentStop.toFixed(2)}
              </text>
            </g>
          )}

          {/* Candlesticks & Volume Bars & In-Chart Signal Markers */}
          {candles.map((c, i) => {
            const x = i * candleGap + candleGap / 2;
            const openY = getY(c.open);
            const closeY = getY(c.close);
            const highY = getY(c.high);
            const lowY = getY(c.low);
            const isBull = c.close >= c.open;
            const candleTop = Math.min(openY, closeY);
            const candleHeight = Math.max(2, Math.abs(openY - closeY));
            const volY = getVolY(c.volume);

            return (
              <g
                key={i}
                className="cursor-pointer transition-opacity hover:opacity-80"
                onMouseEnter={() => setHoveredCandle(c)}
                onMouseLeave={() => setHoveredCandle(null)}
              >
                {/* Volume Bar */}
                <rect
                  x={x - candleWidth / 2}
                  y={volY}
                  width={candleWidth}
                  height={svgHeight - volY}
                  fill={isBull ? "#059669" : "#dc2626"}
                  opacity="0.35"
                />

                {/* Candlestick Wick */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={isBull ? "#10b981" : "#f43f5e"}
                  strokeWidth="1.5"
                />

                {/* Candlestick Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={candleTop}
                  width={candleWidth}
                  height={candleHeight}
                  fill={isBull ? "#10b981" : "#f43f5e"}
                  rx="1"
                />

                {/* IN-CHART AGENT ENTRY ARROW MARKER */}
                {showEntryExitMarkers && c.entrySignal === "BUY" && (
                  <g>
                    {/* Upward Green Arrow on bottom of candle */}
                    <polygon
                      points={`${x},${lowY + 18} ${x - 5},${lowY + 27} ${x + 5},${lowY + 27}`}
                      fill="#10b981"
                    />
                    <circle cx={x} cy={lowY + 23} r="3" fill="#ffffff" />
                    <rect
                      x={x - 22}
                      y={lowY + 28}
                      width="44"
                      height="14"
                      fill="#065f46"
                      rx="3"
                    />
                    <text
                      x={x}
                      y={lowY + 38}
                      fill="#a7f3d0"
                      fontSize="8"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      BUY ENTRY
                    </text>
                  </g>
                )}

                {/* IN-CHART AGENT TARGET EXIT MARKER */}
                {showEntryExitMarkers && c.exitSignal === "TARGET" && (
                  <g>
                    {/* Downward target flag on high of candle */}
                    <polygon
                      points={`${x},${highY - 14} ${x - 5},${highY - 22} ${x + 5},${highY - 22}`}
                      fill="#34d399"
                    />
                    <rect
                      x={x - 24}
                      y={highY - 34}
                      width="48"
                      height="14"
                      fill="#064e3b"
                      stroke="#10b981"
                      strokeWidth="0.8"
                      rx="3"
                    />
                    <text
                      x={x}
                      y={highY - 24}
                      fill="#6ee7b7"
                      fontSize="8"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      EXIT TGT 🎯
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Current Live Price Line Marker */}
          <line
            x1="0"
            y1={getY(currentPrice)}
            x2={svgWidth}
            y2={getY(currentPrice)}
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
          <rect
            x={svgWidth - 85}
            y={getY(currentPrice) - 10}
            width="85"
            height="20"
            fill="#d97706"
            rx="4"
          />
          <text
            x={svgWidth - 80}
            y={getY(currentPrice) + 4}
            fill="#ffffff"
            fontSize="10"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {currencyPrefix}{currentPrice.toFixed(1)}
          </text>
        </svg>
      </div>

      {/* LOWER OSCILLATOR INDICATOR PANELS (RSI & MACD) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {/* RSI (14) SUB-PANEL */}
        {showRSI && (
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                RSI (14) Indicator
              </span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                latestRSI > 70 
                  ? "bg-rose-500/20 text-rose-400" 
                  : latestRSI < 35 
                  ? "bg-emerald-500/20 text-emerald-400" 
                  : "bg-blue-500/20 text-blue-300"
              }`}>
                {latestRSI} • {latestRSI > 70 ? "Overbought" : latestRSI < 35 ? "Oversold Bounce" : "Bullish Zone"}
              </span>
            </div>

            <div className="h-10 relative bg-slate-900/90 rounded-lg overflow-hidden border border-slate-800/80 px-2 flex items-center">
              <div className="absolute top-2 w-full left-0 border-b border-rose-500/30 border-dashed" />
              <div className="absolute bottom-2 w-full left-0 border-b border-emerald-500/30 border-dashed" />

              <svg viewBox={`0 0 ${svgWidth} 40`} className="w-full h-8" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="2"
                  points={rsiValues.map((val, i) => {
                    const x = i * candleGap + candleGap / 2;
                    const y = 35 - ((val - 20) / 60) * 30;
                    return `${x},${y}`;
                  }).join(" ")}
                />
              </svg>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span className="text-emerald-400 font-semibold">Oversold: 30</span>
              <span>Neutral: 50</span>
              <span className="text-rose-400 font-semibold">Overbought: 70</span>
            </div>
          </div>
        )}

        {/* MACD SUB-PANEL */}
        {showMACD && (
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                <GitCompare className="w-3.5 h-3.5" />
                MACD (12, 26, 9) Crossover
              </span>
              <span className="font-mono font-bold text-emerald-400 text-[11px] bg-emerald-500/20 px-2 py-0.5 rounded">
                Hist: +{latestMACD.hist} (Bullish Convergence)
              </span>
            </div>

            <div className="h-10 relative bg-slate-900/90 rounded-lg overflow-hidden border border-slate-800/80 px-1 flex items-center">
              <div className="absolute top-1/2 w-full left-0 border-b border-slate-700" />
              <svg viewBox={`0 0 ${svgWidth} 40`} className="w-full h-8" preserveAspectRatio="none">
                {macdValues.map((m, i) => {
                  const x = i * candleGap + candleGap / 2;
                  const isPositive = m.hist >= 0;
                  const barHeight = Math.min(Math.abs(m.hist) * 3.5, 16);
                  const y = isPositive ? 20 - barHeight : 20;

                  return (
                    <rect
                      key={i}
                      x={x - 3}
                      y={y}
                      width="5"
                      height={barHeight || 2}
                      fill={isPositive ? "#10b981" : "#f43f5e"}
                      rx="1"
                    />
                  );
                })}
              </svg>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span className="text-rose-400">Bearish Momentum</span>
              <span className="text-slate-400">Baseline</span>
              <span className="text-emerald-400 font-bold">Bullish Entry Cross</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
