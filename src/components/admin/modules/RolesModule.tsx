"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Users,
  Bot,
  Wallet,
  Settings,
  FileCheck2,
  Bell,
  Sparkles,
  Info
} from "lucide-react";

interface PermissionRow {
  permission: string;
  category: string;
  description: string;
  superAdmin: boolean;
  riskOfficer: boolean;
  complianceManager: boolean;
  supportExecutive: boolean;
}

export function RolesModule() {
  const [selectedRole, setSelectedRole] = useState<string>("SUPER_ADMIN");
  const [feedback, setFeedback] = useState<string | null>(null);

  const [permissions, setPermissions] = useState<PermissionRow[]>([
    {
      permission: "user:create_edit",
      category: "User Management",
      description: "Create, suspend, lock, or modify user account records",
      superAdmin: true,
      riskOfficer: false,
      complianceManager: false,
      supportExecutive: true,
    },
    {
      permission: "wallet:adjust_balance",
      category: "Wallet Management",
      description: "Perform manual credit/debit adjustments on virtual ledger",
      superAdmin: true,
      riskOfficer: true,
      complianceManager: false,
      supportExecutive: false,
    },
    {
      permission: "bot:emergency_stop",
      category: "Trading Engine",
      description: "Trigger emergency platform-wide or individual bot halts",
      superAdmin: true,
      riskOfficer: true,
      complianceManager: false,
      supportExecutive: false,
    },
    {
      permission: "bot:parameter_tune",
      category: "Trading Engine",
      description: "Adjust strategy allocation, TP%, SL%, and max loss caps",
      superAdmin: true,
      riskOfficer: true,
      complianceManager: false,
      supportExecutive: false,
    },
    {
      permission: "kyc:verify_documents",
      category: "Compliance",
      description: "Approve or reject customer compliance & SEBI consents",
      superAdmin: true,
      riskOfficer: false,
      complianceManager: true,
      supportExecutive: false,
    },
    {
      permission: "audit:view_full_trail",
      category: "Compliance",
      description: "Inspect immutable audit logs and security events",
      superAdmin: true,
      riskOfficer: true,
      complianceManager: true,
      supportExecutive: false,
    },
    {
      permission: "support:respond_tickets",
      category: "Helpdesk",
      description: "Respond to customer support tickets and mark resolutions",
      superAdmin: true,
      riskOfficer: false,
      complianceManager: false,
      supportExecutive: true,
    },
    {
      permission: "config:modify_circuit_breaker",
      category: "Platform Settings",
      description: "Alter market trading session hours and circuit limits",
      superAdmin: true,
      riskOfficer: true,
      complianceManager: false,
      supportExecutive: false,
    },
    {
      permission: "broadcast:send_announcements",
      category: "Communications",
      description: "Dispatch broadcast alerts and margin calls to all traders",
      superAdmin: true,
      riskOfficer: true,
      complianceManager: true,
      supportExecutive: false,
    },
  ]);

  const togglePermission = (index: number, roleKey: "superAdmin" | "riskOfficer" | "complianceManager" | "supportExecutive") => {
    if (roleKey === "superAdmin") {
      setFeedback("Super Admin permissions are locked to full access by security policy.");
      return;
    }
    const updated = [...permissions];
    updated[index][roleKey] = !updated[index][roleKey];
    setPermissions(updated);
    setFeedback(`Permission '${updated[index].permission}' toggled for ${roleKey}.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const roleProfiles = [
    {
      key: "SUPER_ADMIN",
      name: "Super Administrator",
      description: "Full unfettered system control across all trading bots, ledger, settings, and users.",
      color: "from-purple-600 to-indigo-600",
      badge: "Highest Authority",
    },
    {
      key: "RISK_OFFICER",
      name: "Quantitative Risk Officer",
      description: "Focused on circuit breaker limits, emergency stops, bot drawdown caps, and risk management.",
      color: "from-rose-600 to-amber-600",
      badge: "Risk & Halts",
    },
    {
      key: "COMPLIANCE_MANAGER",
      name: "Compliance Manager",
      description: "Oversees KYC identity records, SEBI paper-trading consent trails, and audit inspections.",
      color: "from-cyan-600 to-blue-600",
      badge: "Audit & KYC",
    },
    {
      key: "SUPPORT_EXECUTIVE",
      name: "Support Executive",
      description: "Assists traders with query resolutions, virtual fund top-up queries, and ticket triage.",
      color: "from-emerald-600 to-teal-600",
      badge: "Helpdesk & Users",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Role Profile Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roleProfiles.map((r) => {
          const isSelected = selectedRole === r.key;
          return (
            <div
              key={r.key}
              onClick={() => setSelectedRole(r.key)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-[#0d1630] border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50"
                  : "bg-[#0d1630]/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    {r.badge}
                  </span>
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-tr ${r.color}`} />
                </div>
                <h4 className="text-sm font-bold text-white">{r.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {r.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-blue-400 font-semibold">Active Scope</span>
                <span className="font-mono text-slate-300">RBAC Level {r.key === "SUPER_ADMIN" ? "1" : "2"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Permissions Matrix Table */}
      <div className="bg-[#0d1630] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Granular Administrative Permissions Matrix</span>
            </h3>
            <p className="text-xs text-slate-400">
              Click any checkbox to simulate role-based authorization policy adjustments.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 font-mono text-slate-300">
            {permissions.length} System Directives
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Permission / Scope</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-center">Super Admin</th>
                <th className="p-3.5 text-center">Risk Officer</th>
                <th className="p-3.5 text-center">Compliance Mgr</th>
                <th className="p-3.5 text-center">Support Exec</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {permissions.map((p, idx) => (
                <tr key={p.permission} className="hover:bg-slate-800/30 transition">
                  <td className="p-3.5">
                    <div className="font-mono font-bold text-white">{p.permission}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{p.description}</div>
                  </td>

                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                      {p.category}
                    </span>
                  </td>

                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => togglePermission(idx, "superAdmin")}
                      className="p-1 rounded hover:bg-slate-800 transition"
                      title="Super Admin permanent"
                    >
                      {p.superAdmin ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-600 mx-auto" />
                      )}
                    </button>
                  </td>

                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => togglePermission(idx, "riskOfficer")}
                      className="p-1 rounded hover:bg-slate-800 transition cursor-pointer"
                    >
                      {p.riskOfficer ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500/70 mx-auto" />
                      )}
                    </button>
                  </td>

                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => togglePermission(idx, "complianceManager")}
                      className="p-1 rounded hover:bg-slate-800 transition cursor-pointer"
                    >
                      {p.complianceManager ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500/70 mx-auto" />
                      )}
                    </button>
                  </td>

                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => togglePermission(idx, "supportExecutive")}
                      className="p-1 rounded hover:bg-slate-800 transition cursor-pointer"
                    >
                      {p.supportExecutive ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500/70 mx-auto" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
