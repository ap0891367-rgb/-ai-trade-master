"use client";

import React, { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  ShieldAlert,
  AlertTriangle,
  User,
  LogOut,
  ChevronDown,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Sparkles
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

  const moduleTitles: Record<AdminModuleId, string> = {
    dashboard: "Dashboard Overview & Analytics",
    users: "User Management & Accounts",
    roles: "Admin Roles & Permissions Matrix",
    wallet: "Virtual Wallet Management & Ledger",
    bots: "AI Trading Bot Management",
    strategies: "Demo Trading Strategies (Quant Algo)",
    "market-data": "Stock Market Data Management",
    orders: "Demo Order Management Book",
    portfolio: "Portfolio & Virtual Allocation",
    analytics: "Profit and Loss Analytics",
    subscriptions: "Subscription Engine & Pricing Plans",
    "risk-engine": "Quantitative Risk Engine & Limits",
    kyc: "KYC & Compliance Management",
    notifications: "Broadcasts & Notifications",
    support: "Customer Support & Helpdesk",
    audit: "System Audit Logs & Security Trail",
    branding: "12 Languages & Branding Settings",
    security: "Security Settings & Access Policies",
    config: "Platform Configuration & Parameters",
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
      <header className="h-14 sm:h-16 bg-[#090f20]/95 backdrop-blur-md border-b border-slate-800/80 px-2.5 sm:px-4 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30">
        {/* Left: Mobile Menu Toggle & Title - SCALED FONT SIZES */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 lg:hidden shrink-0"
            aria-label="Toggle navigation"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono hidden md:inline">
                Super Admin /
              </span>
              <h1 className="text-xs sm:text-sm md:text-base font-extrabold text-white tracking-tight truncate">
                {moduleTitles[activeModule] || "Admin Dashboard"}
              </h1>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 truncate hidden xl:block">
              AI Trade Master Enterprise Automation & Paper Trading Controller
            </p>
          </div>
        </div>

        {/* Right: Actions, Role Selector, Emergency Kill Switch, Profile - COMPACT FONT */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
          {/* Refresh Data */}
          <button
            onClick={onRefreshData}
            disabled={isRefreshing}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition shrink-0"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
          </button>

          {/* Emergency Stop All Bots Button */}
          <button
            onClick={() => setShowKillConfirm(true)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border text-[10px] sm:text-xs font-extrabold transition shadow-sm ${
              emergencyActive
                ? "bg-rose-600 border-rose-500 text-white animate-pulse shadow-rose-600/30"
                : "bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/30 text-rose-300 hover:text-rose-200"
            }`}
          >
            <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400 shrink-0" />
            <span className="hidden sm:inline">
              {emergencyActive ? "Bots Halted" : "Emergency Stop"}
            </span>
            <span className="inline sm:hidden">Halt</span>
          </button>

          {/* Role Switcher Simulator */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-[10px] sm:text-xs font-semibold text-slate-200 transition"
            >
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 shrink-0" />
              <span className="text-cyan-300 font-bold max-w-[80px] sm:max-w-[110px] truncate">
                {currentRole.replace("_", " ")}
              </span>
              <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0d1630] border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Switch Admin Role
                </div>
                <div className="py-1 space-y-1">
                  {roles.map((r) => (
                    <button
                      key={r.key}
                      onClick={() => {
                        onChangeRole(r.key);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                        currentRole === r.key
                          ? "bg-blue-600 text-white font-bold"
                          : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
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

          {/* Admin Sign Out */}
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 hover:border-rose-500/50 border border-slate-700/80 text-slate-300 hover:text-rose-300 text-xs font-semibold transition"
            title="Log out of Admin Console"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Emergency Stop All Modal Confirmation */}
      {showKillConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-rose-500/40 rounded-2xl w-full max-w-md p-6 text-white shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Emergency Kill-Switch Trigger</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Are you sure you want to immediately halt all active AI trading bots across all demo user accounts? This will cancel pending orders and pause automated execution.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-[11px] text-rose-300 font-mono">
              Action will be logged in Compliance Audit Logs with admin stamp.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowKillConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleKillSwitch}
                disabled={killLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
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
