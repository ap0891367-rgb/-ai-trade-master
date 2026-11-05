"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

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
import { WalletModal } from "@/components/WalletModal";
import { AuthModal } from "@/components/AuthModal";
import { NotificationCenter } from "@/components/NotificationCenter";
import { AstrologyModal } from "@/components/AstrologyModal";
import { NseOiScannerModal } from "@/components/NseOiScannerModal";
import { BacktestRunnerModal } from "@/components/BacktestRunnerModal";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { BillingInvoicesModal } from "@/components/BillingInvoicesModal";
import { MobileAppsModal } from "@/components/MobileAppsModal";
import { MainSidebar } from "@/components/dashboard/MainSidebar";
import { DashboardHome } from "@/components/dashboard/DashboardHome";

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
  const [activeNav, setActiveNav] = useState("dashboard");

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
    "SENSEX": 79801.43,
    "FINNIFTY": 23252.20,
    "MIDCPNIFTY": 13860.50,
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

  // Live change / change% per symbol, used by the index ticker + KPI cards.
  const [quoteMeta, setQuoteMeta] = useState<
    Record<string, { change?: number; changePercent?: number }>
  >({});

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

        const quotes = data.quotes as Record<
          string,
          { price?: number; change?: number; changePercent?: number }
        >;
        setCurrentPrices((prev) => {
          const next = { ...prev };
          for (const [sym, q] of Object.entries(quotes)) {
            if (typeof q?.price === "number" && q.price > 0) next[sym] = q.price;
          }
          return next;
        });
        setQuoteMeta((prev) => {
          const next = { ...prev };
          for (const [sym, q] of Object.entries(quotes)) {
            if (typeof q?.change === "number" || typeof q?.changePercent === "number") {
              next[sym] = { change: q.change, changePercent: q.changePercent };
            }
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

  const handleNavSelect = (id: string) => {
    setActiveNav(id);
    setIsMobileMenuOpen(false);

    const scrollTo = (sectionId: string) =>
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "center" });

    switch (id) {
      case "astrology":
        setIsAstroModalOpen(true);
        break;
      case "scanner":
        setIsNseOiModalOpen(true);
        break;
      case "backtesting":
        setIsBacktestModalOpen(true);
        break;
      case "admin":
        window.location.href = "/admin";
        break;
      case "support":
        window.location.href = "mailto:support@aitrademaster.ai";
        break;
      case "settings":
        setIsWalletModalOpen(true);
        break;
      case "charts":
        scrollTo("section-chart");
        break;
      case "agents":
        scrollTo("section-ai");
        break;
      case "indicators":
        scrollTo("section-indicators");
        break;
      case "auto-trading":
      case "strategies":
        scrollTo("section-auto");
        break;
      case "portfolio":
        scrollTo("section-portfolio");
        break;
      case "history":
        scrollTo("section-history");
        break;
      default:
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#050b16] text-slate-100 selection:bg-cyan-500/30">
      <MainSidebar
        active={activeNav}
        onSelect={handleNavSelect}
        mobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        user={user}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
        onLogout={handleLogout}
      />

      <div className="min-w-0 lg:pl-[248px]">
        <DashboardHome
          user={user}
          analysis={analysis}
          currentPrices={currentPrices}
          quoteMeta={quoteMeta}
          candles={candles}
          chartInterval={chartInterval}
          onIntervalChange={setChartInterval}
          selectedSymbol={selectedSymbol}
          onSelectSymbol={(sym) => {
            setSelectedSymbol(sym);
            setActiveNav("charts");
          }}
          chartLive={chartLive}
          walletData={walletData}
          trades={trades}
          onExecuteTrade={handleExecuteTrade}
          onRefreshScan={() => runScan(selectedSymbol, true)}
          isScanning={isScanning}
          autoTradingEnabled={autoTradingEnabled}
          autoScanEnabled={autoScanEnabled}
          onSetAutoTrading={setAutoTradingEnabled}
          onSetAutoScan={setAutoScanEnabled}
          unreadCount={unreadCount}
          onOpenWallet={() => setIsWalletModalOpen(true)}
          onOpenNotifications={() => setIsNotifOpen(true)}
          onOpenAstrology={() => setIsAstroModalOpen(true)}
          onOpenScanner={() => setIsNseOiModalOpen(true)}
          onOpenBacktest={() => setIsBacktestModalOpen(true)}
          onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
          onOpenMenu={() => setIsMobileMenuOpen(true)}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled((v) => !v)}
        />
      </div>

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
