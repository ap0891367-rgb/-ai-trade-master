"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  LineStyle,
  createChart,
  type CandlestickData,
  type HistogramData,
  type IChartApi,
  type IPriceLine,
  type ISeriesApi,
  type LineData,
  type MouseEventParams,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";
import { Maximize2, Minimize2 } from "lucide-react";
import type { CandleData } from "@/lib/agents/agentEngine";
import type { ChartInterval } from "@/lib/marketData";

/** IST offset in seconds — lightweight-charts renders UTCTimestamp as UTC. */
const IST_OFFSET = 19_800;

interface TradingChartProps {
  candles: CandleData[];
  symbol: string;
  currentPrice: number;
  currencyPrefix?: string;
  exchange?: string;
  interval: ChartInterval;
  onIntervalChange: (interval: ChartInterval) => void;
  live?: boolean;
  entryPrice?: number;
  targetPrice?: number;
  stopLoss?: number;
}

const INTERVALS: ChartInterval[] = ["1m", "5m", "15m", "1h", "1D"];

const STEP_MINUTES: Record<ChartInterval, number> = {
  "1m": 1,
  "5m": 5,
  "15m": 15,
  "1h": 60,
  "1D": 1440,
};

function pricePrecision(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 2;
  if (value >= 1) return 2;
  if (value >= 0.01) return 4;
  return 6;
}

function formatPrice(value: number, currencyPrefix: string): string {
  return `${currencyPrefix}${value.toLocaleString("en-IN", {
    minimumFractionDigits: pricePrecision(value),
    maximumFractionDigits: pricePrecision(value),
  })}`;
}

function ema(values: number[], period: number): number[] {
  if (!values.length) return [];
  const k = 2 / (period + 1);
  const out: number[] = [];
  let prev = values[0];
  values.forEach((value, index) => {
    prev = index === 0 ? value : value * k + prev * (1 - k);
    out.push(prev);
  });
  return out;
}

