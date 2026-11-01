"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Radio,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Globe
} from "lucide-react";

export function MarketDataModule() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/providers");
      const data = await res.json();
      if (data.providers) {
        setProviders(data.providers);
      }
    } catch (e) {
      console.error("Failed to fetch market data providers", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleToggleProvider = async (providerId: number, currentStatus: string) => {
    setActionLoading(true);
    const newStatus = currentStatus === "CONNECTED" ? "DEGRADED" : "CONNECTED";
    try {
      const res = await fetch("/api/admin/providers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Provider status updated to ${newStatus}`);
        fetchProviders();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateLatency = async (providerId: number) => {
    setActionLoading(true);
    const randomLatency = Math.floor(10 + Math.random() * 25);
    try {
      const res = await fetch("/api/admin/providers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, latencyMs: randomLatency }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Latency simulated at ${randomLatency}ms for Provider #${providerId}`);
        fetchProviders();
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
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <span>Exchange Realtime Feed Integrations</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold font-mono">
                SIMULATED_AUTHORIZED
              </span>
            </h4>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Live market feeds for Angel One NSE cash & derivatives, Delta Exchange crypto perps, and Forex interbank ticks.
            </p>
          </div>
        </div>

        <button
          onClick={fetchProviders}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? "animate-spin" : ""}`} />
          <span>Ping All Gateways</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center justify-between">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-slate-400 text-xs">Loading market feed gateways...</div>
        ) : (
          providers.map((p) => {
            const isOnline = p.status === "CONNECTED";

            return (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-[#0d1630] border border-slate-800 hover:border-slate-700 transition space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isOnline ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{p.providerName}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Exchange: {p.exchange}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                    isOnline ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                  }`}>
                    ● {p.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Tick Latency</span>
                    <span className="text-emerald-400 font-bold text-sm">{p.latencyMs} ms</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Protocol Mode</span>
                    <span className="text-white font-bold text-[11px] truncate block">{p.feedMode}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-500 block uppercase">Last Tick</span>
                    <span className="text-blue-300 font-bold text-[11px]">
                      {new Date(p.lastTickAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleSimulateLatency(p.id)}
                    className="text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    Simulate Latency Ping
                  </button>

                  <button
                    onClick={() => handleToggleProvider(p.id, p.status)}
                    className="text-slate-400 hover:text-white font-medium"
                  >
                    Toggle Gateway State
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
