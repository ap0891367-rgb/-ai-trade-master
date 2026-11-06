"use client";

import React from "react";
import {
  LayoutDashboard,
  Users,
  Activity,
  ListOrdered,
  Briefcase,
  Cpu,
  Bot,
  Gauge,
  CreditCard,
  TrendingUp,
  Settings,
  ShieldCheck,
  DatabaseBackup,
  Bell,
  LifeBuoy,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  LogOut,
  Crown,
  PanelBottom,
  X,
} from "lucide-react";

export type AdminModuleId =
  | "dashboard"
  | "users"
  | "roles"
  | "wallet"
  | "bots"
  | "strategies"
  | "indicators"
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
  | "backup"
  | "branding"
  | "footer"
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
}

export function AdminSidebar({
  activeModule,
  onSelectModule,
  collapsed,
  onToggleCollapsed,
  isMobileOpen,
  onCloseMobile,
  openTicketsCount = 0,
  emergencyActive = false,
}: AdminSidebarProps) {
  const navItems: NavItem[] = [
    { id: "dashboard", label: "Admin Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users Management", icon: Users },
    { id: "market-data", label: "API Monitoring", icon: Activity },
    { id: "orders", label: "Trade Logs", icon: ListOrdered },
    { id: "portfolio", label: "Paper Trading", icon: Briefcase },
    { id: "strategies", label: "Strategy Manager", icon: Cpu },
    {
      id: "bots",
      label: "AI Agents",
      icon: Bot,
      badge: "30",
      badgeColor: "bg-cyan-500/15 text-cyan-300",
    },
    { id: "indicators", label: "Indicators Library", icon: Gauge },
    { id: "subscriptions", label: "Subscription Plans", icon: CreditCard },
    { id: "analytics", label: "Revenue Report", icon: TrendingUp },
    { id: "footer", label: "Footer Management", icon: PanelBottom },
    { id: "config", label: "System Settings", icon: Settings },
    { id: "security", label: "Security Center", icon: ShieldCheck },
    { id: "backup", label: "Backup & Restore", icon: DatabaseBackup },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      badge: openTicketsCount > 0 ? openTicketsCount : undefined,
      badgeColor: "bg-rose-500/15 text-rose-300",
    },
    { id: "support", label: "Help & Support", icon: LifeBuoy },
  ];

  const handleSelect = (id: AdminModuleId) => {
    onSelectModule(id);
    onCloseMobile();
  };

  return (
    <>
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full flex-col border-r border-[#101c31] bg-[#030a1c] transition-all duration-300 ${
          collapsed ? "w-[72px]" : "w-[240px]"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand */}
        <div className="flex h-[88px] items-center justify-center gap-2.5 border-b border-[#101c31] px-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <Bot className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-baseline gap-1 text-[15px] font-extrabold tracking-tight text-white">
                <span className="text-cyan-400">AI</span>
                <span>TRADE</span>
              </div>
              <div className="text-[15px] font-extrabold leading-none tracking-[0.18em] text-white">
                MASTER
              </div>
              <p className="mt-1 text-[9px] font-medium tracking-wide text-slate-500">
                Enterprise Control Center
              </p>
            </div>
          )}
          <button
            onClick={onCloseMobile}
            className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {emergencyActive && !collapsed && (
          <div className="mx-3 mt-3 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/15 p-2.5 text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0 animate-pulse text-rose-400" />
            <div className="text-[11px] font-semibold leading-tight">
              Emergency Kill-Switch Active. All bots halted.
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="no-scrollbar flex-1 space-y-0.5 overflow-y-auto px-5 pt-2 pb-3">
          {!collapsed && (
            <p className="mb-1 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">
              Administration
            </p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                title={collapsed ? item.label : undefined}
                className={`group flex w-full items-center gap-3 rounded-lg px-4 py-[8px] text-left text-[13px] font-medium transition ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-transparent text-white shadow-[inset_2px_0_0_0_#22d3ee]"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
                } ${collapsed ? "justify-center px-0" : ""}`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-cyan-400"
                  }`}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                          isActive ? "bg-white/15 text-white" : item.badgeColor || "bg-slate-800 text-slate-300"
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
        </nav>

        {/* Footer */}
        <div className="space-y-6 border-t border-[#101c31] p-3 pb-8">
          {!collapsed && (
            <div className="rounded-xl border border-[#1b2b4a] bg-gradient-to-br from-[#0b1730] to-[#07101f] p-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                  <Crown className="h-3.5 w-3.5" />
                  PRO PLAN
                </span>
                <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">
                  ACTIVE
                </span>
              </div>
              <p className="mt-1.5 text-[10px] text-slate-400">
                Valid Till: <span className="text-slate-200">31 Dec 2026</span>
              </p>
            </div>
          )}

          <div className={`flex items-center gap-2.5 rounded-xl px-1 py-1 ${collapsed ? "justify-center" : ""}`}>
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-bold text-white">
              AP
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#030a1c] bg-emerald-400" />
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-white">Admin Patel</p>
                  <p className="text-[10px] text-emerald-400">Super Admin</p>
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
                  title="Logout"
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        <button
          onClick={onToggleCollapsed}
          className="absolute -right-3 top-24 hidden h-6 w-6 items-center justify-center rounded-full border border-[#1b2b4a] bg-[#08111f] text-slate-400 transition hover:text-white lg:flex"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>
    </>
  );
}
