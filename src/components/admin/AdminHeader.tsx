"use client";

import React, { useEffect, useState } from "react";
import {
  Menu,
  Bell,
  AlertTriangle,
  LogOut,
  ChevronDown,
  ShieldCheck,
  RefreshCw,
  Radio,
} from "lucide-react";
import { AdminModuleId } from "./AdminSidebar";

interface AdminHeaderProps {
  activeModule: AdminModuleId;
  onOpenMobileSidebar: () => void;
  currentRole: string;
  onChangeRole: (role: string) => void;
  onEmergencyStopAll: () => Promise<void>;
  emergencyActive: boolean;
  onRefreshData: () => void;
  isRefreshing?: boolean;
}

function formatIst(now: Date): string {
  return now.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function AdminHeader({
  activeModule,
  onOpenMobileSidebar,
  currentRole,
  onChangeRole,
  onEmergencyStopAll,
  emergencyActive,
  onRefreshData,
  isRefreshing = false,
}: AdminHeaderProps) {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [showKillConfirm, setShowKillConfirm] = useState(false);
  const [killLoading, setKillLoading] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const moduleTitles: Record<AdminModuleId, string> = {
    dashboard: "Admin Dashboard",
    users: "Users Management",
    roles: "Admin Roles & Permissions",
    wallet: "Virtual Wallet Ledger",
    bots: "AI Agents",
    strategies: "Strategy Manager",
    indicators: "Indicators Library",
    "market-data": "API Monitoring",
    orders: "Trade Logs",
    portfolio: "Paper Trading",
    analytics: "Revenue Report",
    subscriptions: "Subscription Plans",
    "risk-engine": "Risk Engine",
    kyc: "KYC & Compliance",
    notifications: "Notifications",
    support: "Help & Support",
    audit: "Audit Logs",
    backup: "Backup & Restore",
    branding: "Languages & Branding",
    footer: "Footer Management",
    security: "Security Center",
    config: "System Settings",
  };

  const roles = [
    { key: "SUPER_ADMIN", label: "Super Admin (Full Access)" },
    { key: "RISK_OFFICER", label: "Risk Officer (Risk & Circuit Breakers)" },
    { key: "COMPLIANCE_MANAGER", label: "Compliance Manager (KYC & Audit)" },
    { key: "SUPPORT_EXECUTIVE", label: "Support Executive (Helpdesk)" },
  ];

  const handleKillSwitch = async () => {
    setKillLoading(true);
    try {
      await onEmergencyStopAll();
      setShowKillConfirm(false);
    } finally {
      setKillLoading(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[#101c31] bg-[#020a1f]/95 px-3 py-2.5 backdrop-blur-md sm:px-5">
        <div className="flex items-center justify-between gap-2">
          {/* Left */}
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              onClick={onOpenMobileSidebar}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#16243a] bg-[#08111f] text-slate-300 lg:hidden"
              aria-label="Toggle navigation"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-extrabold tracking-tight text-white sm:text-base">
                {moduleTitles[activeModule] || "Admin Dashboard"}
              </h1>
              <p className="hidden truncate text-[10px] text-slate-500 sm:block">
                AI Trade Master Enterprise Automation &amp; Paper Trading Controller
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400 md:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              System Online
            </span>

            <div className="hidden text-right lg:block">
              <p className="text-[9px] uppercase tracking-wider text-slate-500">Last Update</p>
              <p className="font-mono text-[10px] font-semibold text-slate-300">
                {now ? formatIst(now) : "—"}
              </p>
            </div>

            <div className="hidden items-center gap-1.5 xl:flex">
              <span className="flex items-center gap-1 rounded-lg border border-[#16243a] bg-[#08111f] px-2 py-1 text-[10px] font-semibold text-slate-300">
                <Radio className="h-3 w-3 text-emerald-400" /> Angel One
              </span>
              <span className="flex items-center gap-1 rounded-lg border border-[#16243a] bg-[#08111f] px-2 py-1 text-[10px] font-semibold text-slate-300">
                <Radio className="h-3 w-3 text-cyan-400" /> Delta Exchange
              </span>
            </div>

            <button
              onClick={onRefreshData}
              disabled={isRefreshing}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#16243a] bg-[#08111f] text-slate-300 transition hover:text-white"
              title="Refresh dashboard data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
            </button>

            <button
              onClick={() => setShowKillConfirm(true)}
              className={`flex h-9 items-center gap-1.5 rounded-xl border px-2.5 text-[10px] font-extrabold transition sm:text-xs ${
                emergencyActive
                  ? "animate-pulse border-rose-500 bg-rose-600 text-white"
                  : "border-rose-500/30 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
              <span className="hidden sm:inline">
                {emergencyActive ? "Bots Halted" : "Emergency Stop"}
              </span>
              <span className="sm:hidden">Halt</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-[#16243a] bg-[#08111f] px-2.5 text-[10px] font-semibold text-slate-200 transition sm:text-xs"
              >
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                <span className="hidden max-w-[110px] truncate font-bold text-cyan-300 sm:inline">
                  {currentRole.replace("_", " ")}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-[#1a2b47] bg-[#08111f] p-2 text-xs shadow-2xl">
                  <div className="border-b border-[#101c31] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Admin Role
                  </div>
                  <div className="space-y-1 py-1">
                    {roles.map((r) => (
                      <button
                        key={r.key}
                        onClick={() => {
                          onChangeRole(r.key);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition ${
                          currentRole === r.key
                            ? "bg-cyan-500/15 font-bold text-cyan-300"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span>{r.label}</span>
                        {currentRole === r.key && <span className="text-[10px]">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={async () => {
                try {
                  await fetch("/api/auth/logout", { method: "POST" });
                } catch (e) {
                  console.error("Logout failed", e);
                }
                localStorage.removeItem("admin_auth_session");
                window.location.reload();
              }}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-[#16243a] bg-[#08111f] px-2.5 text-xs font-semibold text-slate-300 transition hover:border-rose-500/40 hover:text-rose-300"
              title="Log out of Admin Console"
            >
              <LogOut className="h-3.5 w-3.5 text-slate-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {showKillConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-rose-500/40 bg-[#08111f] p-5 text-white shadow-2xl sm:p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/40 bg-rose-500/20 text-rose-400">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Emergency Kill-Switch Trigger</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                Are you sure you want to immediately halt all active AI trading bots across all
                demo user accounts? This will cancel pending orders and pause automated execution.
              </p>
            </div>
            <div className="rounded-xl border border-rose-800/40 bg-rose-950/40 p-3 font-mono text-[11px] text-rose-300">
              Action will be logged in Compliance Audit Logs with admin stamp.
            </div>
            <div className="flex flex-col-reverse items-stretch justify-end gap-2 pt-2 sm:flex-row sm:items-center">
              <button
                onClick={() => setShowKillConfirm(false)}
                className="rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 sm:py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleKillSwitch}
                disabled={killLoading}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 sm:py-2"
              >
                {killLoading ? "Halting..." : "Confirm Emergency Halt"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