function bollinger(values: number[], period = 20, multiplier = 2) {
  const upper: number[] = [];
  const lower: number[] = [];
  values.forEach((_, index) => {
    const slice = values.slice(Math.max(0, index - period + 1), index + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
    const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / slice.length;
    const sd = Math.sqrt(variance);
    upper.push(mean + multiplier * sd);
    lower.push(mean - multiplier * sd);
  });
  return { upper, lower };
}

/** Session VWAP: resets at each IST trading day. */
function vwap(candles: CandleData[], times: number[]): number[] {
  let cumulativePV = 0;
  let cumulativeVolume = 0;
  let currentDay = "";
  return candles.map((candle, index) => {
    const day = new Date((times[index] + IST_OFFSET) * 1000).toISOString().slice(0, 10);
    if (day !== currentDay) {
      currentDay = day;
      cumulativePV = 0;
      cumulativeVolume = 0;
    }
    const typical = (candle.high + candle.low + candle.close) / 3;
    const volume = candle.volume || 1;
    cumulativePV += typical * volume;
    cumulativeVolume += volume;
    return cumulativePV / cumulativeVolume;
  });
}

export function TradingChart({
  candles,
  symbol,
  currentPrice,
  currencyPrefix = "₹",
  exchange = "NSE",
  interval,
  onIntervalChange,
  live = false,
  entryPrice,
  targetPrice,
  stopLoss,
}: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const ema20Ref = useRef<ISeriesApi<"Line"> | null>(null);
  const ema50Ref = useRef<ISeriesApi<"Line"> | null>(null);
  const vwapRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bbUpperRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bbLowerRef = useRef<ISeriesApi<"Line"> | null>(null);
  const priceLinesRef = useRef<IPriceLine[]>([]);
  const lastRangeKey = useRef<string>("");
  const currentPriceRef = useRef(currentPrice);

  useEffect(() => {
    currentPriceRef.current = currentPrice;
  }, [currentPrice]);

  const [showEma, setShowEma] = useState(true);
  const [showVwap, setShowVwap] = useState(true);
  const [showBands, setShowBands] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [chartError, setChartError] = useState(false);
  const [hovered, setHovered] = useState<CandlestickData<Time> | null>(null);

  // Merge the latest tick into the final candle so the chart moves between
  // candle refreshes instead of freezing on the last server close.
  const chartCandles = useMemo(() => {
    if (!candles.length) return candles;
    const price = Number(currentPrice);
    if (!Number.isFinite(price) || price <= 0) return candles;
    const last = candles[candles.length - 1];
    return [
      ...candles.slice(0, -1),
      {
        ...last,
        close: price,
        high: Math.max(last.high, price),
        low: Math.min(last.low, price),
      },
    ];
  }, [candles, currentPrice]);

  // Times for every candle (IST-shifted UTCTimestamp for correct axis labels).
  const times = useMemo(() => {
    const stepSeconds = STEP_MINUTES[interval] * 60;
    const now = Math.floor(Date.now() / 1000);
    const fallbackStart = now - stepSeconds * Math.max(0, candles.length - 1);
    return candles.map((candle, index) =>
      Math.round(candle.ts && Number.isFinite(candle.ts) ? candle.ts : fallbackStart + index * stepSeconds)
    );
  }, [candles, interval]);

  const lastCandle = chartCandles[chartCandles.length - 1];
  const legendCandle = hovered ?? lastCandle;
  const changePercent = legendCandle
    ? ((legendCandle.close - legendCandle.open) / legendCandle.open) * 100
    : 0;

  // Create the chart once.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let chart: IChartApi;
    try {
      chart = createChart(container, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "#070d19" },
        textColor: "#94a3b8",
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.07)" },
        horzLines: { color: "rgba(148, 163, 184, 0.07)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "rgba(148, 163, 184, 0.45)",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#1e293b",
        },
        horzLine: {
          color: "rgba(148, 163, 184, 0.45)",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#1e293b",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(51, 65, 85, 0.8)",
        scaleMargins: { top: 0.08, bottom: 0.26 },
      },
      timeScale: {
        borderColor: "rgba(51, 65, 85, 0.8)",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 4,
        barSpacing: 7,
        minBarSpacing: 2,
      },
      localization: { locale: "en-IN" },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { mouseWheel: true, pinch: true },
      });
    } catch (error) {
      console.error("Chart failed to initialise:", error);
      setChartError(true);
      return;
    }

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#f43f5e",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#f43f5e",
      priceFormat: { type: "price", precision: 2, minMove: 0.01 },
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      lastValueVisible: false,
      priceLineVisible: false,
    });
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    });

    const lineOptions = {
      lineWidth: 2 as const,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    };

    const ema20 = chart.addSeries(LineSeries, { ...lineOptions, color: "#38bdf8" });
    const ema50 = chart.addSeries(LineSeries, { ...lineOptions, color: "#f59e0b" });
    const vwapSeries = chart.addSeries(LineSeries, { ...lineOptions, color: "#a78bfa", lineWidth: 2 as const });
    const bbUpper = chart.addSeries(LineSeries, {
      ...lineOptions,
      color: "rgba(148, 163, 184, 0.75)",
      lineWidth: 1 as const,
      lineStyle: LineStyle.Dashed,
    });
    const bbLower = chart.addSeries(LineSeries, {
      ...lineOptions,
      color: "rgba(148, 163, 184, 0.75)",
      lineWidth: 1 as const,
      lineStyle: LineStyle.Dashed,
    });

    chartRef.current = chart;
    candleRef.current = candleSeries;
    volumeRef.current = volumeSeries;
    ema20Ref.current = ema20;
    ema50Ref.current = ema50;
    vwapRef.current = vwapSeries;
    bbUpperRef.current = bbUpper;
    bbLowerRef.current = bbLower;

    const handleCrosshairMove = (param: MouseEventParams<Time>) => {
      const data = param.seriesData?.get(candleSeries) as CandlestickData<Time> | undefined;
      setHovered(data ?? null);
    };
    chart.subscribeCrosshairMove(handleCrosshairMove);

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
      ema20Ref.current = null;
      ema50Ref.current = null;
      vwapRef.current = null;
      bbUpperRef.current = null;
      bbLowerRef.current = null;
      priceLinesRef.current = [];
    };
  }, []);

  // Push candle + indicator data into the chart.
  useEffect(() => {
    const chart = chartRef.current;
    const candleSeries = candleRef.current;
    const volumeSeries = volumeRef.current;
    if (!chart || !candleSeries || !volumeSeries) return;
    if (!candles.length) {
      candleSeries.setData([]);
      volumeSeries.setData([]);
      return;
    }

    const visibleRange = chart.timeScale().getVisibleLogicalRange();
    const price = Number(currentPriceRef.current);
    const displayCandles =
      Number.isFinite(price) && price > 0
        ? [
            ...candles.slice(0, -1),
            {
              ...candles[candles.length - 1],
              close: price,
              high: Math.max(candles[candles.length - 1].high, price),
              low: Math.min(candles[candles.length - 1].low, price),
            },
          ]
        : candles;

    const precision = pricePrecision(displayCandles[displayCandles.length - 1].close);
    candleSeries.applyOptions({
      priceFormat: { type: "price", precision, minMove: 1 / 10 ** precision },
    });

    const candleData: CandlestickData<Time>[] = displayCandles.map((candle, index) => ({
      time: (times[index] + IST_OFFSET) as UTCTimestamp,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    const volumeData: HistogramData<Time>[] = displayCandles.map((candle, index) => ({
      time: (times[index] + IST_OFFSET) as UTCTimestamp,
      value: candle.volume || 0,
      color: candle.close >= candle.open ? "rgba(16, 185, 129, 0.45)" : "rgba(244, 63, 94, 0.45)",
    }));

    candleSeries.setData(candleData);
    volumeSeries.setData(volumeData);

    const closes = displayCandles.map((candle) => candle.close);
    const toLine = (values: number[]): LineData<Time>[] =>
      values.map((value, index) => ({
        time: (times[index] + IST_OFFSET) as UTCTimestamp,
        value,
      }));

    ema20Ref.current?.setData(showEma ? toLine(ema(closes, 20)) : []);
    ema50Ref.current?.setData(showEma ? toLine(ema(closes, 50)) : []);
    vwapRef.current?.setData(showVwap ? toLine(vwap(displayCandles, times)) : []);

    const bands = bollinger(closes);
    bbUpperRef.current?.setData(showBands ? toLine(bands.upper) : []);
    bbLowerRef.current?.setData(showBands ? toLine(bands.lower) : []);

    // Entry / target / stop reference lines.
    priceLinesRef.current.forEach((line) => {
      try {
        candleSeries.removePriceLine(line);
      } catch {
        // Series may already be disposed during fast symbol switches.
      }
    });
    priceLinesRef.current = [];

    const addLine = (price: number | undefined, color: string, title: string) => {
      if (!price || !Number.isFinite(price) || price <= 0) return;
      priceLinesRef.current.push(
        candleSeries.createPriceLine({
          price,
          color,
          lineWidth: 1,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: true,
          title,
        })
      );
    };
    addLine(entryPrice, "#38bdf8", "ENTRY");
    addLine(targetPrice, "#10b981", "TARGET");
    addLine(stopLoss, "#f43f5e", "SL");

    const rangeKey = `${symbol}:${interval}`;
    if (lastRangeKey.current !== rangeKey) {
      lastRangeKey.current = rangeKey;
      chart.timeScale().fitContent();
    } else if (visibleRange && visibleRange.to >= candles.length - 2) {
      // User was following the live edge — keep following it.
      chart.timeScale().scrollToRealTime();
    } else if (visibleRange) {
      // User scrolled back through history — don't yank the view away.
      chart.timeScale().setVisibleLogicalRange(visibleRange);
    }
  }, [candles, times, symbol, interval, showEma, showVwap, showBands, entryPrice, targetPrice, stopLoss]);

  // Live tick: update only the forming candle (no full redraw / no scroll jump).
  useEffect(() => {
    const candleSeries = candleRef.current;
    if (!candleSeries || !candles.length) return;
    const price = Number(currentPrice);
    if (!Number.isFinite(price) || price <= 0) return;

    const lastIndex = candles.length - 1;
    const last = candles[lastIndex];
    candleSeries.update({
      time: (times[lastIndex] + IST_OFFSET) as UTCTimestamp,
      open: last.open,
      high: Math.max(last.high, price),
      low: Math.min(last.low, price),
      close: price,
    });
  }, [currentPrice, candles, times]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-slate-800 bg-slate-900/70">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="font-bold text-white text-sm sm:text-base truncate">{symbol}</span>
          <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wide">{exchange}</span>
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${
              live
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                : "bg-amber-500/15 text-amber-300 border-amber-500/40"
            }`}
          >
            <span className={`w-1 h-1 rounded-full ${live ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
            {live ? "LIVE" : "SIM"}
          </span>
        </div>

        <div className="flex items-baseline gap-2 ml-auto">
          <span className="font-mono font-bold text-white text-base sm:text-lg">
            {formatPrice(currentPrice, currencyPrefix)}
          </span>
          <span
            className={`font-mono text-[11px] sm:text-xs font-semibold ${
              changePercent >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {changePercent >= 0 ? "+" : ""}
            {changePercent.toFixed(2)}%
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 order-3 sm:order-none w-full sm:w-auto justify-center">
          {INTERVALS.map((tf) => (
            <button
              key={tf}
              onClick={() => onIntervalChange(tf)}
              className={`px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-semibold transition ${
                interval === tf
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/60"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 order-4 sm:order-none w-full sm:w-auto justify-center sm:justify-start">
          {[
            { label: "EMA", active: showEma, toggle: () => setShowEma((v) => !v) },
            { label: "VWAP", active: showVwap, toggle: () => setShowVwap((v) => !v) },
            { label: "BB", active: showBands, toggle: () => setShowBands((v) => !v) },
          ].map((indicator) => (
            <button
              key={indicator.label}
              onClick={indicator.toggle}
              className={`px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-semibold border transition ${
                indicator.active
                  ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                  : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              {indicator.label}
            </button>
          ))}

          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-md bg-slate-800/60 border border-slate-700 text-slate-300 hover:text-white"
            title={expanded ? "Collapse chart" : "Expand chart"}
            aria-label={expanded ? "Collapse chart" : "Expand chart"}
          >
            {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* OHLC legend */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 sm:px-4 py-1.5 text-[10px] sm:text-[11px] font-mono border-b border-slate-800/60 bg-slate-950/60">
        {legendCandle ? (
          <>
            <span className="text-slate-500">O</span>
            <span className="text-slate-200">{formatPrice(legendCandle.open, currencyPrefix)}</span>
            <span className="text-slate-500">H</span>
            <span className="text-emerald-300">{formatPrice(legendCandle.high, currencyPrefix)}</span>
            <span className="text-slate-500">L</span>
            <span className="text-rose-300">{formatPrice(legendCandle.low, currencyPrefix)}</span>
            <span className="text-slate-500">C</span>
            <span className="text-slate-200">{formatPrice(legendCandle.close, currencyPrefix)}</span>
            <span className={changePercent >= 0 ? "text-emerald-400" : "text-rose-400"}>
              {changePercent >= 0 ? "+" : ""}
              {changePercent.toFixed(2)}%
            </span>
          </>
        ) : (
          <span className="text-slate-500">Loading candles…</span>
        )}
        <span className="ml-auto text-slate-600 hidden sm:inline">
          scroll to zoom · drag to pan · crosshair for OHLC
        </span>
      </div>

      {/* Chart surface */}
      <div
        ref={containerRef}
        className={`w-full ${expanded ? "h-[70vh] min-h-[420px]" : "h-[340px] sm:h-[420px]"}`}
      />

      {chartError && (
        <div className="h-32 flex flex-col items-center justify-center gap-1 text-xs text-rose-300 bg-rose-500/10 border-t border-rose-500/30">
          <span className="font-bold">Chart load nahi ho paya</span>
          <span className="text-rose-200/80">Page refresh kariye. Chart library browser me init fail hui.</span>
        </div>
      )}

      {!candles.length && (
        <div className="h-8 flex items-center justify-center text-xs text-slate-400 bg-slate-900">
          Fetching candles…
        </div>
      )}
    </div>
  );
}
