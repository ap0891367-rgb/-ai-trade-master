"use client";

import React, { useState, useEffect } from "react";
import {
  ScrollText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Eye,
  X
} from "lucide-react";

export function AuditLogsModule() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit-logs?action=${actionFilter}`);
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error("Failed to fetch audit logs", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1630] border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Compliance & Security Audit Trail</h3>
            <p className="text-xs text-slate-400">Tamper-evident logs of administrative actions, balance overrides, and kill-switch events.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 font-mono"
          >
            <option value="ALL">All Recorded Actions</option>
            <option value="USER">User Account Updates</option>
            <option value="WALLET">Wallet Adjustments</option>
            <option value="BOT">Trading Bot Lifecycle</option>
            <option value="CONFIG">Platform Config Updates</option>
            <option value="KYC">KYC & Compliance Approvals</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#0d1630] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Log ID / Event Action</th>
                <th className="p-3.5">Admin Email</th>
                <th className="p-3.5">Target Entity</th>
                <th className="p-3.5">Target ID</th>
                <th className="p-3.5">IP Address</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">Loading audit trail records...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">No audit logs found matching filter.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <div className="font-bold text-white text-xs">{log.action}</div>
                      <div className="text-[10px] text-slate-500 font-mono">AUD-00{log.id}</div>
                    </td>

                    <td className="p-3.5 font-mono text-slate-300">{log.adminEmail}</td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-blue-300 font-mono text-[10px]">
                        {log.targetEntity}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-slate-400">{log.targetId || "—"}</td>

                    <td className="p-3.5 font-mono text-slate-400 text-[11px]">{log.ipAddress}</td>

                    <td className="p-3.5 font-mono text-slate-400 text-[10px]">
                      {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 font-semibold text-xs border border-blue-500/30 transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-lg p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Audit Event Details</h3>
                <span className="text-xs text-blue-400 font-mono">{selectedLog.action} (ID #{selectedLog.id})</span>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto max-h-60">
              <pre>{JSON.stringify(selectedLog.details || {}, null, 2)}</pre>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1 font-mono text-slate-400">
              <div>Admin: <strong className="text-white">{selectedLog.adminEmail}</strong></div>
              <div>Entity: <strong className="text-white">{selectedLog.targetEntity} #{selectedLog.targetId}</strong></div>
              <div>IP Origin: <strong className="text-white">{selectedLog.ipAddress}</strong></div>
              <div>Timestamp: <strong className="text-white">{new Date(selectedLog.createdAt).toUTCString()}</strong></div>
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
