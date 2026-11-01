"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Bot, 
  Sparkles, 
  Wallet, 
  Bell, 
  User, 
  LogIn, 
  UserPlus, 
  LogOut, 
  Volume2, 
  VolumeX, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Search,
  Menu,
  MoreVertical,
  X,
  Sun,
  Globe,
  FastForward,
  DollarSign,
  Smartphone,
  CreditCard,
  Building2,
  FileText
} from "lucide-react";

import { MasterAgentAnalysis } from "@/lib/agents/types";
import type { ChartInterval } from "@/lib/marketData";
import { ASTRO_COMPANIES } from "@/lib/agents/agentCatalog";

/** How many candles to pull per timeframe so the axis shows a meaningful span. */
const CHART_CANDLE_COUNT: Record<ChartInterval, number> = {
  "1m": 180,
  "5m": 180,
  "15m": 180,
  "1h": 180,
  "1D": 200,
};
import { TradingChart } from "@/components/TradingChart";
import { MasterAgentCard } from "@/components/MasterAgentCard";
import { AgentGrid } from "@/components/AgentGrid";
import { WalletModal } from "@/components/WalletModal";
import { AuthModal } from "@/components/AuthModal";
import { NotificationCenter } from "@/components/NotificationCenter";
import { TradesTable } from "@/components/TradesTable";
import { AstrologyModal } from "@/components/AstrologyModal";
import { WatchlistSelector } from "@/components/WatchlistSelector";
import { NseOiScannerModal } from "@/components/NseOiScannerModal";
import { EnterpriseUserPortal } from "@/components/EnterpriseUserPortal";
import { BacktestRunnerModal } from "@/components/BacktestRunnerModal";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { BillingInvoicesModal } from "@/components/BillingInvoicesModal";
import { MobileAppsModal } from "@/components/MobileAppsModal";

import { SupportedLanguage, SUPPORTED_LANGUAGES, getTranslation } from "@/lib/i18n";
import { playAlertSound } from "@/lib/sound";

