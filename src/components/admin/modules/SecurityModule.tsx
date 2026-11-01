"use client";

import React, { useState } from "react";
import {
  Lock,
  ShieldCheck,
  Key,
  Globe,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Copy
} from "lucide-react";

export function SecurityModule() {
  const [twoFactorEnforced, setTwoFactorEnforced] = useState(true);
  const [sessionTimeoutMin, setSessionTimeoutMin] = useState("30");
  const [rateLimitPerMin, setRateLimitPerMin] = useState("120");
  const [allowedIps, setAllowedIps] = useState("127.0.0.1, 192.168.1.0/24, 10.0.0.0/8");
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback("Security policies and rate limits updated successfully.");
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-[#0d1630] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <span>Security Hardening & Access Control Governance</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold">
                ENCRYPTED_SHA256
              </span>
            </h4>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Enforce role-based two-factor authentication, administrative IP whitelists, and API rate limits.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Security Score: 98/100</span>
        </span>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Security Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={handleSaveSecurity} className="p-5 rounded-2xl bg-[#0d1630] border border-slate-800 space-y-4 text-xs">
          <div className="pb-3 border-b border-slate-800">
            <h4 className="font-bold text-white text-sm">Administrative Authentication Rules</h4>
            <p className="text-slate-400 text-[11px]">Control session longevity and credential requirements</p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div>
              <span className="font-bold text-white block">Enforce 2FA on Administrative Roles</span>
              <span className="text-[11px] text-slate-400">Requires TOTP token for Super Admin & Risk Officers</span>
            </div>
            <button
              type="button"
              onClick={() => setTwoFactorEnforced(!twoFactorEnforced)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                twoFactorEnforced ? "bg-emerald-600" : "bg-slate-700"
              }`}
            >
              <span className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                twoFactorEnforced ? "left-6" : "left-0.5"
              }`} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Session Inactivity Timeout (Minutes)</label>
              <input
                type="number"
                value={sessionTimeoutMin}
                onChange={(e) => setSessionTimeoutMin(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">API Rate Limit (Req / Min / IP)</label>
              <input
                type="number"
                value={rateLimitPerMin}
                onChange={(e) => setRateLimitPerMin(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Whitelisted Administrative IP Subnets</label>
            <textarea
              rows={3}
              value={allowedIps}
              onChange={(e) => setAllowedIps(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
          >
            Apply Security Hardening Policies
          </button>
        </form>

        {/* API Credentials & Vault Status */}
        <div className="p-5 rounded-2xl bg-[#0d1630] border border-slate-800 space-y-4 text-xs">
          <div className="pb-3 border-b border-slate-800">
            <h4 className="font-bold text-white text-sm">Exchange Gateway Keys & Secrets Vault</h4>
            <p className="text-slate-400 text-[11px]">Server-side proxy credentials (Secrets never exposed to client)</p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">Angel One SmartAPI Gateway</span>
                <span className="text-emerald-400 font-mono text-[10px] font-bold">ACTIVE_ENCRYPTED</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Key ID: <span className="text-slate-300">ANGEL_FEED_L2_••••••••••••9820</span>
              </div>
              <div className="text-[10px] text-slate-500">Auto-rotates every 30 days</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">Delta Exchange HMAC Signing API</span>
                <span className="text-emerald-400 font-mono text-[10px] font-bold">ACTIVE_ENCRYPTED</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Key ID: <span className="text-slate-300">DELTA_PERP_HMAC_••••••••••••4412</span>
              </div>
              <div className="text-[10px] text-slate-500">High-frequency WebSocket protocol</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">PostgreSQL Connection Security</span>
                <span className="text-emerald-400 font-mono text-[10px] font-bold">POOL_ISOLATED</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Database: <span className="text-slate-300">postgresql://127.0.0.1:5432/app_db</span>
              </div>
              <div className="text-[10px] text-slate-500">Parameterized SQL injection shield active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
