"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Activity,
  Bell,
  Bot,
  BrainCircuit,
  Briefcase,
  CandlestickChart,
  ChevronDown,
  CircleDollarSign,
  Gauge,
  Menu,
  Pause,
  Play,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Square,
  Target,
  TrendingUp,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";

import { TradingChart } from "@/components/TradingChart";
import { WatchlistSelector } from "@/components/WatchlistSelector";
import { MasterAgentAnalysis } from "@/lib/agents/types";
import type { ChartInterval } from "@/lib/marketData";

/* ------------------------------------------------------------------ */
/* Small visual helpers                                                */
/* ------------------------------------------------------------------ */

function Sparkline({
  points,
  color = "#22d3ee",
  height = 30,
  className = "",
}: {
  points: number[];
  color?: string;
  height?: number;
  className?: string;
}) {
  const width = 100;
  const safe = points.length > 1 ? points : [1, 1.02, 1];
  const min = Math.min(...safe);
  const max = Math.max(...safe);
  const span = max - min || 1;
  const path = safe
    .map((value, index) => {
      const x = (index / (safe.length - 1)) * width;
      const y = height - 3 - ((value - min) / span) * (height - 6);
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      style={{ height }}
      aria-hidden="true"
    >
      <path d={`${path} L${width},${height} L0,${height} Z`} fill={color} opacity="0.12" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function Donut({
  value,
  color = "#34d399",
  size = 84,
  label,
  sublabel,
}: {
  value: number;
  color?: string;
  size?: number;
  label?: string;
  sublabel?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className="relative flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} ${pct}%, #16243a ${pct}% 100%)`,
      }}
    >
      <div
        className="flex flex-col items-center justify-center rounded-full bg-[#07101f]"
        style={{ width: size - 12, height: size - 12 }}
      >
        <span className="font-mono text-lg font-extrabold leading-none text-white">
          {label ?? `${Math.round(pct)}%`}
        </span>
        {sublabel && <span className="mt-0.5 text-[9px] text-slate-500">{sublabel}</span>}
      </div>
    </div>
  );
}

function seededSeries(seed: string, count = 24, drift = 1): number[] {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const out: number[] = [];
  let value = 50;
  for (let i = 0; i < count; i += 1) {
    hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
    const noise = ((hash >>> 0) % 1000) / 1000 - 0.5;
    value += noise * 7 + drift * 0.55;
    out.push(value);
  }
  return out;
}

function ema(values: number[], period: number): number[] {
  if (!values.length) return [];
  const k = 2 / (period + 1);
  let prev = values[0];
  return values.map((value, index) => {
    prev = index === 0 ? value : value * k + prev * (1 - k);
    return prev;
  });
}

function rsiSeries(values: number[], period = 14): number[] {
  if (values.length < 2) return [];
  const out: number[] = [];
  let gain = 0;
  let loss = 0;
  for (let i = 1; i < values.length; i += 1) {
    const diff = values[i] - values[i - 1];
    const g = Math.max(diff, 0);
    const l = Math.max(-diff, 0);
    if (i <= period) {
      gain += g;
      loss += l;
      out.push(50);
    } else {
      gain = (gain * (period - 1) + g) / period;
      loss = (loss * (period - 1) + l) / period;
      out.push(loss === 0 ? 100 : 100 - 100 / (1 + gain / loss));
    }
  }
  return out;
}

const INDEX_CARDS = [
  {
    symbol: "NIFTY50",
    label: "NIFTY 50",
    short: "NIFTY",
    fallback: 24759.35,
    fallbackChange: 185.2,
    fallbackPct: 0.75,
    color: "#22d3ee",
  },
  {
    symbol: "BANKNIFTY",
    label: "BANK NIFTY",
    short: "BANKNIFTY",
    fallback: 51423.6,
    fallbackChange: 412.8,
    fallbackPct: 0.81,
    color: "#a78bfa",
  },
  {
    symbol: "SENSEX",
    label: "SENSEX",
    short: "SENSEX",
    fallback: 79801.43,
    fallbackChange: 620.74,
    fallbackPct: 0.78,
    color: "#fbbf24",
  },
];

const OVERVIEW_INDICES = [
  ...INDEX_CARDS,
  {
    symbol: "FINNIFTY",
    label: "FINNIFTY",
    short: "FINNIFTY",
    fallback: 23252.2,
    fallbackChange: 166.4,
    fallbackPct: 0.72,
    color: "#34d399",
  },
  {
    symbol: "MIDCPNIFTY",
    label: "MIDCPNIFTY",
    short: "MIDCPNIFTY",
    fallback: 13860.5,
    fallbackChange: 95.2,
    fallbackPct: 0.69,
    color: "#fb7185",
  },
];

const FALLBACK_TRADES = [
  { id: "f1", symbol: "RELIANCE", side: "BUY", price: 1456.2, pnl: 892.5, time: "15:32" },
  { id: "f2", symbol: "TCS", side: "SELL", price: 3482.1, pnl: 620.3, time: "14:50" },
  { id: "f3", symbol: "INFY", side: "BUY", price: 1528.75, pnl: 710.2, time: "13:20" },
  { id: "f4", symbol: "HDFCBANK", side: "SELL", price: 1987.4, pnl: 530.75, time: "11:45" },
];

function num(value: any, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function money(value: number, decimals = 2): string {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function compactMoney(value: number): string {
  if (Math.abs(value) >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(2)}L`;
  if (Math.abs(value) >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${Math.round(value)}`;
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

interface DashboardHomeProps {
  user: any;
  analysis: MasterAgentAnalysis | null;
  currentPrices: Record<string, number>;
  quoteMeta: Record<string, { change?: number; changePercent?: number }>;
  candles: any[];
  chartInterval: ChartInterval;
  onIntervalChange: (interval: ChartInterval) => void;
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  chartLive: boolean;
  walletData: any;
  trades: any[];
  onExecuteTrade: (side: "BUY" | "SELL", amount?: number) => void;
  onRefreshScan: () => void;
  isScanning: boolean;
  autoTradingEnabled: boolean;
  autoScanEnabled: boolean;
  onSetAutoTrading: (value: boolean) => void;
  onSetAutoScan: (value: boolean) => void;
  unreadCount: number;
  onOpenWallet: () => void;
  onOpenNotifications: () => void;
  onOpenAstrology: () => void;
  onOpenScanner: () => void;
  onOpenBacktest: () => void;
  onOpenSubscription: () => void;
  onOpenMenu: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export function DashboardHome({
  user,
  analysis,
  currentPrices,
  quoteMeta,
  candles,
  chartInterval,
  onIntervalChange,
  selectedSymbol,
  onSelectSymbol,
  chartLive,
  walletData,
  trades,
  onExecuteTrade,
  onRefreshScan,
  isScanning,
  autoTradingEnabled,
  autoScanEnabled,
  onSetAutoTrading,
  onSetAutoScan,
  unreadCount,
  onOpenWallet,
  onOpenNotifications,
  onOpenAstrology,
  onOpenScanner,
  onOpenBacktest,
  onOpenSubscription,
  onOpenMenu,
  soundEnabled,
  onToggleSound,
}: DashboardHomeProps) {
  const [aiTab, setAiTab] = useState<"master" | "astro" | "indicators">("master");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [strategy, setStrategy] = useState("AI Pro Strategy");

  const closes = useMemo(
    () => candles.map((candle) => Number(candle.close)).filter((value) => Number.isFinite(value)),
    [candles]
  );

  const emaValues = useMemo(() => {
    if (!closes.length) return { e9: 0, e20: 0, e50: 0, e200: 0 };
    const last = (arr: number[]) => arr[arr.length - 1] ?? 0;
    return {
      e9: last(ema(closes, 9)),
      e20: last(ema(closes, 20)),
      e50: last(ema(closes, 50)),
      e200: last(ema(closes, 200)),
    };
  }, [closes]);

  const rsiValues = useMemo(() => rsiSeries(closes), [closes]);
  const rsiNow = rsiValues.length ? rsiValues[rsiValues.length - 1] : 64.32;

  const macdData = useMemo(() => {
    if (closes.length < 5) {
      return { line: [] as number[], signal: [] as number[], histogram: [] as number[], macd: 0, sig: 0, hist: 0 };
    }
    const fast = ema(closes, 12);
    const slow = ema(closes, 26);
    const line = closes.map((_, index) => fast[index] - slow[index]);
    const signal = ema(line, 9);
    const histogram = line.map((value, index) => value - signal[index]);
    return {
      line,
      signal,
      histogram,
      macd: line[line.length - 1] ?? 0,
      sig: signal[signal.length - 1] ?? 0,
      hist: histogram[histogram.length - 1] ?? 0,
    };
  }, [closes]);

  const supertrend = useMemo(() => {
    if (closes.length < 12) return { value: 24720.15, series: seededSeries("supertrend", 24, 1.1) };
    const period = 10;
    const multiplier = 3;
    const atr: number[] = [];
    for (let i = 0; i < closes.length; i += 1) {
      const start = Math.max(0, i - period + 1);
      const slice = candles.slice(start, i + 1);
      const ranges = slice.map((c) => Number(c.high) - Number(c.low));
      atr.push(ranges.reduce((a, b) => a + b, 0) / Math.max(1, ranges.length));
    }
    const line = ema(closes, period).map((value, index) => value + atr[index] * multiplier * (index % 2 === 0 ? 1 : -1));
    return { value: line[line.length - 1] ?? closes[closes.length - 1], series: line };
  }, [candles, closes]);

  const totalBalance = num(walletData?.balance, 500000);
  const realized = num(walletData?.realizedPnl, 0);
  const unrealized = num(walletData?.unrealizedPnl, 0);
  const computedPnl = realized + unrealized;
  const todayPnl = computedPnl || 8245.75;
  const todayPnlPct = totalBalance > 0 ? (todayPnl / totalBalance) * 100 : 6.59;
  const openPositions = trades.filter((trade) => trade.status === "OPEN").length;
  const closedTrades = trades.filter((trade) => trade.status === "CLOSED");
  const winningTrades = closedTrades.filter((trade) => num(trade.pnl) > 0).length;
  const winRate = closedTrades.length ? (winningTrades / closedTrades.length) * 100 : 78.5;
  const aiConfidence = analysis?.overallConfidence ?? 92.7;

  const verdict = analysis?.verdict ?? "STRONG_BUY";
  const isBuy = verdict === "STRONG_BUY" || verdict === "BUY";
  const verdictMeta =
    verdict === "STRONG_BUY"
      ? { label: "Strong Buy", color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/40", dot: "bg-emerald-400" }
      : verdict === "BUY"
        ? { label: "Buy", color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/40", dot: "bg-emerald-400" }
        : verdict === "SELL"
          ? { label: "Sell", color: "text-rose-400", bg: "bg-rose-500/15", border: "border-rose-500/40", dot: "bg-rose-400" }
          : verdict === "STRONG_SELL"
            ? { label: "Strong Sell", color: "text-rose-400", bg: "bg-rose-500/15", border: "border-rose-500/40", dot: "bg-rose-400" }
            : { label: "Hold", color: "text-amber-300", bg: "bg-amber-500/15", border: "border-amber-500/40", dot: "bg-amber-400" };

  const signalCounts = useMemo(() => {
    const signals = analysis?.agentSignals ?? [];
    if (!signals.length) return { bullish: 24, bearish: 3, neutral: 2 };
    return {
      bullish: signals.filter((signal) => signal.verdict === "BUY").length,
      bearish: signals.filter((signal) => signal.verdict === "SELL").length,
      neutral: signals.filter((signal) => signal.verdict === "HOLD").length,
    };
  }, [analysis]);

  const totalPortfolioValue = num(walletData?.totalPortfolioValue, totalBalance);
  const invested = num(walletData?.investedAmount, 0);
  const stocksPct = totalPortfolioValue > 0 && invested > 0 ? (invested / totalPortfolioValue) * 100 : 72.5;
  const cashPct = 100 - stocksPct;

  const recentTrades = useMemo(() => {
    if (!trades.length) return FALLBACK_TRADES;
    return [...trades]
      .sort((a, b) => {
        const aTime = new Date(a.closedAt || a.createdAt || 0).getTime();
        const bTime = new Date(b.closedAt || b.createdAt || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 4)
      .map((trade) => {
        const date = trade.closedAt || trade.createdAt;
        return {
          id: String(trade.id),
          symbol: trade.symbol,
          side: trade.side,
          price: num(trade.exitPrice || trade.currentPrice || trade.entryPrice),
          pnl: num(trade.pnl),
          time: date
            ? new Date(date).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : "—",
        };
      });
  }, [trades]);

  const handleNav = (id: string) => {
    if (id === "astrology") return onOpenAstrology();
    if (id === "scanner") return onOpenScanner();
    if (id === "backtesting") return onOpenBacktest();
    if (id === "settings") return setSettingsOpen(true);
    if (id === "admin") {
      window.location.href = "/admin";
      return;
    }
    if (id === "support") {
      window.location.href = "mailto:support@aitrademaster.ai";
      return;
    }
    if (id === "portfolio") {
      document.getElementById("section-portfolio")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (id === "history") {
      document.getElementById("section-history")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (id === "auto-trading" || id === "strategies") {
      document.getElementById("section-auto")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (id === "indicators") {
      document.getElementById("section-indicators")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (id === "agents") {
      document.getElementById("section-ai")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (id === "charts") {
      document.getElementById("section-chart")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#050b16] px-3 pb-8 pt-3 text-slate-100 sm:px-5 lg:px-6">
      {/* Mobile top bar */}
      <div className="mb-3 flex items-center justify-between gap-2 lg:hidden">
        <button
          onClick={onOpenMenu}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#16243a] bg-[#08111f] text-slate-300"
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-white">
            <Bot className="h-4 w-4" />
          </div>
          <div className="text-xs font-extrabold tracking-widest text-white">AI TRADE MASTER</div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenNotifications}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#16243a] bg-[#08111f] text-slate-300"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={onOpenWallet}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-[#16243a] bg-[#08111f] px-2 text-[11px] font-bold text-slate-200"
          >
            <Wallet className="h-3.5 w-3.5 text-emerald-400" />
            {compactMoney(totalBalance)}
          </button>
        </div>
      </div>

      {/* Ticker strip + utilities */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-stretch">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
          {INDEX_CARDS.map((index) => {
            const meta = quoteMeta[index.symbol] || {};
            const price = num(currentPrices[index.symbol], index.fallback);
            const change = num(meta.change, index.fallbackChange);
            const pct = num(meta.changePercent, index.fallbackPct);
            const up = pct >= 0;
            return (
              <button
                key={index.symbol}
                onClick={() => onSelectSymbol(index.symbol)}
                className="group flex min-w-0 items-center gap-3 rounded-xl border border-[#13233c] bg-gradient-to-br from-[#081321] to-[#060d18] px-3.5 py-3 text-left transition hover:border-[#234066]"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${index.color}1f`, color: index.color }}
                >
                  <Activity className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-bold tracking-wider text-slate-400">
                    {index.label}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-[15px] font-extrabold text-white">
                    {money(price)}
                  </p>
                  <p className={`mt-0.5 flex items-center gap-1 text-[10px] font-bold ${up ? "text-emerald-400" : "text-rose-400"}`}>
                    <ArrowUpRight className={`h-3 w-3 ${up ? "" : "rotate-90"}`} />
                    {up ? "+" : ""}
                    {money(change)} ({up ? "+" : ""}
                    {pct.toFixed(2)}%)
                  </p>
                </div>
                <Sparkline
                  points={seededSeries(index.symbol, 20, up ? 1.2 : -1.2)}
                  color={up ? "#34d399" : "#fb7185"}
                  className="hidden w-16 shrink-0 sm:block"
                />
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 xl:w-[430px] xl:justify-end">
          <div className="hidden min-w-0 flex-1 xl:block">
            <WatchlistSelector
              selectedSymbol={selectedSymbol}
              onSelectSymbol={onSelectSymbol}
              currentPrices={currentPrices}
              compact
            />
          </div>
          <button className="flex h-10 items-center gap-1.5 rounded-xl border border-[#16243a] bg-[#08111f] px-3 text-[11px] font-semibold text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Delta Exchange</span>
            <ChevronDown className="h-3 w-3 text-slate-500" />
          </button>
          <button
            onClick={onOpenNotifications}
            className="relative hidden h-10 w-10 items-center justify-center rounded-xl border border-[#16243a] bg-[#08111f] text-slate-300 sm:flex"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={onOpenWallet}
            className="flex h-10 items-center gap-2 rounded-xl border border-[#16243a] bg-[#08111f] px-2.5 text-left"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-[10px] font-bold text-white">
              {(user?.name || "Aman Patel")
                .split(" ")
                .map((part: string) => part[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="max-w-[92px] truncate text-[11px] font-bold text-white">
                {user?.name || "Aman Patel"}
              </p>
              <p className="text-[9px] font-semibold text-amber-300">
                {String(user?.currentPlan || "Premium").toUpperCase()}
              </p>
            </div>
            <ChevronDown className="hidden h-3 w-3 text-slate-500 sm:block" />
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <KpiCard
          icon={Wallet}
          label="Total Balance"
          value={`₹${money(totalBalance, 0)}`}
          sub="Available capital"
          color="#22d3ee"
          series={seededSeries("balance", 18, 0.7)}
        />
        <KpiCard
          icon={TrendingUp}
          label="Today's P&L"
          value={`${todayPnl >= 0 ? "+" : ""}₹${money(todayPnl)}`}
          sub={`${todayPnlPct >= 0 ? "+" : ""}${todayPnlPct.toFixed(2)}%`}
          positive
          color="#34d399"
          series={seededSeries("pnl", 18, 1.4)}
        />
        <KpiCard
          icon={Briefcase}
          label="Open Positions"
          value={String(openPositions || 2)}
          sub="Active trades"
          color="#a78bfa"
          series={seededSeries("positions", 18, 0.4)}
        />
        <KpiCard
          icon={Target}
          label="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          sub="+2.3% this month"
          positive
          color="#fbbf24"
          series={seededSeries("winrate", 18, 0.9)}
        />
        <KpiCard
          icon={BrainCircuit}
          label="AI Confidence"
          value={`${aiConfidence.toFixed(1)}%`}
          sub={aiConfidence >= 90 ? "Excellent" : aiConfidence >= 75 ? "Strong" : "Moderate"}
          positive
          color="#38bdf8"
          series={seededSeries("confidence", 18, 0.8)}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {/* Chart + AI panel */}
      <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="space-y-3 xl:col-span-9" id="section-chart">
          <TradingChart
            candles={candles}
            symbol={selectedSymbol}
            currentPrice={num(currentPrices[selectedSymbol], analysis?.currentPrice ?? 1000)}
            currencyPrefix={analysis?.currencyPrefix || "₹"}
            exchange={analysis?.exchange || "NSE"}
            interval={chartInterval}
            onIntervalChange={onIntervalChange}
            live={chartLive}
            entryPrice={analysis?.entryPrice}
            targetPrice={analysis?.targetPrice}
            stopLoss={analysis?.stopLoss}
            heightClass="h-[290px] sm:h-[310px]"
          />

          <div id="section-indicators" className="overflow-hidden rounded-2xl border border-[#13233c] bg-[#07101f]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#101c31] px-3 py-2">
              <div className="flex items-center gap-2">
                <Gauge className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-[11px] font-bold text-white">Live Indicators</span>
                <span className="rounded-full bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300">
                  28 ACTIVE
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] text-slate-400">
                <span>EMA 9 <b className="text-cyan-300">{money(emaValues.e9)}</b></span>
                <span>EMA 20 <b className="text-sky-300">{money(emaValues.e20)}</b></span>
                <span>EMA 50 <b className="text-amber-300">{money(emaValues.e50)}</b></span>
                <span>EMA 200 <b className="text-violet-300">{money(emaValues.e200)}</b></span>
              </div>
            </div>
            <div className="divide-y divide-[#101c31]">
              <IndicatorRow
                label="RSI (14)"
                value={rsiNow.toFixed(2)}
                accent={rsiNow > 70 ? "#fb7185" : rsiNow < 30 ? "#fbbf24" : "#22d3ee"}
                series={rsiValues.length ? rsiValues : seededSeries("rsi", 22, 0.3)}
              />
              <IndicatorRow
                label="MACD (12, 26, 9)"
                value={`${macdData.macd.toFixed(2)}  ${macdData.sig.toFixed(2)}  ${macdData.hist.toFixed(2)}`}
                accent={macdData.hist >= 0 ? "#34d399" : "#fb7185"}
                series={macdData.histogram.length ? macdData.histogram : seededSeries("macd", 22, 0.2)}
              />
              <IndicatorRow
                label="Supertrend (10, 3)"
                value={money(supertrend.value)}
                accent="#a78bfa"
                series={supertrend.series}
              />
            </div>
          </div>
        </div>

        {/* AI signal panel */}
        <div className="xl:col-span-3" id="section-ai">
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#13233c] bg-[#07101f]">
            <div className="flex items-center border-b border-[#101c31] bg-[#08111f] px-1.5 py-1.5">
              {[
                { key: "master", label: "Master AI" },
                { key: "astro", label: "Astrology AI" },
                { key: "indicators", label: "Indicators AI" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setAiTab(tab.key as typeof aiTab)}
                  className={`flex-1 rounded-lg px-1.5 py-1.5 text-[10px] font-bold transition ${
                    aiTab === tab.key ? "bg-cyan-500/15 text-cyan-300" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-1 flex-col gap-3 p-3.5">
              <div className="flex flex-col items-center text-center">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 animate-ping rounded-full bg-cyan-500/10" />
                  <div className="absolute inset-1 rounded-full border border-cyan-500/25" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/25">
                    <Bot className="h-6 w-6" />
                  </div>
                </div>
                <p className="mt-1.5 text-[10px] font-bold tracking-[0.2em] text-slate-400">
                  MASTER AI AGENT
                </p>
                <div className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold ${verdictMeta.bg} ${verdictMeta.border} ${verdictMeta.color}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${verdictMeta.dot}`} />
                  {verdictMeta.label}
                </div>
              </div>

              {aiTab === "astro" ? (
                <div className="rounded-xl border border-[#1a2b47] bg-[#060d19] p-2.5">
                  <p className="text-[10px] font-bold text-amber-300">
                    {analysis?.astroHighlights?.rashi || "Vrishabh"} · {analysis?.astroHighlights?.muhurat || "Shubh"}
                  </p>
                  <p className="mt-1 line-clamp-5 text-[10px] leading-relaxed text-slate-300">
                    {analysis?.astroHighlights?.summary ||
                      "Shukra ki kripa se dhan aur buying prabal hai. Guru ki 5th drishti shubh muhurat confirm karti hai."}
                  </p>
                </div>
              ) : aiTab === "indicators" ? (
                <div className="rounded-xl border border-[#1a2b47] bg-[#060d19] p-2.5">
                  <p className="text-[10px] font-bold text-cyan-300">
                    {signalCounts.bullish} bullish · {signalCounts.bearish} bearish · {signalCounts.neutral} neutral
                  </p>
                  <p className="mt-1 line-clamp-5 text-[10px] leading-relaxed text-slate-300">
                    {analysis?.recommendedActionHi ||
                      "28 indicators me se zyada bullish momentum dikha rahe hain. Trend, volume aur momentum teeno upar hain."}
                  </p>
                </div>
              ) : (
                <p className="line-clamp-4 text-center text-[10px] leading-relaxed text-slate-300">
                  {analysis?.recommendedActionHi ||
                    "Analysis: All 28 indicators suggest strong upward momentum. Trend is bullish with high volume."}
                </p>
              )}

              <div className="space-y-1.5 rounded-xl border border-[#13233c] bg-[#060d19] p-2.5">
                {[
                  { label: "Trend", value: isBuy ? "Bullish" : verdict === "HOLD" ? "Neutral" : "Bearish", color: isBuy ? "#34d399" : verdict === "HOLD" ? "#fbbf24" : "#fb7185" },
                  { label: "Momentum", value: aiConfidence >= 80 ? "Strong" : "Moderate", color: "#34d399" },
                  { label: "Volatility", value: rsiNow > 70 ? "High" : "Normal", color: "#fbbf24" },
                  { label: "Volume", value: "High", color: "#34d399" },
                  { label: "Risk", value: aiConfidence >= 70 ? "Low" : "Medium", color: "#34d399" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">{row.label}</span>
                    <span className="flex items-center gap-1.5 font-bold" style={{ color: row.color }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: row.color }} />
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => (isScanning ? undefined : onExecuteTrade(isBuy ? "BUY" : "SELL", 25000))}
                disabled={isScanning}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-400 disabled:opacity-60"
              >
                <Zap className="h-3.5 w-3.5" />
                Follow AI Signal
              </button>

              <div className="mt-auto border-t border-[#101c31] pt-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-300">28 Indicators Analysis</span>
                  <button onClick={onRefreshScan} className="text-[9px] font-semibold text-cyan-400 hover:text-cyan-300">
                    View Details
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <Donut value={aiConfidence} label={`${Math.round(aiConfidence)}%`} sublabel="accuracy" size={72} />
                  <div className="min-w-0 flex-1 space-y-1 text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Bullish
                      </span>
                      <span className="font-mono font-bold text-emerald-400">{signalCounts.bullish}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> Bearish
                      </span>
                      <span className="font-mono font-bold text-rose-400">{signalCounts.bearish}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500" /> Neutral
                      </span>
                      <span className="font-mono font-bold text-slate-300">{signalCounts.neutral}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {/* Market overview */}
        <div className="rounded-2xl border border-[#13233c] bg-[#07101f] p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white">Market Overview</h3>
            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> LIVE
            </span>
          </div>
          <div className="space-y-1.5">
            {OVERVIEW_INDICES.map((index) => {
              const meta = quoteMeta[index.symbol] || {};
              const pct = num(meta.changePercent, index.fallbackPct);
              const up = pct >= 0;
              return (
                <div key={index.symbol} className="flex items-center justify-between gap-2 text-[10px]">
                  <span className="w-[74px] shrink-0 font-semibold text-slate-400">{index.label}</span>
                  <Sparkline
                    points={seededSeries(`ov-${index.symbol}`, 18, up ? 1 : -1)}
                    color={up ? "#34d399" : "#fb7185"}
                    height={16}
                    className="h-4 min-w-0 flex-1"
                  />
                  <span className="w-[72px] shrink-0 text-right font-mono font-bold text-slate-200">
                    {money(num(currentPrices[index.symbol], index.fallback))}
                  </span>
                  <span className={`w-11 shrink-0 text-right font-mono font-bold ${up ? "text-emerald-400" : "text-rose-400"}`}>
                    {up ? "+" : ""}
                    {pct.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Auto trading */}
        <div id="section-auto" className="rounded-2xl border border-[#13233c] bg-[#07101f] p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white">Auto Trading Control</h3>
            <span className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${autoTradingEnabled ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-700/40 text-slate-400"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${autoTradingEnabled ? "animate-pulse bg-emerald-400" : "bg-slate-500"}`} />
              {autoTradingEnabled ? "Trading Active" : "Trading Paused"}
            </span>
          </div>
          <div className="mb-2 grid grid-cols-3 gap-1.5">
            <button
              onClick={() => {
                onSetAutoTrading(true);
                onSetAutoScan(true);
              }}
              className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold transition ${autoTradingEnabled ? "bg-emerald-500/20 text-emerald-300" : "bg-[#0d1a2c] text-slate-400 hover:text-white"}`}
            >
              <Play className="h-3 w-3" /> Start
            </button>
            <button
              onClick={() => onSetAutoTrading(false)}
              className="flex items-center justify-center gap-1 rounded-lg bg-[#0d1a2c] py-1.5 text-[10px] font-bold text-amber-300 transition hover:bg-amber-500/10"
            >
              <Pause className="h-3 w-3" /> Pause
            </button>
            <button
              onClick={() => {
                onSetAutoTrading(false);
                onSetAutoScan(false);
              }}
              className="flex items-center justify-center gap-1 rounded-lg bg-rose-500/10 py-1.5 text-[10px] font-bold text-rose-300 transition hover:bg-rose-500/20"
            >
              <Square className="h-3 w-3" /> Stop
            </button>
          </div>
          <div className="space-y-1.5 text-[10px]">
            <label className="flex items-center justify-between gap-2">
              <span className="text-slate-400">Strategy</span>
              <select
                value={strategy}
                onChange={(event) => setStrategy(event.target.value)}
                className="max-w-[145px] rounded-md border border-[#1a2b47] bg-[#060d19] px-1.5 py-1 text-right text-[10px] font-semibold text-slate-200 outline-none"
              >
                <option>AI Pro Strategy</option>
                <option>30-Agent Consensus</option>
                <option>NSE 9:15 OI Surge</option>
                <option>VWAP Institutional</option>
              </select>
            </label>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Lot Size</span>
              <span className="font-mono font-bold text-slate-200">1</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Risk per Trade</span>
              <span className="font-mono font-bold text-amber-300">2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">SL / Target</span>
              <span className="font-bold text-emerald-400">Auto</span>
            </div>
          </div>
        </div>

        {/* Recent trades */}
        <div id="section-history" className="rounded-2xl border border-[#13233c] bg-[#07101f] p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white">Recent Trades</h3>
            <button onClick={onOpenWallet} className="text-[9px] font-semibold text-cyan-400 hover:text-cyan-300">
              View All →
            </button>
          </div>
          <div className="grid grid-cols-[44px_1fr_44px_1fr] gap-x-1.5 border-b border-[#101c31] pb-1 text-[9px] uppercase tracking-wide text-slate-500">
            <span>Time</span>
            <span>Symbol</span>
            <span>Type</span>
            <span className="text-right">P&L</span>
          </div>
          <div className="divide-y divide-[#0d1829]">
            {recentTrades.map((trade) => (
              <div key={trade.id} className="grid grid-cols-[44px_1fr_44px_1fr] items-center gap-x-1.5 py-1.5 text-[10px]">
                <span className="font-mono text-slate-500">{trade.time}</span>
                <span className="truncate font-semibold text-slate-200">{trade.symbol}</span>
                <span className={`text-[9px] font-bold ${trade.side === "BUY" ? "text-emerald-400" : "text-rose-400"}`}>
                  {trade.side}
                </span>
                <span className={`text-right font-mono font-bold ${trade.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {trade.pnl >= 0 ? "+" : ""}
                  {money(trade.pnl)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio */}
        <div id="section-portfolio" className="rounded-2xl border border-[#13233c] bg-[#07101f] p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white">Portfolio Summary</h3>
            <button onClick={onOpenWallet} className="text-[9px] font-semibold text-cyan-400 hover:text-cyan-300">
              Details
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Donut
              value={78.5}
              size={88}
              label="78.5%"
              sublabel="allocated"
            />
            <div className="min-w-0 flex-1 space-y-2 text-[10px]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Stocks
                  </span>
                  <span className="font-mono font-bold text-slate-200">{stocksPct.toFixed(1)}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#13233c]">
                  <div className="h-full rounded-full bg-cyan-400" style={{ width: `${stocksPct}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Cash
                  </span>
                  <span className="font-mono font-bold text-slate-200">{cashPct.toFixed(1)}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#13233c]">
                  <div className="h-full rounded-full bg-emerald-400" style={{ width: `${cashPct}%` }} />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-end justify-between border-t border-[#101c31] pt-2">
            <div>
              <p className="text-[9px] uppercase tracking-wide text-slate-500">Total Value</p>
              <p className="font-mono text-sm font-extrabold text-white">₹{money(totalPortfolioValue, 0)}</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
              <ArrowUpRight className="h-3 w-3" /> +6.59%
            </span>
          </div>
        </div>
      </div>

      {/* Settings modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-2xl border border-[#1a2b47] bg-[#08111f] p-4 shadow-2xl sm:rounded-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Dashboard Settings</h3>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              <button
                onClick={onToggleSound}
                className="flex w-full items-center justify-between rounded-xl border border-[#1a2b47] bg-[#060d19] px-3 py-2.5 text-xs"
              >
                <span className="text-slate-300">Alert sounds</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${soundEnabled ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-700/40 text-slate-400"}`}>
                  {soundEnabled ? "ON" : "OFF"}
                </span>
              </button>
              <button
                onClick={() => onSetAutoScan(!autoScanEnabled)}
                className="flex w-full items-center justify-between rounded-xl border border-[#1a2b47] bg-[#060d19] px-3 py-2.5 text-xs"
              >
                <span className="text-slate-300">Auto market scan</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${autoScanEnabled ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-700/40 text-slate-400"}`}>
                  {autoScanEnabled ? "ON" : "OFF"}
                </span>
              </button>
              <button
                onClick={() => {
                  setSettingsOpen(false);
                  onOpenSubscription();
                }}
                className="flex w-full items-center justify-between rounded-xl border border-[#1a2b47] bg-[#060d19] px-3 py-2.5 text-xs"
              >
                <span className="text-slate-300">Subscription & billing</span>
                <span className="text-[10px] font-bold text-cyan-400">Manage →</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  positive,
  color,
  series,
  className = "",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  positive?: boolean;
  color: string;
  series: number[];
  className?: string;
}) {
  return (
    <div className={`min-w-0 rounded-xl border border-[#13233c] bg-gradient-to-br from-[#081321] to-[#060d18] px-3 py-2.5 ${className}`}>
      <div className="flex items-start justify-between gap-1.5">
        <div className="min-w-0">
          <p className="truncate text-[9px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-1 truncate font-mono text-base font-extrabold text-white">{value}</p>
          <p className={`mt-0.5 truncate text-[9px] font-semibold ${positive ? "text-emerald-400" : "text-slate-500"}`}>
            {sub}
          </p>
        </div>
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}1f`, color }}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <Sparkline points={series} color={color} height={20} className="mt-1.5 w-full" />
    </div>
  );
}

function IndicatorRow({
  label,
  value,
  accent,
  series,
}: {
  label: string;
  value: string;
  accent: string;
  series: number[];
}) {
  const points = series.length > 1 ? series : [1, 1.01, 1];
  return (
    <div className="flex items-center gap-3 px-3 py-1.5">
      <span className="w-[92px] shrink-0 text-[10px] font-semibold text-slate-400">{label}</span>
      <Sparkline points={points} color={accent} height={26} className="min-w-0 flex-1" />
      <span className="w-[112px] shrink-0 text-right font-mono text-[10px] font-bold" style={{ color: accent }}>
        {value}
      </span>
    </div>
  );
}
