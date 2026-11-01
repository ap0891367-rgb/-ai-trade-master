"use client";

import React, { useState } from "react";
import {
  Globe,
  Sparkles,
  Zap,
  TrendingUp,
  Cpu,
  BarChart3,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building2,
  DollarSign,
  Radio,
  FileText,
  HelpCircle,
  Play
} from "lucide-react";
import { SupportedLanguage, SUPPORTED_LANGUAGES, getTranslation } from "@/lib/i18n";
import { ENTERPRISE_SUBSCRIPTION_PLANS, SubscriptionPlanDef } from "@/lib/subscriptionPlans";
import { MASTER_10_AI_AGENTS, MasterAiAgentDef } from "@/lib/masterAiAgents";

interface EnterpriseUserPortalProps {
  currentLanguage: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  user: any;
  onSubscribePlan: (planCode: string, cycle: "MONTHLY" | "ANNUAL") => Promise<void>;
  onRunAiAgent: (agentKey: string, symbol: string) => Promise<any>;
}

export function EnterpriseUserPortal({
  currentLanguage,
  onChangeLanguage,
  user,
  onSubscribePlan,
  onRunAiAgent,
}: EnterpriseUserPortalProps) {
  const [activeTab, setActiveTab] = useState<"ai_agents" | "plans" | "learning" | "mobile_apps" | "compliance">("ai_agents");
  const [selectedAgent, setSelectedAgent] = useState<MasterAiAgentDef>(MASTER_10_AI_AGENTS[0]);
  const [testSymbol, setTestSymbol] = useState("RELIANCE");
  const [aiRunning, setAiRunning] = useState(false);
  const [aiResult, setAiResult] = useState<any | null>(null);

  // Billing Cycle Toggle
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [subscribingCode, setSubscribingCode] = useState<string | null>(null);
  const [subSuccess, setSubSuccess] = useState<string | null>(null);

  const t = (key: string, fallback?: string) => getTranslation(currentLanguage, key, fallback);

  const handleExecuteAgent = async () => {
    setAiRunning(true);
    try {
      const res = await onRunAiAgent(selectedAgent.key, testSymbol);
      if (res?.result) {
        setAiResult(res.result);
      }
    } finally {
      setAiRunning(false);
    }
  };

  const handleSelectPlan = async (plan: SubscriptionPlanDef) => {
    setSubscribingCode(plan.code);
    try {
      await onSubscribePlan(plan.code, billingCycle);
      setSubSuccess(`Congratulations! Your account has been upgraded to ${plan.name} (${billingCycle}).`);
      setTimeout(() => setSubSuccess(null), 4000);
    } finally {
      setSubscribingCode(null);
    }
  };

  return (
    <div className="bg-[#0b1329] border border-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-2xl space-y-4 sm:space-y-6 text-white overflow-hidden">
      {/* Top Banner: Project Tagline & 12-Language Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                {t("projectName", "AI Trade Master")}
              </span>
            </h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 font-mono font-bold border border-blue-500/30">
              ENTERPRISE SAAS
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold border border-emerald-500/30">
              {t("paperTradingOnly", "Simulated Paper Trading Only")}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {t("tagline", "Trade Smarter with AI.")} • 10 Master AI Agents • 12 Indian Languages • Live Multi-Market Simulation
          </p>
        </div>

        {/* 12-Language Selector Dropdown */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
          <select
            value={currentLanguage}
            onChange={(e) => onChangeLanguage(e.target.value as SupportedLanguage)}
            className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-900 border border-slate-700 text-[11px] sm:text-xs font-bold text-white focus:outline-none focus:border-cyan-400 transition cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                {lang.flag} {lang.nameNative} ({lang.nameEnglish})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab("ai_agents")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold transition shrink-0 ${
            activeTab === "ai_agents"
              ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/30"
              : "bg-slate-900/60 text-slate-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>10 Master AI Agents</span>
        </button>

        <button
          onClick={() => setActiveTab("plans")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold transition shrink-0 ${
            activeTab === "plans"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30"
              : "bg-slate-900/60 text-slate-400 hover:text-white"
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Subscription Plans & Pricing</span>
        </button>

        <button
          onClick={() => setActiveTab("mobile_apps")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold transition shrink-0 ${
            activeTab === "mobile_apps"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30"
              : "bg-slate-900/60 text-slate-400 hover:text-white"
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Mobile Apps (Android & iOS)</span>
        </button>

        <button
          onClick={() => setActiveTab("learning")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold transition shrink-0 ${
            activeTab === "learning"
              ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/30"
              : "bg-slate-900/60 text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Learning & Risk Center</span>
        </button>

        <button
          onClick={() => setActiveTab("compliance")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-extrabold transition shrink-0 ${
            activeTab === "compliance"
              ? "bg-slate-800 text-white"
              : "bg-slate-900/60 text-slate-400 hover:text-white"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>SEBI Paper Trading Policy</span>
        </button>
      </div>

      {subSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{subSuccess}</span>
        </div>
      )}

      {/* TAB 1: 10 MASTER AI AGENTS SHOWCASE & INTERACTIVE INFERENCE */}
      {activeTab === "ai_agents" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: 10 Agents Selector List (5 cols) */}
            <div className="md:col-span-5 space-y-2 max-h-64 md:max-h-[500px] overflow-y-auto pr-1 touch-scroll">
              {MASTER_10_AI_AGENTS.map((agent, idx) => {
                const isSelected = selectedAgent.key === agent.key;
                return (
                  <div
                    key={agent.key}
                    onClick={() => setSelectedAgent(agent)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-600/20 border-cyan-400/80 shadow-md shadow-blue-500/10"
                        : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 font-bold">
                          #{idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{agent.name}</h4>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">
                        {agent.accuracy} Acc.
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                      {agent.category} • {agent.model}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Selected Agent Interactive Testing Cockpit (7 cols) */}
            <div className="md:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-start justify-between pb-3 border-b border-slate-800 gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{selectedAgent.name}</span>
                    </h3>
                    <span className="text-[11px] sm:text-xs text-cyan-300 font-mono font-semibold">
                      Model: {selectedAgent.model} • {selectedAgent.category}
                    </span>
                  </div>

                  <span className="text-[10px] sm:text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold shrink-0">
                    {selectedAgent.accuracy} Accuracy
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  {currentLanguage === "en" ? selectedAgent.descriptionEn : selectedAgent.descriptionHi}
                </p>

                {/* Test Symbol Input */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Run AI Analysis on Symbol:</span>
                    <span className="text-[10px] text-slate-400 font-mono">NSE / Delta / Forex</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={testSymbol}
                      onChange={(e) => setTestSymbol(e.target.value.toUpperCase())}
                      className="flex-1 min-w-0 px-3 py-2.5 sm:py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-400 uppercase"
                    />
                    <button
                      onClick={handleExecuteAgent}
                      disabled={aiRunning}
                      className="shrink-0 px-3 sm:px-4 py-2.5 sm:py-2 min-h-10 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-[11px] sm:text-xs flex items-center gap-1.5 transition shadow-md shadow-blue-600/30"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{aiRunning ? "Inferencing..." : "Execute AI"}</span>
                    </button>
                  </div>
                </div>

                {/* AI Inference Output Card */}
                {aiResult && (
                  <div className="mt-4 p-4 rounded-xl bg-blue-950/30 border border-cyan-500/40 space-y-2 text-xs animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300 font-mono">
                        {aiResult.agentName} Output:
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold font-mono">
                        {aiResult.verdict} ({aiResult.confidence}%)
                      </span>
                    </div>

                    <p className="text-white text-xs leading-relaxed">
                      {currentLanguage === "en" ? aiResult.summaryEn : aiResult.summaryHi}
                    </p>

                    <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/80 flex justify-between">
                      <span>Model: {aiResult.modelUsed}</span>
                      <span>Verified: {aiResult.timestamp}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Invocations: <strong>{selectedAgent.invocations.toLocaleString()}</strong></span>
                <span className="text-emerald-400 font-bold">● Active Online</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUBSCRIPTION PLANS & TIERS */}
      {activeTab === "plans" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <h3 className="text-lg font-bold text-white">Choose Your AI Trade Master Tier</h3>
              <p className="text-xs text-slate-400">
                Software subscription billing is kept completely separate from simulated paper-trading balances.
              </p>
            </div>

            {/* Monthly vs Annual Toggle */}
            <div className="inline-flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs font-bold self-center">
              <button
                onClick={() => setBillingCycle("MONTHLY")}
                className={`px-3.5 py-1.5 rounded-xl transition ${
                  billingCycle === "MONTHLY" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle("ANNUAL")}
                className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  billingCycle === "ANNUAL" ? "bg-emerald-600 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 text-emerald-100 font-mono">
                  Save ~17%
                </span>
              </button>
            </div>
          </div>

          {/* 5 Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {ENTERPRISE_SUBSCRIPTION_PLANS.map((plan) => {
              const price = billingCycle === "ANNUAL" ? plan.priceAnnual : plan.priceMonthly;
              const isCurrent = user?.currentPlan === plan.code;

              return (
                <div
                  key={plan.code}
                  className={`rounded-3xl p-4 sm:p-5 border flex flex-col justify-between transition-all ${
                    plan.isPopular
                      ? "bg-gradient-to-b from-blue-950/60 to-slate-900 border-cyan-400 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-400/50"
                      : "bg-slate-900/70 border-slate-800"
                  }`}
                >
                  <div>
                    {plan.isPopular && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold mb-2 inline-block">
                        MOST POPULAR
                      </span>
                    )}

                    <h4 className="text-base font-extrabold text-white">{plan.name}</h4>
                    
                    <div className="my-3">
                      <span className="text-2xl font-black text-white font-mono">
                        ₹{price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">
                        /{billingCycle === "ANNUAL" ? "year" : "month"}
                      </span>
                    </div>

                    {/* Features list */}
                    <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
                      {plan.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800">
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={isCurrent || subscribingCode === plan.code}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition shadow ${
                        isCurrent
                          ? "bg-slate-800 text-slate-400 cursor-default"
                          : plan.isPopular
                          ? "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-blue-600/30"
                          : "bg-slate-800 hover:bg-slate-700 text-white"
                      }`}
                    >
                      {isCurrent ? "Current Active Plan" : subscribingCode === plan.code ? "Upgrading..." : "Select Plan"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MOBILE APPS (ANDROID & IOS) */}
      {activeTab === "mobile_apps" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-950/40 via-blue-950/40 to-slate-900 border border-purple-500/30 rounded-3xl p-5 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                📱 REACT NATIVE + EXPO BUILD READY
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Trade on Mobile: Android & iOS Application
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Take the power of 10 Master AI Agents, 9:15 AM Open Interest scanner, and instant paper trading notifications directly on your mobile device. Built with cross-platform React Native + Expo.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 flex items-center gap-2">
                  <div className="text-emerald-400 font-bold text-sm">🤖 Android APK</div>
                  <span className="text-[10px] text-slate-400 font-mono">v3.2.0 (Google Play)</span>
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 flex items-center gap-2">
                  <div className="text-blue-400 font-bold text-sm">🍎 iOS App</div>
                  <span className="text-[10px] text-slate-400 font-mono">TestFlight & App Store</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center font-mono text-xs space-y-2 shrink-0">
              <div className="w-32 h-32 mx-auto rounded-xl bg-white p-2 flex items-center justify-center text-slate-950 font-bold text-center text-[10px]">
                [QR CODE]<br />Scan to Install Expo Go Demo
              </div>
              <div className="text-slate-400 text-[10px]">Mobile Expo Client Ready</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LEARNING & RISK CENTER */}
      {activeTab === "learning" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Quantitative Risk Rules</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Learn how automated circuit breakers and maximum drawdown stops preserve virtual capital. Always maintain at least a 1:2.0 risk-reward ratio before initiating simulated positions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Backtesting Methodology</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Understand tick-by-tick simulation without lookahead bias. Never fit parameters to past data; test across diverse bullish, sideways, and volatile market regimes.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Astrological Gochar & Market Cycles</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Study classical corporate Sthapana Kundali alignments with modern quantitative momentum. Learn why Shubh Choghadiya timing adds psychological discipline to trading entries.
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: SEBI PAPER TRADING COMPLIANCE POLICY */}
      {activeTab === "compliance" && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs leading-relaxed text-slate-300">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>SEBI & Global Regulatory Paper-Trading Mandate (v3.2)</span>
          </h4>
          <p>
            1. <strong>Simulation Only:</strong> All trading accounts, bot orders, wallet balances, and performance metrics displayed on AI Trade Master operate strictly in a paper-trading simulation environment.
          </p>
          <p>
            2. <strong>No Capital Custody:</strong> AI Trade Master never accepts, pools, deposits, or transfers real customer investment capital. Software subscription payments provide access to analytical tools and are kept completely isolated from virtual balances.
          </p>
          <p>
            3. <strong>No Performance Guarantee:</strong> Past backtests and simulated multi-agent confluence do not represent financial advice or guarantee future stock market returns.
          </p>
        </div>
      )}
    </div>
  );
}