export default function AutoTradingDashboard() {
  // Localization State
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>("hi");

  // User & Auth State
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAstroModalOpen, setIsAstroModalOpen] = useState(false);
  const [isNseOiModalOpen, setIsNseOiModalOpen] = useState(false);
  const [isBacktestModalOpen, setIsBacktestModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isMobileAppsModalOpen, setIsMobileAppsModalOpen] = useState(false);

  // Invoices & Billing
  const [invoices, setInvoices] = useState<any[]>([]);

  // Preferences & Toggles
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoTradingEnabled, setAutoTradingEnabled] = useState(false);
  const [autoScanEnabled, setAutoScanEnabled] = useState(true);

  // Active Symbol & Market Data
  const [selectedSymbol, setSelectedSymbol] = useState("RELIANCE");
  const [analysis, setAnalysis] = useState<MasterAgentAnalysis | null>(null);
  const [candles, setCandles] = useState<any[]>([]);
  const [chartInterval, setChartInterval] = useState<ChartInterval>("5m");
  const [chartLive, setChartLive] = useState(false);
  const [lastTickAt, setLastTickAt] = useState<string | null>(null);
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({
    // Indian Stocks & Indices (Angel One / NSE)
    "RELIANCE": 2942.50,
    "TCS": 3980.00,
    "HDFCBANK": 1640.25,
    "INFY": 1585.80,
    "TATASTEEL": 162.40,
    "NIFTY50": 22480.00,
    "BANKNIFTY": 48250.00,
    "ITC": 438.50,
    "SBIN": 792.00,
    "TATAMOTORS": 945.30,
    "BHARTIARTL": 1320.00,

    // Delta Exchange (Crypto & Derivatives)
    "BTC/USDT": 88450.00,
    "ETH/USDT": 3420.00,
    "SOL/USDT": 182.50,
    "XRP/USDT": 2.25,
    "DOGE/USDT": 0.28,
    "PEPE/USDT": 0.000014,

    // Forex & Global Commodities
    "USD/INR": 86.85,
    "EUR/USD": 1.0825,
    "GBP/USD": 1.2940,
    "XAU/USD": 2745.50,
    "USD/JPY": 152.30,
    "CRUDEOIL": 74.20,
  });

  // Live market + AI metadata returned by the scan / quotes endpoints
  const [marketMeta, setMarketMeta] = useState<{
    live: boolean;
    source: string;
    candlesLive: boolean;
    updatedAt: string | null;
  } | null>(null);
  const [aiMeta, setAiMeta] = useState<{
    enabled: boolean;
    applied: boolean;
    provider: string | null;
    model: string | null;
    summaryHi: string | null;
    summaryEn: string | null;
    reasoning: string[];
  } | null>(null);

  // Trades & Notifications
  const [trades, setTrades] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Wallet
  const [walletData, setWalletData] = useState<any>({
    balance: 500000,
    currency: "INR",
    investedAmount: 0,
    unrealizedPnl: 0,
    realizedPnl: 0,
    totalPortfolioValue: 500000,
    transactions: [],
  });

  const [isScanning, setIsScanning] = useState(false);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const t = (key: string, fallback?: string) => getTranslation(currentLanguage, key, fallback);

  // Initial load — the httpOnly session cookie is the source of truth.
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            setAutoTradingEnabled(data.user.autoTradingEnabled || false);
            if (data.user.language) setCurrentLanguage(data.user.language);
            localStorage.setItem("autotrading_user", JSON.stringify(data.user));
            fetchUserData(data.user.id);
            return;
          }
        }
        localStorage.removeItem("autotrading_user");
        setAuthModalTab("login");
        setIsAuthModalOpen(true);
      } catch (e) {
        console.error("Session check failed", e);
      }
    };

    bootstrap();
  }, []);

  const fetchUserData = async (userId: number) => {
    if (!userId) return;
    try {
      const wRes = await fetch(`/api/wallet?userId=${userId}`);
      const wData = await wRes.json();
      if (wData.wallet) setWalletData(wData.wallet);

      const tRes = await fetch(`/api/trades?userId=${userId}`);
      const tData = await tRes.json();
      if (tData.trades) setTrades(tData.trades);

      const nRes = await fetch(`/api/notifications?userId=${userId}`);
      const nData = await nRes.json();
      if (nData.notifications) {
        setNotifications(nData.notifications);
        setUnreadCount(nData.unreadCount || 0);
      }

      // Fetch Subscriptions & Invoices
      const sRes = await fetch(`/api/subscriptions?userId=${userId}`);
      const sData = await sRes.json();
      if (sData.invoices) {
        setInvoices(sData.invoices);
      }
    } catch (e) {
      console.error("Error fetching user data:", e);
    }
  };

  // Run 30-Agent Scan
  const runScan = useCallback(async (sym: string = selectedSymbol, playSound: boolean = false) => {
    setIsScanning(true);
    try {
      const res = await fetch("/api/agents/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: sym,
          userId: user?.id,
          autoTradeIfTriggered: autoTradingEnabled,
          currentPrice: currentPrices[sym],
        }),
      });

      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
        if (data.market) {
          setMarketMeta(prev => ({
            live: Boolean(data.market.live),
            source: String(data.market.source ?? "simulated"),
            candlesLive: prev?.candlesLive ?? Boolean(data.market.candlesLive),
            updatedAt: data.market.updatedAt ?? null,
          }));
        }
        if (data.ai) {
          setAiMeta({
            enabled: Boolean(data.ai.enabled),
            applied: Boolean(data.ai.applied),
            provider: data.ai.provider ?? null,
            model: data.ai.model ?? null,
            summaryHi: data.ai.summaryHi ?? null,
            summaryEn: data.ai.summaryEn ?? null,
            reasoning: Array.isArray(data.ai.reasoning) ? data.ai.reasoning : [],
          });
        }

        // When the live feed is down, keep the watchlist on the engine's
        // simulated price. With a live feed the fast tick poll owns prices, so
        // we never overwrite a fresher tick with a slightly older scan.
        if (!data.market?.live) {
          setCurrentPrices(prev => ({
            ...prev,
            [sym]: data.analysis.currentPrice,
          }));
        }

        if (playSound && soundEnabled) {
          if (data.analysis.verdict === "STRONG_BUY" || data.analysis.verdict === "BUY") {
            playAlertSound("buy");
          } else if (data.analysis.verdict === "STRONG_SELL" || data.analysis.verdict === "SELL") {
            playAlertSound("sell");
          }
        }

        if (data.autoTradeExecuted && user?.id) {
          fetchUserData(user.id);
          if (soundEnabled) playAlertSound("exec");
        }
      }
    } catch (e) {
      console.error("Scan error:", e);
    } finally {
      setIsScanning(false);
    }
  }, [selectedSymbol, user?.id, autoTradingEnabled, soundEnabled, currentPrices]);

  // Initial scan and symbol switch
  useEffect(() => {
    runScan(selectedSymbol, false);
  }, [selectedSymbol]);

  // Live market quotes (Yahoo Finance via /api/market/quotes) — polled once a
  // minute. Symbols the feed cannot resolve keep their simulated fallback price.
  useEffect(() => {
    let cancelled = false;

    const loadQuotes = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await fetch("/api/market/quotes");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data?.quotes) return;

        const quotes = data.quotes as Record<string, { price?: number }>;
        setCurrentPrices((prev) => {
          const next = { ...prev };
          for (const [sym, q] of Object.entries(quotes)) {
            if (typeof q?.price === "number" && q.price > 0) next[sym] = q.price;
          }
          return next;
        });

        if (Object.keys(quotes).length > 0) {
          setMarketMeta((prev) => ({
            live: true,
            source: String(data.source ?? "yahoo"),
            candlesLive: prev?.candlesLive ?? false,
            updatedAt: data.updatedAt ?? null,
          }));
        }
      } catch {
        // Network hiccup — keep the last known prices.
      }
    };

    loadQuotes();
    const id = setInterval(loadQuotes, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Chart candles — refetched whenever the symbol or timeframe changes and
  // refreshed periodically. 1m bars refresh every 30s; slower bars every 60s.
  useEffect(() => {
    let cancelled = false;

    const loadCandles = async () => {
      try {
        const res = await fetch(
          `/api/market/history?symbol=${encodeURIComponent(selectedSymbol)}&interval=${chartInterval}&count=${CHART_CANDLE_COUNT[chartInterval]}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !Array.isArray(data.candles)) return;
        setCandles(data.candles);
        setChartLive(Boolean(data.live));
        setMarketMeta(prev => ({
          live: prev?.live ?? false,
          source: prev?.source ?? "simulated",
          candlesLive: Boolean(data.live),
          updatedAt: prev?.updatedAt ?? null,
        }));
      } catch {
        // Keep the previous chart on failure.
      }
    };

    setCandles([]);
    loadCandles();
    const id = setInterval(loadCandles, chartInterval === "1m" ? 30_000 : 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [selectedSymbol, chartInterval]);

  // Fast tick for the symbol on the chart: the server bypasses its 60s quote
  // cache (10s TTL) so the price line and last candle move in real time.
  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await fetch(`/api/market/quotes?symbols=${encodeURIComponent(selectedSymbol)}&fast=1`);
        if (!res.ok) return;
        const data = await res.json();
        const quote = data?.quotes?.[selectedSymbol] as { price?: number } | undefined;
        if (cancelled || !quote || typeof quote.price !== "number") return;
        setCurrentPrices(prev => ({ ...prev, [selectedSymbol]: quote.price as number }));
        setLastTickAt(data.updatedAt ?? new Date().toISOString());
        setMarketMeta(prev => ({
          live: true,
          source: "yahoo",
          candlesLive: prev?.candlesLive ?? false,
          updatedAt: data.updatedAt ?? null,
        }));
      } catch {
        // Network hiccup — keep the last tick.
      }
    };

    tick();
    const id = setInterval(tick, 10_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [selectedSymbol]);

  // Live Auto-Scan Interval
  useEffect(() => {
    if (!autoScanEnabled) {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      return;
    }

    scanIntervalRef.current = setInterval(() => {
      runScan(selectedSymbol, false);
    }, 8000);

    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [autoScanEnabled, selectedSymbol, runScan]);

  // Execute manual Trade (BUY or SELL)
  const handleExecuteTrade = async (side: "BUY" | "SELL", amount: number = 25000) => {
    if (!user) {
      setAuthModalTab("login");
      setIsAuthModalOpen(true);
      return;
    }

    const price = analysis?.currentPrice || currentPrices[selectedSymbol] || 1000;
    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          action: "OPEN_TRADE",
          symbol: selectedSymbol,
          companyName: analysis?.companyName || selectedSymbol,
          side,
          price,
          investedAmount: amount,
          stopLoss: analysis?.stopLoss,
          takeProfit: analysis?.targetPrice,
          confidence: analysis?.overallConfidence || 85,
          astroVerdict: `${analysis?.astroHighlights.rashi} - ${analysis?.astroHighlights.muhurat}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to execute trade");
        return;
      }

      if (soundEnabled) playAlertSound("exec");
      fetchUserData(user.id);
    } catch (e: any) {
      alert(e.message || "Trade error");
    }
  };

  // Close Position
  const handleCloseTrade = async (tradeId: number, livePrice: number) => {
    if (!user) return;
    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          action: "CLOSE_TRADE",
          tradeId,
          price: livePrice,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (soundEnabled) playAlertSound("exec");
      fetchUserData(user.id);
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Toggle Auto-trading
  const handleToggleAutoTrading = async () => {
    const nextVal = !autoTradingEnabled;
    setAutoTradingEnabled(nextVal);
    if (user?.id) {
      try {
        await fetch("/api/auth/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            autoTradingEnabled: nextVal,
          }),
        });
      } catch (e) {
        console.error("Failed to persist auto-trading toggle", e);
      }
    }
    if (soundEnabled) playAlertSound("ping");
  };

  // Wallet Actions
  const handleAddFunds = async (amount: number) => {
    if (!user) return;
    const res = await fetch("/api/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        action: "DEPOSIT",
        amount,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    fetchUserData(user.id);
  };

  const handleResetWallet = async () => {
    if (!user) return;
    const res = await fetch("/api/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        action: "RESET",
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    fetchUserData(user.id);
  };

  const handleMarkAllNotifsRead = async () => {
    if (!user) return;
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        markAll: true,
      }),
    });
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Subscriptions & AI Agent Invocations
  const handleSubscribePlan = async (planCode: string, cycle: "MONTHLY" | "ANNUAL", couponCode?: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        planCode,
        billingCycle: cycle,
        couponCode,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to upgrade subscription");

    setUser((prev: any) => ({ ...prev, currentPlan: planCode }));
    fetchUserData(user.id);
  };

  const handleRunAiAgent = async (agentKey: string, symbol: string) => {
    const res = await fetch("/api/ai-agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user?.id || 1,
        agentKey,
        symbol,
      }),
    });
    return await res.json();
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout failed", e);
    }
    localStorage.removeItem("autotrading_user");
    setUser(null);
    setAuthModalTab("login");
    setIsAuthModalOpen(true);
  };

  const openAuthWithTab = (tab: "login" | "register") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const companyAstro = ASTRO_COMPANIES[selectedSymbol] || ASTRO_COMPANIES["RELIANCE"];
  const currencyPrefix = companyAstro?.currencyPrefix || "₹";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* TOP NAVIGATION BAR (Clean, Human-friendly Fintech Header) */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-2 flex items-center justify-between gap-2">
          {/* Logo & Platform Identity - Clean, legible, human typography */}
          <div className="flex items-center gap-2 min-w-0 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Bot className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm md:text-base text-white tracking-tight whitespace-nowrap">
                  {t("projectName", "AI Trade Master")}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono hidden sm:inline">
                  {user?.currentPlan || "FREE"}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden xl:block">
                {t("tagline", "Trade Smarter with AI.")} • Angel One • Delta Exchange
              </p>
            </div>
          </div>

          {/* Right Header Controls - Balanced & Guaranteed NO CUT-OFF on ANY Screen */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
            {/* Language Selector: Compact on mobile (26px code), comfortable on desktop (84px name) */}
            <div className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg px-1.5 sm:px-2.5 py-1 text-xs transition shrink-0" title="Change Language">
              <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              {/* Mobile View: Shows clean 2-letter uppercase badge (HI, EN, MR...) */}
              <select
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value as SupportedLanguage)}
                className="bg-transparent text-white font-bold text-[11px] focus:outline-none cursor-pointer sm:hidden w-[26px] pr-0 uppercase text-center"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-white text-xs">
                    {lang.flag} {lang.code.toUpperCase()} ({lang.nameNative})
                  </option>
                ))}
              </select>

              {/* Tablet & Desktop View: Shows full language name */}
              <select
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value as SupportedLanguage)}
                className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer hidden sm:inline w-[84px] truncate pr-1"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-white py-1">
                    {lang.flag} {lang.nameNative} ({lang.nameEnglish})
                  </option>
                ))}
              </select>
            </div>

            {/* 🌅 9:15 AM NSE OI Button */}
            <button
              onClick={() => setIsNseOiModalOpen(true)}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition shrink-0"
              title="Morning 9:15 AM NSE OI Scanner Agent"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>9:15 AM OI</span>
            </button>

            {/* Pricing / Upgrade Tier Button */}
            <button
              onClick={() => setIsSubscriptionModalOpen(true)}
              className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium transition shrink-0"
              title="View Subscription Plans"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Plans</span>
            </button>

            {/* Wallet Balance Pill */}
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono font-semibold transition text-slate-200 shrink-0"
              title="Virtual Wallet Capital"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">
                ₹{(walletData?.balance || 500000).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </span>
              <span className="inline sm:hidden font-mono">
                ₹{Math.round((walletData?.balance || 500000) / 1000)}k
              </span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition shrink-0"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Desktop Auth Area: CONDITIONAL (Shows User Profile when logged in, OR Login/Register when logged out!) */}
            <div className="hidden lg:flex items-center gap-1.5 pl-1.5 border-l border-slate-800 shrink-0">
              {user ? (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="text-slate-200 font-medium truncate max-w-[85px]" title={user.email}>
                      {user.name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Logout account"
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openAuthWithTab("login")}
                    className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-medium transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => openAuthWithTab("register")}
                    className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-sm"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* Mobile 3-Dot (⋮) Menu Button - NEVER CUTS OFF */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 lg:hidden flex items-center justify-center shrink-0 cursor-pointer"
              aria-label="Navigation Menu"
              title="Menu Options"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 text-white" /> : <MoreVertical className="w-4 h-4 text-white" />}
            </button>
          </div>
        </div>

        {/* COLLAPSIBLE MOBILE MENU DROPDOWN */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-2.5 animate-in slide-in-from-top-2 duration-150">
            {user && (
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setIsSubscriptionModalOpen(true); setIsMobileMenuOpen(false); }}
                className="py-2 px-3 rounded-xl bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Plans & Pricing</span>
              </button>

              <button
                onClick={() => { setIsBacktestModalOpen(true); setIsMobileMenuOpen(false); }}
                className="py-2 px-3 rounded-xl bg-blue-600/30 text-cyan-300 border border-blue-500/40 text-xs font-bold flex items-center justify-center gap-1"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Run Backtest</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => openAuthWithTab("login")}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-4 h-4 text-cyan-400" />
                <span>Login</span>
              </button>

              <button
                onClick={() => openAuthWithTab("register")}
                className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30"
              >
                <UserPlus className="w-4 h-4 text-white" />
                <span>Register</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <button
                onClick={() => { setIsMobileAppsModalOpen(true); setIsMobileMenuOpen(false); }}
                className="text-purple-300 font-medium flex items-center gap-1"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile Apps (APK & iOS)</span>
              </button>

              <button
                onClick={() => { setIsBillingModalOpen(true); setIsMobileMenuOpen(false); }}
                className="text-slate-300 font-medium flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Invoices</span>
              </button>
            </div>
          </div>
        )}

        {/* CLEAN DIRECT WATCHLIST SELECTOR: ANGEL ONE, DELTA EXCHANGE & DIRECT SEARCH BAR */}
        <WatchlistSelector
          selectedSymbol={selectedSymbol}
          onSelectSymbol={(sym) => setSelectedSymbol(sym)}
          currentPrices={currentPrices}
        />
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-2 sm:px-4 py-3 sm:py-5 space-y-4 sm:space-y-6 flex-1 min-w-0 max-w-full overflow-hidden">
        {/* Live data + AI status strip */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-2 sm:px-4 sm:py-2.5 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-[11px]">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full font-bold border ${
                marketMeta?.live
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                  : "bg-amber-500/15 text-amber-300 border-amber-500/40"
              }`}
              title={
                marketMeta?.live
                  ? "Price ticks every 10s; candles refresh automatically"
                  : "Live feed unavailable — simulated prices in use"
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  marketMeta?.live ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
              />
              {marketMeta?.live ? "LIVE MARKET" : "SIMULATED DATA"}
            </span>

            <span className="text-slate-500">
              {marketMeta?.live
                ? `Yahoo Finance · ${chartLive ? `${chartInterval} candles` : "chart fallback"}`
                : "Yahoo Finance unreachable · demo fallback"}
            </span>

            {(lastTickAt || marketMeta?.updatedAt) && (
              <span className="text-slate-600">
                · tick{" "}
                {new Date(lastTickAt ?? marketMeta!.updatedAt!).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}

            <span className="ml-auto inline-flex items-center gap-1.5 px-2 py-1 rounded-full font-bold border bg-purple-500/15 text-purple-300 border-purple-500/40">
              <Sparkles className="w-3 h-3" />
              {aiMeta?.applied
                ? `AI · ${String(aiMeta.provider ?? "llm").toUpperCase()}${aiMeta.model ? ` ${aiMeta.model}` : ""}`
                : aiMeta?.enabled
                  ? "AI · failed → built-in engine"
                  : "AI · built-in engine"}
            </span>
          </div>

          {aiMeta?.applied && (aiMeta.summaryEn || aiMeta.summaryHi) && (
            <p className="text-[11px] sm:text-xs text-slate-300 leading-snug">
              <span className="font-bold text-purple-300">AI verdict:</span>{" "}
              {currentLanguage === "hi" ? aiMeta.summaryHi || aiMeta.summaryEn : aiMeta.summaryEn || aiMeta.summaryHi}
            </p>
          )}

          {aiMeta?.applied && aiMeta.reasoning.length > 0 && (
            <ul className="hidden sm:flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
              {aiMeta.reasoning.slice(0, 3).map((point, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="text-purple-400">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Master Agent Commander Hero Card */}
        <MasterAgentCard
          analysis={analysis}
          onExecuteTrade={handleExecuteTrade}
          onRefreshScan={() => runScan(selectedSymbol, true)}
          isScanning={isScanning}
          autoTradingEnabled={autoTradingEnabled}
          onToggleAutoTrading={handleToggleAutoTrading}
        />

        {/* TradingView-style real-time candlestick chart */}
        <div className="grid grid-cols-1 gap-6 min-w-0">
          <TradingChart
            candles={candles}
            symbol={selectedSymbol}
            currentPrice={currentPrices[selectedSymbol] || analysis?.currentPrice || 1000}
            currencyPrefix={currencyPrefix}
            exchange={companyAstro.exchange}
            interval={chartInterval}
            onIntervalChange={setChartInterval}
            live={chartLive}
            entryPrice={analysis?.entryPrice}
            targetPrice={analysis?.targetPrice}
            stopLoss={analysis?.stopLoss}
          />
        </div>

        {/* 10 MASTER AI AGENTS & SUBSCRIPTION PORTAL SECTION */}
        <EnterpriseUserPortal
          currentLanguage={currentLanguage}
          onChangeLanguage={(l) => setCurrentLanguage(l)}
          user={user}
          onSubscribePlan={handleSubscribePlan}
          onRunAiAgent={handleRunAiAgent}
        />

        {/* Trades & Open Positions Table */}
        <TradesTable
          trades={trades}
          onCloseTrade={handleCloseTrade}
          currentPrices={currentPrices}
        />

        {/* 30-Agent Live Breakdown Grid */}
        <AgentGrid signals={analysis?.agentSignals || []} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#090f20] py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AI Trade Master • {t("paperTradingOnly", "Strictly Simulated Paper Trading Environment")}</span>
          </div>
          <div className="text-[11px] text-slate-500">
            10 Master AI Agents • 12 Indian Languages • Angel One, Delta Exchange & Forex
          </div>
        </div>
      </footer>

      {/* Modals */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        walletData={walletData}
        onAddFunds={handleAddFunds}
        onResetWallet={handleResetWallet}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
        onSuccess={(userData) => {
          setUser(userData);
          localStorage.setItem("autotrading_user", JSON.stringify(userData));
          fetchUserData(userData.id);
        }}
      />

      <NotificationCenter
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAllRead={handleMarkAllNotifsRead}
        onSelectSymbol={(sym) => {
          setSelectedSymbol(sym);
          setIsNotifOpen(false);
        }}
      />

      <AstrologyModal
        isOpen={isAstroModalOpen}
        onClose={() => setIsAstroModalOpen(false)}
        selectedSymbol={selectedSymbol}
        astroHighlights={analysis?.astroHighlights}
      />

      <NseOiScannerModal
        isOpen={isNseOiModalOpen}
        onClose={() => setIsNseOiModalOpen(false)}
        onSelectSymbol={(sym) => {
          setSelectedSymbol(sym);
          runScan(sym, true);
        }}
      />

      <BacktestRunnerModal
        isOpen={isBacktestModalOpen}
        onClose={() => setIsBacktestModalOpen(false)}
        selectedSymbol={selectedSymbol}
      />

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        currentPlanCode={user?.currentPlan || "FREE"}
        onSubscribe={handleSubscribePlan}
      />

      <BillingInvoicesModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        invoices={invoices}
        currentPlan={user?.currentPlan || "FREE"}
      />

      <MobileAppsModal
        isOpen={isMobileAppsModalOpen}
        onClose={() => setIsMobileAppsModalOpen(false)}
      />
    </div>
  );
}
