"use client";

import React from "react";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Wallet,
  Bot,
  Cpu,
  BarChart2,
  ListOrdered,
  Briefcase,
  TrendingUp,
  FileCheck2,
  Bell,
  Headphones,
  ScrollText,
  Lock,
  Settings,
  DollarSign,
  Globe,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from "lucide-react";

export type AdminModuleId =
  | "dashboard"
  | "users"
  | "roles"
  | "wallet"
  | "bots"
  | "strategies"
  | "market-data"
  | "orders"
  | "portfolio"
  | "analytics"
  | "subscriptions"
  | "risk-engine"
  | "kyc"
  | "notifications"
  | "support"
  | "audit"
  | "branding"
  | "security"
  | "config";

interface AdminSidebarProps {
  activeModule: AdminModuleId;
  onSelectModule: (moduleId: AdminModuleId) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  openTicketsCount?: number;
  pendingKycCount?: number;
  emergencyActive?: boolean;
}

interface NavItem {
  id: AdminModuleId;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  category: "core" | "trading" | "monetization" | "governance" | "system";
}

export function AdminSidebar({
  activeModule,
  onSelectModule,
  collapsed,
  onToggleCollapsed,
  isMobileOpen,
  onCloseMobile,
  openTicketsCount = 0,
  pendingKycCount = 0,
  emergencyActive = false,
}: AdminSidebarProps) {
  const navItems: NavItem[] = [
    // Core Management
    { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard, category: "core" },
    { id: "users", label: "User Management", icon: Users, category: "core" },
    { id: "roles", label: "Admin Roles & Permissions", icon: ShieldCheck, category: "core" },
    { id: "wallet", label: "Virtual Wallet Ledger", icon: Wallet, category: "core" },

    // Trading Automation & Analytics
    { id: "bots", label: "AI Trading Bot Engine", icon: Bot, badge: "10-Agent", badgeColor: "bg-blue-500/20 text-blue-300", category: "trading" },
    { id: "strategies", label: "Demo Strategies (Algo)", icon: Cpu, category: "trading" },
    { id: "market-data", label: "Market Data (NSE/Delta)", icon: BarChart2, category: "trading" },
    { id: "orders", label: "Demo Order Book", icon: ListOrdered, category: "trading" },
    { id: "portfolio", label: "Virtual Portfolios", icon: Briefcase, category: "trading" },
    { id: "analytics", label: "P&L Analytics & Metrics", icon: TrendingUp, category: "trading" },

    // Monetization & Risk
    { id: "subscriptions", label: "Subscription Engine (SaaS)", icon: DollarSign, badge: "₹ Plans", badgeColor: "bg-emerald-500/20 text-emerald-300", category: "monetization" },
    { id: "risk-engine", label: "Risk Engine & Drawdown", icon: ShieldAlert, category: "monetization" },

    // Governance & Compliance
    { id: "kyc", label: "KYC & Compliance", icon: FileCheck2, badge: pendingKycCount > 0 ? pendingKycCount : undefined, badgeColor: "bg-amber-500/20 text-amber-300", category: "governance" },
    { id: "notifications", label: "Broadcasts & Alerts", icon: Bell, category: "governance" },
    { id: "support", label: "Customer Support Desk", icon: Headphones, badge: openTicketsCount > 0 ? openTicketsCount : undefined, badgeColor: "bg-rose-500/20 text-rose-300", category: "governance" },
    { id: "audit", label: "Audit Logs & Trail", icon: ScrollText, category: "governance" },

    // System & Branding
    { id: "branding", label: "12 Languages & Branding", icon: Globe, category: "system" },
    { id: "security", label: "Security & Access", icon: Lock, category: "system" },
    { id: "config", label: "Platform Configuration", icon: Settings, category: "system" },
  ];

  const categories = [
    { key: "core", title: "OVERVIEW & USERS" },
    { key: "trading", title: "TRADING & AUTOMATION" },
    { key: "monetization", title: "SAAS & RISK ENGINE" },
    { key: "governance", title: "GOVERNANCE & SUPPORT" },
    { key: "system", title: "LOCALIZATION & SETTINGS" },
  ];

  const handleSelect = (id: AdminModuleId) => {
    onSelectModule(id);
    onCloseMobile();
  };

  return (
    <>
      {isMobileOpen && (
        <div onClick={onCloseMobile} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0b1329] border-r border-slate-800/80 transition-all duration-300 ease-in-out ${
          collapsed ? "w-20" : "w-72"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-[#090f20]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <div className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
                  <span>AI TRADE MASTER</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                    SUPER ADMIN
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  Enterprise Control Center
                </p>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapsed}
            className="hidden lg:flex p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {emergencyActive && !collapsed && (
          <div className="mx-3 mt-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
            <div className="text-[11px] font-semibold leading-tight">
              Emergency Kill-Switch Active. All bots halted.
            </div>
          </div>
        )}

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 no-scrollbar">
          {categories.map((cat) => {
            const items = navItems.filter((item) => item.category === cat.key);
            return (
              <div key={cat.key} className="space-y-1">
                {!collapsed && (
                  <div className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                    {cat.title}
                  </div>
                )}
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      } ${collapsed ? "justify-center px-0" : ""}`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isActive ? "text-white" : "text-slate-400 group-hover:text-cyan-400"
                        }`}
                      />
                      {!collapsed && (
                        <>
                          <span className="truncate flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold shrink-0 ${
                                isActive ? "bg-white/20 text-white" : item.badgeColor || "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-[#090f20]">
          {!collapsed ? (
            <div className="space-y-1.5">
              <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-mono text-slate-300">SEBI Paper-Trading</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-300">v3.2</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-2 text-emerald-400" title="Paper Trading Mode">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
