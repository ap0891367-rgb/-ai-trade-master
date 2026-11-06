"use client";

import React from "react";
import {
  LayoutDashboard,
  CandlestickChart,
  Bot,
  Sparkles,
  Gauge,
  Zap,
  Briefcase,
  History,
  FlaskConical,
  Layers,
  Radar,
  Settings,
  LifeBuoy,
  Crown,
  LogOut,
  X,
} from "lucide-react";

export interface MainNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: MainNavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "charts", label: "Live Charts", icon: CandlestickChart },
  { id: "agents", label: "AI Agents", icon: Bot, badge: "30" },
  { id: "astrology", label: "Astrology AI", icon: Sparkles },
  { id: "indicators", label: "28 Indicators", icon: Gauge },
  { id: "auto-trading", label: "Auto Trading", icon: Zap },
  { id: "portfolio", label: "Portfolio", icon: Briefcase },
  { id: "history", label: "Trade History", icon: History },
  { id: "backtesting", label: "Backtesting", icon: FlaskConical },
  { id: "strategies", label: "Strategies", icon: Layers },
  { id: "scanner", label: "Market Scanner", icon: Radar },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "support", label: "Help & Support", icon: LifeBuoy },
];

interface MainSidebarProps {
  active: string;
  onSelect: (id: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  user: any;
  onOpenSubscription: () => void;
  onLogout: () => void;
}

export function MainSidebar({
  active,
  onSelect,
  mobileOpen,
  onCloseMobile,
  user,
  onOpenSubscription,
  onLogout,
}: MainSidebarProps) {
  const plan = (user?.currentPlan || "PRO").toUpperCase();

  const content = (
    <div className="flex h-full flex-col bg-[#040a16]">
      {/* Brand */}
      <div className="flex h-[100px] items-center justify-center gap-2.5 border-b border-[#101c31] px-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
          <Bot className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-baseline gap-1 text-[15px] font-extrabold tracking-tight text-white">
            <span className="text-cyan-400">AI</span>
            <span>TRADE</span>
          </div>
          <div className="text-[15px] font-extrabold leading-none tracking-[0.18em] text-white">
            MASTER
          </div>
          <p className="mt-1 text-[9px] font-medium tracking-wide text-slate-500">
            Track Smart. Grow Faster
          </p>
        </div>
        <button
          onClick={onCloseMobile}
          className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="no-scrollbar flex-1 space-y-0.5 overflow-y-auto px-6 py-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`group flex w-full items-center gap-3 rounded-lg px-4 py-[10px] text-left text-[13px] font-medium transition ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-transparent text-white shadow-[inset_2px_0_0_0_#22d3ee]"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-cyan-400"
                }`}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className="rounded-md bg-blue-500/15 px-1.5 py-0.5 text-[9px] font-bold text-blue-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Plan + profile */}
      <div className="space-y-3 border-t border-[#101c31] p-4 pb-8">
        <div className="mx-auto w-[150px] rounded-xl border border-[#1b2b4a] bg-gradient-to-br from-[#0b1730] to-[#07101f] p-2.5 text-center">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-300">
              <Crown className="h-3 w-3" />
              {plan} PLAN
            </span>
            <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[8px] font-bold text-emerald-400">
              ACTIVE
            </span>
          </div>
          <p className="mt-1.5 text-[9px] text-slate-400">
            Valid Till: <span className="text-slate-200">31 Dec 2026</span>
          </p>
          <button
            onClick={onOpenSubscription}
            className="mt-2 w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 py-1.5 text-[10px] font-bold text-slate-950 transition hover:from-amber-400 hover:to-orange-400"
          >
            Upgrade Plan
          </button>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl px-4 py-1">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-bold text-white">
            {(user?.name || "Aman Patel")
              .split(" ")
              .map((n: string) => n[0])
              .slice(0, 2)
              .join("")}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#040a16] bg-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-white">
              {user?.name || "Aman Patel"}
            </p>
            <p className="text-[10px] text-emerald-400">Online</p>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[248px] border-r border-[#101c31] transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {content}
      </aside>
    </>
  );
}
