"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  Clock,
  Zap,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";

export function PlatformConfigModule() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/config");
      const data = await res.json();
      if (data.configs) {
        setConfigs(data.configs);
      }
    } catch (e) {
      console.error("Failed to fetch platform configuration", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleUpdate = async (key: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: editValue }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Configuration '${key}' updated to '${editValue}'`);
        setEditingKey(null);
        fetchConfigs();
        setTimeout(() => setFeedback(null), 3000);
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-[#0d1630] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <span>Platform Global Configuration & Quantitative Guardrails</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold">
                LIVE_STORE
              </span>
            </h4>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Adjust market session timings, simulated brokerage, automated circuit breakers, and paper-trading limits.
            </p>
          </div>
        </div>

        <button
          onClick={fetchConfigs}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Reload Config</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Configs Table */}
      <div className="bg-[#0d1630] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Key Parameter</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Current Value</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">Loading configurations...</td>
                </tr>
              ) : (
                configs.map((c) => {
                  const isEditing = editingKey === c.key;

                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-white text-xs">{c.key}</span>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-blue-300 font-mono text-[10px]">
                          {c.category}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="px-2 py-1 bg-slate-800 border border-blue-500 rounded text-xs text-emerald-400 font-mono w-48"
                          />
                        ) : (
                          <span className="font-bold text-emerald-400 text-xs">{c.value}</span>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-300 text-[11px] max-w-xs">{c.description}</td>

                      <td className="p-3.5 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingKey(null)}
                              className="px-2 py-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdate(c.key)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingKey(c.key);
                              setEditValue(c.value);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 font-semibold text-xs border border-blue-500/30 transition"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
