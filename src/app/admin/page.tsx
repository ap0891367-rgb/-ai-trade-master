"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar, AdminModuleId } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye,
  EyeOff
} from "lucide-react";

// Admin Modules
import { OverviewModule } from "@/components/admin/modules/OverviewModule";
import { UsersModule } from "@/components/admin/modules/UsersModule";
import { RolesModule } from "@/components/admin/modules/RolesModule";
import { WalletModule } from "@/components/admin/modules/WalletModule";
import { BotsModule } from "@/components/admin/modules/BotsModule";
import { StrategiesModule } from "@/components/admin/modules/StrategiesModule";
import { MarketDataModule } from "@/components/admin/modules/MarketDataModule";
import { OrdersModule } from "@/components/admin/modules/OrdersModule";
import { PortfolioModule } from "@/components/admin/modules/PortfolioModule";
import { PnlAnalyticsModule } from "@/components/admin/modules/PnlAnalyticsModule";
import { KycModule } from "@/components/admin/modules/KycModule";
import { NotificationsModule } from "@/components/admin/modules/NotificationsModule";
import { SupportModule } from "@/components/admin/modules/SupportModule";
import { AuditLogsModule } from "@/components/admin/modules/AuditLogsModule";
import { SecurityModule } from "@/components/admin/modules/SecurityModule";
import { PlatformConfigModule } from "@/components/admin/modules/PlatformConfigModule";
import { SubscriptionEngineModule } from "@/components/admin/modules/SubscriptionEngineModule";
import { LanguageBrandingModule } from "@/components/admin/modules/LanguageBrandingModule";
import { RiskEngineModule } from "@/components/admin/modules/RiskEngineModule";

const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "RISK_OFFICER",
  "COMPLIANCE_MANAGER",
  "SUPPORT_EXECUTIVE",
];

