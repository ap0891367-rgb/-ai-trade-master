"use client";

import React, { useMemo } from "react";
import {
  Users,
  ListOrdered,
  TrendingUp,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  Radio,
  Activity,
  UserPlus,
  Download,
  RefreshCw,
  ShieldCheck,
  Bell,
  Settings,
  CheckCircle2,
  Cpu,
  Zap,
  Database,
} from "lucide-react";
import { AdminModuleId } from "../AdminSidebar";

interface OverviewModuleProps {
  kpis: any;
  providers: any[];
  recentAuditLogs: any[];
  recentOrders: any[];
  recentUsers?: any[];
  recentTrades?: any[];
  topBots: any[];
  onNavigate: (module: AdminModuleId) => void;
  onEmergencyStopAll: () => void;
}

function money(value: number, decimals = 0): string {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function minutesAgo(value: any): string {
  if (!value) return "—";
  const diff = Math.max(0, Date.now() - new Date(value).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function AreaSpark({
  points,
  color = "#22d3ee",
  height = 56,
}: {
  points: number[];
  color?: string;
  height?: number;
}) {
  const width = 200;
  const safe = points.length > 1 ? points : [1, 1.02, 1];
  const min = Math.min(...safe);
  const max = Math.max(...safe);
  const span = max - min || 1;
  const path = safe
    .map((value, index) => {
      const x = (index / (safe.length - 1)) * width;
      const y = height - 3 - ((value - min) / span) * (height - 8);
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <path d={`${path} L${width},${height} L0,${height} Z`} fill={color} opacity="0.12" />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Donut({ value, color, label }: { value: number; color: string; label: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
      style={{ background: `conic-gradient(${color} ${pct}%, #16243a ${pct}% 100%)` }}
    >
      <div className="flex h-[52px] w-[52px] flex-col items-center justify-center rounded-full bg-[#07101f]">
        <span className="font-mono text-[13px] font-extrabold leading-none text-white">{pct}%</span>
        <span className="mt-0.5 text-[8px] text-slate-500">{label}</span>
      </div>
    </div>
  );
}

export function OverviewModule({
  kpis,
  providers,
  recentAuditLogs,
  recentOrders,
  recentUsers = [],
  recentTrades = [],
  topBots,
  onNavigate,
  onEmergencyStopAll,
}: OverviewModuleProps) {
  const totalUsers = Number(kpis?.totalUsers || 0);
  const totalTrades = Number(kpis?.totalOrders || 0) + Number(kpis?.openTrades || 0) + Number(kpis?.closedTrades || 0);
  const totalRevenue = Number(kpis?.totalRevenue || 0);
  const winRate = Number(kpis?.winRate ?? kpis?.averageWinRate ?? 0);

  const analyticsSeries = useMemo(() => {
    const base = Math.max(10, totalTrades || 20);
    return Array.from({ length: 22 }, (_, index) => {
      const wave = Math.sin(index / 3.2) * 12 + Math.cos(index / 1.7) * 6;
      return base + index * 3 + wave;
    });
  }, [totalTrades]);

  const statCards = [
    {
      title: "Total Users",
      value: money(totalUsers),
      change: "+12.4%",
      up: true,
      icon: Users,
      color: "#22d3ee",
      moduleId: "users" as AdminModuleId,
    },
    {
      title: "Total Trades",
      value: money(totalTrades),
      change: "+8.2%",
      up: true,
      icon: ListOrdered,
      color: "#a78bfa",
      moduleId: "orders" as AdminModuleId,
    },
    {
      title: "Total Revenue",
      value: `₹${money(totalRevenue)}`,
      change: "+16.8%",
      up: true,
      icon: TrendingUp,
      color: "#34d399",
      moduleId: "analytics" as AdminModuleId,
    },
    {
      title: "Win Rate",
      value: `${winRate.toFixed(1)}%`,
      change: "+2.3%",
      up: true,
      icon: Target,
      color: "#fbbf24",
      moduleId: "analytics" as AdminModuleId,
    },
  ];

  const agents = [
    { name: "Master AI Agent", value: 94.2, color: "#22d3ee", trades: 1248, status: "Active" },
    { name: "Astrology AI Agent", value: 92.7, color: "#a78bfa", trades: 986, status: "Active" },
    { name: "Indicators AI Agent", value: 98.9, color: "#34d399", trades: 1520, status: "Active" },
  ];

  const apiProviders = providers.length
    ? providers.slice(0, 4)
    : [
        { id: "a", providerName: "Angel One", exchange: "NSE", latencyMs: 12, status: "CONNECTED" },
        { id: "b", providerName: "Delta Exchange", exchange: "Crypto", latencyMs: 18, status: "CONNECTED" },
        { id: "c", providerName: "Yahoo Finance", exchange: "Global", latencyMs: 24, status: "CONNECTED" },
        { id: "d", providerName: "Forex Feed", exchange: "FX", latencyMs: 15, status: "CONNECTED" },
      ];

  return (
    <div className="space-y-3">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.title}
              onClick={() => onNavigate(card.moduleId)}
              className="min-w-0 rounded-xl border border-[#13233c] bg-gradient-to-br from-[#081321] to-[#060d18] px-3.5 py-3 text-left transition hover:border-[#234066]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {card.title}
                  </p>
                  <p className="mt-1 truncate font-mono text-xl font-extrabold text-white">
                    {card.value}
                  </p>
                </div>
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${card.color}1f`, color: card.color }}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span
                  className={`flex items-center gap-0.5 text-[10px] font-bold ${
                    card.up ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {card.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {card.change}
                </span>
                <span className="text-[9px] text-slate-500">vs last month</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Analytics + agents */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="rounded-2xl border border-[#13233c] bg-[#07101f] p-4 xl:col-span-8">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Analytics Overview</h3>
              <p className="text-[10px] text-slate-500">Trading volume &amp; revenue performance</p>
            </div>
            <div className="flex items-center gap-1">
              {["1D", "1W", "1M", "1Y"].map((range, index) => (
                <button
                  key={range}
                  className={`rounded-md px-2 py-1 text-[10px] font-bold transition ${
                    index === 2
                      ? "bg-cyan-500/15 text-cyan-300"
                      : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <AreaSpark points={analyticsSeries} color="#22d3ee" height={170} />
          <div className="mt-2 flex items-center justify-between border-t border-[#101c31] pt-2 text-[10px] text-slate-500">
            <span>Jan</span>
            <span>Mar</span>
            <span>May</span>
            <span>Jul</span>
            <span>Sep</span>
            <span>Nov</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Trades
              <b className="font-mono text-slate-200">{money(totalTrades)}</b>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Revenue
              <b className="font-mono text-slate-200">₹{money(totalRevenue)}</b>
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" /> Users
              <b className="font-mono text-slate-200">{money(totalUsers)}</b>
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#13233c] bg-[#07101f] p-4 xl:col-span-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-white">
              <Bot className="h-4 w-4 text-cyan-400" /> AI Agents Status
            </h3>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
              3 ACTIVE
            </span>
          </div>
          <div className="space-y-3">
            {agents.map((agent) => (
              <div key={agent.name} className="flex items-center gap-3">
                <Donut value={agent.value} color={agent.color} label="acc" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-white">{agent.name}</p>
                  <p className="text-[10px] text-slate-500">
                    {money(agent.trades)} signals · {agent.status}
                  </p>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-[#13233c]">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${agent.value}%`, backgroundColor: agent.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => onNavigate("bots")}
            className="mt-3 w-full rounded-lg border border-[#1a2b47] bg-[#08111f] py-1.5 text-[10px] font-bold text-cyan-300 transition hover:border-cyan-500/40"
          >
            Manage AI Agents →
          </button>
        </div>
      </div>

      {/* Users + trades */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#13233c] bg-[#07101f] p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-white">
              <Users className="h-4 w-4 text-cyan-400" /> User Management
            </h3>
            <button
              onClick={() => onNavigate("users")}
              className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300"
            >
              View All →
            </button>
          </div>
          <div className="grid grid-cols-[1fr_64px_58px] gap-2 border-b border-[#101c31] pb-1 text-[9px] uppercase tracking-wide text-slate-500">
            <span>User</span>
            <span className="text-right">Wallet</span>
            <span className="text-right">Status</span>
          </div>
          <div className="divide-y divide-[#0d1829]">
            {(recentUsers.length
              ? recentUsers
              : [
                  { id: 1, name: "Aman Patel", email: "aman@demo.ai", walletBalance: 524000, status: "ACTIVE" },
                  { id: 2, name: "Priya Sharma", email: "priya@demo.ai", walletBalance: 481500, status: "ACTIVE" },
                  { id: 3, name: "Rahul Verma", email: "rahul@demo.ai", walletBalance: 362000, status: "ACTIVE" },
                  { id: 4, name: "Neha Singh", email: "neha@demo.ai", walletBalance: 298500, status: "ACTIVE" },
                  { id: 5, name: "Vikram Rao", email: "vikram@demo.ai", walletBalance: 215400, status: "PENDING" },
                ]
            ).map((user: any) => (
              <div key={user.id} className="grid grid-cols-[1fr_64px_58px] items-center gap-2 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-[9px] font-bold text-white">
                    {String(user.name || "U")
                      .split(" ")
                      .map((part: string) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold text-slate-200">{user.name}</p>
                    <p className="truncate text-[9px] text-slate-500">{user.email}</p>
                  </div>
                </div>
                <span className="text-right font-mono text-[10px] font-bold text-slate-200">
                  ₹{money(Number(user.walletBalance || 0) / 1000)}K
                </span>
                <span
                  className={`text-right text-[9px] font-bold ${
                    user.status === "ACTIVE" ? "text-emerald-400" : "text-amber-300"
                  }`}
                >
                  {user.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#13233c] bg-[#07101f] p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-white">
              <ListOrdered className="h-4 w-4 text-violet-400" /> Trade Logs
            </h3>
            <button
              onClick={() => onNavigate("orders")}
              className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300"
            >
              View All →
            </button>
          </div>
          <div className="grid grid-cols-[58px_1fr_48px_62px] gap-2 border-b border-[#101c31] pb-1 text-[9px] uppercase tracking-wide text-slate-500">
            <span>Symbol</span>
            <span>User</span>
            <span>Side</span>
            <span className="text-right">P&amp;L</span>
          </div>
          <div className="divide-y divide-[#0d1829]">
            {(recentTrades.length
              ? recentTrades
              : [
                  { id: 1, symbol: "RELIANCE", side: "BUY", pnl: 892.5, userId: 1 },
                  { id: 2, symbol: "TCS", side: "SELL", pnl: 620.3, userId: 2 },
                  { id: 3, symbol: "INFY", side: "BUY", pnl: 710.2, userId: 3 },
                  { id: 4, symbol: "HDFCBANK", side: "SELL", pnl: -180.4, userId: 4 },
                  { id: 5, symbol: "SBIN", side: "BUY", pnl: 530.75, userId: 5 },
                ]
            ).map((trade: any) => (
              <div key={trade.id} className="grid grid-cols-[58px_1fr_48px_62px] items-center gap-2 py-2 text-[10px]">
                <span className="truncate font-bold text-slate-200">{trade.symbol}</span>
                <span className="truncate text-slate-500">User #{trade.userId}</span>
                <span className={`text-[9px] font-bold ${trade.side === "BUY" ? "text-emerald-400" : "text-rose-400"}`}>
                  {trade.side}
                </span>
                <span
                  className={`text-right font-mono font-bold ${
                    Number(trade.pnl) >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {Number(trade.pnl) >= 0 ? "+" : ""}₹{money(Math.abs(Number(trade.pnl || 0)), 2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue + quick actions + performance */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-12">
        <div className="rounded-2xl border border-[#13233c] bg-[#07101f] p-4 xl:col-span-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-white">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> Revenue Overview
            </h3>
            <span className="text-[9px] font-bold text-emerald-400">+16.8%</span>
          </div>
          <p className="font-mono text-xl font-extrabold text-white">₹{money(totalRevenue)}</p>
          <p className="text-[10px] text-slate-500">Total subscription revenue</p>
          <div className="mt-2">
            <AreaSpark points={analyticsSeries.map((value) => value * 0.42)} color="#34d399" height={64} />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#101c31] pt-2 text-[10px]">
            <div>
              <p className="text-slate-500">This Month</p>
              <p className="font-mono font-bold text-slate-200">₹{money(totalRevenue * 0.18)}</p>
            </div>
            <div>
              <p className="text-slate-500">Pending</p>
              <p className="font-mono font-bold text-amber-300">₹{money(totalRevenue * 0.05)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#13233c] bg-[#07101f] p-4 xl:col-span-4">
          <h3 className="mb-3 text-sm font-bold text-white">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Add User", icon: UserPlus, id: "users" as AdminModuleId, color: "#22d3ee" },
              { label: "Export Report", icon: Download, id: "analytics" as AdminModuleId, color: "#34d399" },
              { label: "Refresh Data", icon: RefreshCw, id: "market-data" as AdminModuleId, color: "#a78bfa" },
              { label: "Security", icon: ShieldCheck, id: "security" as AdminModuleId, color: "#fbbf24" },
              { label: "Notifications", icon: Bell, id: "notifications" as AdminModuleId, color: "#fb7185" },
              { label: "Settings", icon: Settings, id: "config" as AdminModuleId, color: "#38bdf8" },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => onNavigate(action.id)}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-[#13233c] bg-[#060d19] px-2 py-3 text-[10px] font-semibold text-slate-300 transition hover:border-[#234066] hover:text-white"
                >
                  <Icon className="h-4 w-4" style={{ color: action.color }} />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-[#13233c] bg-[#07101f] p-4 md:col-span-2 xl:col-span-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-white">
              <Cpu className="h-4 w-4 text-amber-400" /> System Performance
            </h3>
            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> HEALTHY
            </span>
          </div>
          <div className="space-y-2.5">
            {[
              { label: "CPU Usage", value: 42, color: "#22d3ee" },
              { label: "Memory", value: 68, color: "#a78bfa" },
              { label: "Database", value: 54, color: "#34d399" },
              { label: "API Latency", value: 24, color: "#fbbf24" },
            ].map((metric) => (
              <div key={metric.label}>
                <div className="mb-1 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">{metric.label}</span>
                  <span className="font-mono font-bold" style={{ color: metric.color }}>
                    {metric.value}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#13233c]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${metric.value}%`, backgroundColor: metric.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={onEmergencyStopAll}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 py-1.5 text-[10px] font-bold text-rose-300 transition hover:bg-rose-500/20"
          >
            <Zap className="h-3 w-3" /> Emergency Stop All Bots
          </button>
        </div>
      </div>

      {/* API + recent activity */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="rounded-2xl border border-[#13233c] bg-[#07101f] p-4 xl:col-span-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-white">
              <Radio className="h-4 w-4 text-emerald-400" /> API Connection Status
            </h3>
            <button
              onClick={() => onNavigate("market-data")}
              className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Details →
            </button>
          </div>
          <div className="space-y-2">
            {apiProviders.map((provider: any) => (
              <div
                key={provider.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-[#13233c] bg-[#060d19] px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Database className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold text-slate-200">
                      {provider.providerName}
                    </p>
                    <p className="text-[9px] text-slate-500">{provider.exchange}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-mono text-[9px] text-slate-400">{provider.latencyMs}ms</span>
                  <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Connected
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#13233c] bg-[#07101f] p-4 xl:col-span-7">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-white">
              <Activity className="h-4 w-4 text-cyan-400" /> Recent Activities
            </h3>
            <button
              onClick={() => onNavigate("audit")}
              className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Full Trail →
            </button>
          </div>
          <div className="space-y-2">
            {(recentAuditLogs.length
              ? recentAuditLogs.slice(0, 4)
              : [
                  { id: 1, action: "User login verified", adminEmail: "system", createdAt: new Date() },
                  { id: 2, action: "Bot strategy deployed", adminEmail: "admin@autotrading.ai", createdAt: new Date() },
                  { id: 3, action: "Auto-scan cycle completed", adminEmail: "system", createdAt: new Date() },
                  { id: 4, action: "Wallet ledger reconciled", adminEmail: "system", createdAt: new Date() },
                ]
            ).map((log: any) => (
              <div key={log.id} className="flex items-start gap-2.5 rounded-xl border border-[#13233c] bg-[#060d19] px-3 py-2">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-slate-200">{log.action}</p>
                  <p className="truncate text-[9px] text-slate-500">{log.adminEmail || "system"}</p>
                </div>
                <span className="shrink-0 text-[9px] text-slate-500">{minutesAgo(log.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
