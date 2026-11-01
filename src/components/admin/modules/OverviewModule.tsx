"use client";

import React from "react";
import {
  Users,
  Bot,
  ListOrdered,
  Wallet,
  TrendingUp,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Zap,
  Globe,
  Radio,
  BarChart3,
  Sparkles
} from "lucide-react";
import { AdminModuleId } from "../AdminSidebar";

interface OverviewModuleProps {
  kpis: any;
  providers: any[];
  recentAuditLogs: any[];
  recentOrders: any[];
  topBots: any[];
  onNavigate: (module: AdminModuleId) => void;
  onEmergencyStopAll: () => void;
}

export function OverviewModule({
  kpis,
  providers,
  recentAuditLogs,
  recentOrders,
  topBots,
  onNavigate,
  onEmergencyStopAll,
}: OverviewModuleProps) {
  const statCards = [
    {
      title: "Total Demo Users",
      value: kpis?.totalUsers || 8,
      subValue: `${kpis?.activeUsers || 8} Active • ${kpis?.verifiedKyc || 7} KYC Verified`,
      icon: Users,
      color: "from-blue-600 to-indigo-600",
      textColor: "text-blue-400",
      moduleId: "users" as AdminModuleId,
    },
    {
      title: "Active Trading Bots",
      value: `${kpis?.activeBots || 5}/${kpis?.totalBots || 6}`,
      subValue: `Avg Win Rate: ${kpis?.averageWinRate || 71.8}%`,
      icon: Bot,
      color: "from-purple-600 to-indigo-600",
      textColor: "text-purple-400",
      moduleId: "bots" as AdminModuleId,
    },
    {
      title: "Simulated Orders",
      value: kpis?.totalOrders || 12,
      subValue: `${kpis?.filledOrders || 11} Executed • ${kpis?.pendingOrders || 1} Pending`,
      icon: ListOrdered,
      color: "from-emerald-600 to-teal-600",
      textColor: "text-emerald-400",
      moduleId: "orders" as AdminModuleId,
    },
    {
      title: "Total Virtual Ledger",
      value: `₹${(kpis?.totalWalletBalance || 6425000).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      subValue: "100% Paper Trading Capital",
      icon: Wallet,
      color: "from-amber-600 to-orange-600",
      textColor: "text-amber-400",
      moduleId: "wallet" as AdminModuleId,
    },
    {
      title: "Simulated Net P&L",
      value: `${(kpis?.totalSimulatedPnl || 148500) >= 0 ? "+" : ""}₹${Number(kpis?.totalSimulatedPnl || 148500).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subValue: `Realized: ₹${Number(kpis?.realizedPnl || 42500).toLocaleString("en-IN")}`,
      icon: TrendingUp,
      color: "from-emerald-600 to-cyan-600",
      textColor: "text-emerald-400",
      moduleId: "analytics" as AdminModuleId,
    },
    {
      title: "Market Feed Gateway",
      value: `${kpis?.connectedProviders || 4}/${kpis?.totalProviders || 4} Feeds`,
      subValue: `Avg Latency: ${kpis?.avgLatencyMs || 15} ms`,
      icon: Activity,
      color: "from-cyan-600 to-blue-600",
      textColor: "text-cyan-400",
      moduleId: "market-data" as AdminModuleId,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Disclaimer / Compliance Notice Banner */}
      <div className="p-4 rounded-2xl bg-[#0d1630] border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <span>SEBI Compliant Paper Trading Simulation Environment</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                MOCK_DATA_v3.2
              </span>
            </div>
            <p className="text-slate-400 text-[11px] mt-0.5">
              This system operates strictly in virtual simulation mode. No real money or exchange broker accounts are touched.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate("config")}
            className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 min-h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
          >
            Review Policy
          </button>
          <button
            onClick={() => onNavigate("bots")}
            className="flex-1 sm:flex-none px-3.5 py-2 sm:py-1.5 min-h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-blue-600/30"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Manage 30-Agent Bots</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              onClick={() => onNavigate(card.moduleId)}
              className="p-3.5 sm:p-5 rounded-2xl bg-[#0d1630] border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer group flex flex-col justify-between min-w-0"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider leading-tight">
                  {card.title}
                </span>
                <div className={`p-1.5 sm:p-2 rounded-xl bg-gradient-to-tr ${card.color} text-white shadow-md shrink-0`}>
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>

              <div className="mt-3 sm:mt-4 min-w-0">
                <div className={`text-lg sm:text-2xl font-mono font-extrabold break-words ${card.textColor}`}>
                  {card.value}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 mt-1 flex items-center justify-between gap-1">
                  <span className="truncate">{card.subValue}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 shrink-0" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Row: Live Feed Status & Top Active AI Bots */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active AI Trading Bots (7 cols) */}
        <div className="lg:col-span-7 bg-[#0d1630] border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Active AI Automated Trading Bots</h3>
            </div>
            <button
              onClick={() => onNavigate("bots")}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              View All ({kpis?.totalBots || 6}) →
            </button>
          </div>

          <div className="space-y-2.5">
            {topBots.map((bot) => (
              <div
                key={bot.id}
                className="p-3 sm:p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <div className="min-w-0">
                    <div className="font-bold text-white flex items-center gap-2 flex-wrap">
                      <span>{bot.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-blue-300 font-mono">
                        {bot.symbol}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Strategy: {bot.strategy} • {bot.exchange}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono shrink-0 ml-auto">
                  <div className="text-emerald-400 font-bold">
                    +₹{Number(bot.totalPnl).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Win Rate: {bot.winRate}% ({bot.totalTrades} trades)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Exchange Data Providers Status (5 cols) */}
        <div className="lg:col-span-5 bg-[#0d1630] border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white">Market Data Gateways</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold font-mono">
              ALL ONLINE
            </span>
          </div>

          <div className="space-y-3">
            {providers.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2 text-xs"
              >
                <div className="min-w-0">
                  <div className="font-bold text-white text-xs truncate">{p.providerName}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {p.exchange} • {p.feedMode}
                  </div>
                </div>
                <div className="text-right font-mono shrink-0">
                  <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold">
                    {p.latencyMs} ms
                  </span>
                  <div className="text-[9px] text-slate-500 mt-0.5">Sub-tick speed</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Simulated Orders & Audit Log Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Table (7 cols) */}
        <div className="lg:col-span-7 bg-[#0d1630] border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Latest Simulated Order Executions</h3>
            </div>
            <button
              onClick={() => onNavigate("orders")}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Order Book →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 font-mono uppercase text-[10px]">
                <tr>
                  <th className="p-2.5 rounded-l-lg">Asset</th>
                  <th className="p-2.5">Side</th>
                  <th className="p-2.5">Qty</th>
                  <th className="p-2.5">Price</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 rounded-r-lg text-right">Exchange</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-2.5 font-bold text-white">{o.symbol}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        o.side === "BUY" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                      }`}>
                        {o.side}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-slate-300">{o.quantity}</td>
                    <td className="p-2.5 font-mono text-slate-200">₹{o.executedPrice || o.requestedPrice}</td>
                    <td className="p-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono text-[10px]">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-right text-[10px] text-slate-400 font-mono">{o.exchange}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Administrative Audit Log Stream (5 cols) */}
        <div className="lg:col-span-5 bg-[#0d1630] border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Security & Audit Events</h3>
            </div>
            <button
              onClick={() => onNavigate("audit")}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Full Trail →
            </button>
          </div>

          <div className="space-y-2.5">
            {recentAuditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs flex items-start gap-2.5"
              >
                <div className="p-1 rounded bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-white text-[11px] truncate">{log.action}</span>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono truncate">
                    {log.adminEmail} • {log.targetEntity} #{log.targetId}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