export default function AdminDashboardPage() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Admin Login Form State
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Admin Dashboard State
  const [activeModule, setActiveModule] = useState<AdminModuleId>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState("SUPER_ADMIN");
  const [emergencyActive, setEmergencyActive] = useState(false);

  // Overview Data State
  const [overviewData, setOverviewData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          const role = data.user?.role;
          if (data.user && ADMIN_ROLES.includes(role)) {
            const authObj = {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              role,
            };
            setAdminUser(authObj);
            setCurrentRole(role);
            localStorage.setItem("admin_auth_session", JSON.stringify(authObj));
            setIsAdminAuthenticated(true);
          } else {
            localStorage.removeItem("admin_auth_session");
          }
        } else {
          localStorage.removeItem("admin_auth_session");
        }
      } catch (e) {
        console.error("Admin session check failed", e);
      } finally {
        setSessionChecked(true);
      }
    };

    checkSession();
  }, []);

  const fetchOverview = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/overview");
      const data = await res.json();
      if (data.success) {
        setOverviewData(data);
        if (data.kpis?.emergencyStoppedBots > 0) {
          setEmergencyActive(true);
        }
      }
    } catch (e) {
      console.error("Failed to fetch admin overview", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchOverview();
    }
  }, [isAdminAuthenticated]);

  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail.trim(), password: adminPassword.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid administrator credentials");
      }

      if (!ADMIN_ROLES.includes(data.user?.role)) {
        await fetch("/api/auth/logout", { method: "POST" });
        throw new Error("This account does not have administrator access.");
      }

      const authObj = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      };

      setAdminUser(authObj);
      setCurrentRole(authObj.role);
      localStorage.setItem("admin_auth_session", JSON.stringify(authObj));
      setIsAdminAuthenticated(true);
    } catch (err: any) {
      setLoginError(err.message || "Failed to authenticate administrator");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleEmergencyStopAll = async () => {
    try {
      const res = await fetch("/api/admin/bots", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "EMERGENCY_STOP_ALL" }),
      });
      const data = await res.json();
      if (data.success) {
        setEmergencyActive(true);
        fetchOverview();
      }
    } catch (e) {
      console.error("Emergency halt failed", e);
    }
  };

  // Verifying the server session before showing the login gate.
  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-[#070b19] flex items-center justify-center text-slate-400 text-sm font-mono">
        Verifying administrator session…
      </div>
    );
  }

  // IF NOT AUTHENTICATED: DISPLAY DEDICATED ADMIN LOGIN GATE
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070b19] flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
        <div className="w-full max-w-md bg-[#0d1630] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/25">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                AI Trade Master Super Admin
              </h2>
              <p className="text-xs text-slate-400">
                Enterprise Automation & Compliance Control Center
              </p>
            </div>
            <span className="inline-block text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-mono font-bold border border-blue-500/30">
              RESTRICTED ADMINISTRATIVE ACCESS
            </span>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold">
              {loginError}
            </div>
          )}

          {/* Removed: quick 1-click admin login and pre-filled credentials. */}

          <form onSubmit={handleAdminLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Admin Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-blue-600/30 mt-2"
            >
              <span>{loginLoading ? "Verifying Authority..." : "Sign In to Super Admin Console"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // IF AUTHENTICATED: DISPLAY FULL 19-MODULE ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-[#050b16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      <AdminSidebar
        activeModule={activeModule}
        onSelectModule={(id) => setActiveModule(id)}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed(!collapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        openTicketsCount={overviewData?.kpis?.openTickets || 0}
        emergencyActive={emergencyActive}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? "lg:ml-[72px]" : "lg:ml-[240px]"
        }`}
      >
        <AdminHeader
          activeModule={activeModule}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
          currentRole={currentRole}
          onChangeRole={(role) => setCurrentRole(role)}
          onEmergencyStopAll={handleEmergencyStopAll}
          emergencyActive={emergencyActive}
          onRefreshData={fetchOverview}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 w-full space-y-3 p-3 sm:p-5">
          {activeModule === "dashboard" && (
            <OverviewModule
              kpis={overviewData?.kpis}
              providers={overviewData?.providers || []}
              recentAuditLogs={overviewData?.recentAuditLogs || []}
              recentOrders={overviewData?.recentOrders || []}
              recentUsers={overviewData?.recentUsers || []}
              recentTrades={overviewData?.recentTrades || []}
              topBots={overviewData?.topBots || []}
              onNavigate={(mod) => setActiveModule(mod)}
              onEmergencyStopAll={handleEmergencyStopAll}
            />
          )}

          {activeModule === "users" && <UsersModule />}
          {activeModule === "roles" && <RolesModule />}
          {activeModule === "wallet" && <WalletModule />}
          {activeModule === "bots" && <BotsModule />}
          {activeModule === "strategies" && <StrategiesModule />}
          {activeModule === "indicators" && <MarketDataModule />}
          {activeModule === "market-data" && <MarketDataModule />}
          {activeModule === "orders" && <OrdersModule />}
          {activeModule === "portfolio" && <PortfolioModule />}
          {activeModule === "analytics" && <PnlAnalyticsModule />}
          {activeModule === "subscriptions" && <SubscriptionEngineModule />}
          {activeModule === "risk-engine" && <RiskEngineModule />}
          {activeModule === "kyc" && <KycModule />}
          {activeModule === "notifications" && <NotificationsModule />}
          {activeModule === "support" && <SupportModule />}
          {activeModule === "audit" && <AuditLogsModule />}
          {activeModule === "backup" && <AuditLogsModule />}
          {activeModule === "branding" && <LanguageBrandingModule />}
          {activeModule === "security" && <SecurityModule />}
          {activeModule === "config" && <PlatformConfigModule />}
        </main>

        <footer className="border-t border-slate-800/80 bg-[#090f20] py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <strong className="text-slate-400">AI Trade Master Enterprise Super Admin</strong> • Multi-Agent Automation Architecture
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            SEBI Paper-Trading Simulator Engine • All 33 Database Tables Connected
          </div>
        </footer>
      </div>
    </div>
  );
}
