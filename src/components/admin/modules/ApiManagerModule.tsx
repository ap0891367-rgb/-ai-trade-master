"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Link,
  Server,
  Shield,
  Database,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Globe,
  Cpu,
  Music,
  Film,
  Palette,
  Folder,
  TrendingUp,
  BarChart,
  Zap,
  Calendar,
  Target,
  Users,
  Bot,
  ShieldCheck,
  Activity,
} from "lucide-react";

interface ApiConfig {
  id: number;
  apiName: string;
  apiKey: string; // masked in UI
  apiEndpoint: string;
  modelName: string;
  configuration: Record<string, any>;
  testConnection: boolean;
  connectionStatus: "Connected" | "Not Connected" | "Error";
  usageTracking: number;
  rateLimits: number;
  enabled: boolean;
}

interface ApiManagerModuleProps {
  userId: number;
}

export function ApiManagerModule({ userId }: ApiManagerModuleProps) {
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newApi, setNewApi] = useState<Partial<ApiConfig>>({
    apiName: "",
    apiEndpoint: "",
    modelName: "",
    configuration: {},
    testConnection: false,
    connectionStatus: "Not Connected",
    usageTracking: 0,
    rateLimits: 1000,
    enabled: true,
  });

  // Load API configurations from server
  useEffect(() => {
    const loadApis = async () => {
      try {
        const res = await fetch(`/api/admin/config?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setApiConfigs(data.apis || []);
        }
      } catch (e) {
        console.error("Failed to load API configs:", e);
      }
    };
    loadApis();
  }, [userId]);

  const handleConnectApi = async (apiId: number) => {
    const api = apiConfigs.find((a) => a.id === apiId);
    if (!api) return;
    
    try {
      const res = await fetch(`/api/admin/config/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiId, apiKey: api.apiKey, endpoint: api.apiEndpoint }),
      });
      const data = await res.json();
      setApiConfigs(prev =>
        prev.map(a => a.id === apiId ? { ...a, connectionStatus: data.status || "Error", testConnection: true } : a)
      );
    } catch (e) {
      setApiConfigs(prev =>
        prev.map(a => a.id === apiId ? { ...a, connectionStatus: "Error", testConnection: true } : a)
      );
    }
  };

  const handleToggleEnable = async (apiId: number, enabled: boolean) => {
    try {
      await fetch(`/api/admin/config/${apiId}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      setApiConfigs(prev =>
        prev.map(a => a.id === apiId ? { ...a, enabled } : a)
      );
    } catch (e) {
      console.error("Failed to toggle API:", e);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">API Manager</h2>
        <p className="text-[10px] text-slate-500">Centralized API configuration and connection management</p>
      </div>

      {/* API Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {apiConfigs.map((api) => (
          <div
            key={api.id}
            className={`rounded-2xl border border-[#13233c] bg-[#07101f] p-4 hover:border-cyan-500/20 transition-all cursor-pointer ${api.connectionStatus === "Connected" ? "bg-[#0f2035]/50" : ""}`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center shrink-0">
                <Link className="text-cyan-400 text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">{api.apiName}</h3>
                <p className="text-[9px] text-slate-400 mt-1">{api.modelName}</p>
                <p className="text-[9px] text-slate-500 mt-1">
                  Status: {api.connectionStatus}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={`px-2 py-1 text-[8px] font-bold rounded ${api.enabled ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                {api.enabled ? "Enabled" : "Disabled"}
              </span>
              {api.testConnection && (
                <span className={`px-2 py-1 text-[8px] font-bold rounded ${api.connectionStatus === "Connected" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                  {api.connectionStatus}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add New API Modal */}
      <div className="mt-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 py-2 px-4 text-[11px] font-bold text-slate-950 transition hover:from-cyan-400 hover:to-blue-400"
        >
          <Link className="h-4 w-4" />
          Add API Configuration
        </button>

        {/* New API Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="rounded-2xl border border-[#13233c] bg-[#07101f] p-6 w-full max-w-lg">
              <h3 className="text-xl font-bold text-white mb-4">
                {editingId ? "Edit API" : "Add New API Configuration"}
              </h3>
              
              <form
                onSubmit={async (e: React.FormEvent) => {
                  e.preventDefault();
                  const apiData = {
                    apiName: (e.target as any).apiName.value,
                    apiEndpoint: (e.target as any).apiEndpoint.value,
                    modelName: (e.target as any).modelName.value,
                    configuration: JSON.parse((e.target as any).configuration.value),
                    testConnection: false,
                    connectionStatus: "Not Connected",
                    usageTracking: 0,
                    rateLimits: 1000,
                    enabled: true,
                  };
                  
                  try {
                    if (editingId) {
                      await fetch(`/api/admin/config/${editingId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(apiData),
                      });
                    } else {
                      await fetch("/api/admin/config", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(apiData),
                      });
                    }
                    setIsModalOpen(false);
                    setEditingId(null);
                    setNewApi({
                      apiName: "",
                      apiEndpoint: "",
                      modelName: "",
                      configuration: {},
                      testConnection: false,
                      connectionStatus: "Not Connected",
                      usageTracking: 0,
                      rateLimits: 1000,
                      enabled: true,
                    });
                    }
                    await fetch(`/api/admin/config?userId=${userId}`);
                  } catch (err) {
                    console.error("Failed to save API config:", err);
                  }
                }}
              >
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-1">API Name</label>
                    <input
                      type="text"
                      name="apiName"
                      value={newApi.apiName || ""}
                      onChange={(e: React.ChangeEvent) =>
        setNewApi({ ...newApi, apiName: e.target.value })}
                      className="w-full rounded-md border border-[#1a2b47] bg-[#060d19] px-3 py-2 text-[10px] font-semibold text-white outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-1">Endpoint URL</label>
                    <input
                      type="text"
                      name="apiEndpoint"
                      value={newApi.apiEndpoint || ""}
                      onChange={(e: React.ChangeEvent) =>
        setNewApi({ ...newApi, apiEndpoint: e.target.value })}
                      className="w-full rounded-md border border-[#1a2b47] bg-[#060d19] px-3 py-2 text-[10px] font-semibold text-white outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-1">Model Name</label>
                    <input
                      type="text"
                      name="modelName"
                      value={newApi.modelName || ""}
                      onChange={(e: React.ChangeEvent) =>
        setNewApi({ ...newApi, modelName: e.target.value })}
                      className="w-full rounded-md border border-[#1a2b47] bg-[#060d19] px-3 py-2 text-[10px] font-semibold text-white outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 block mb-1">Configuration</label>
                    <textarea
                      name="configuration"
                      value={JSON.stringify(newApi.configuration || {})}
                      onChange={(e: React.ChangeEvent) =>
        setNewApi({ ...newApi, configuration: JSON.parse(e.target.value || "{}") })}
                      className="w-full rounded-md border border-[#1a2b47] bg-[#060d19] px-3 py-2 text-[10px] font-semibold text-white outline-none focus:border-cyan-500/50 resize-none h-24"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 rounded-md bg-[#0d1a2c] text-[10px] font-semibold text-slate-400 hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 text-[10px] font-bold text-slate-950 transition hover:from-cyan-400 hover:to-blue-400"
                  >
                    {editingId ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}