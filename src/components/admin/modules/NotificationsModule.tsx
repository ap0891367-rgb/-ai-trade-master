"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Send,
  AlertTriangle,
  CheckCircle2,
  Radio,
  Zap,
  Info,
  Clock,
  Sparkles
} from "lucide-react";

export function NotificationsModule() {
  const [broadcastList, setBroadcastList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Send broadcast form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("ADMIN_BROADCAST");
  const [symbol, setSymbol] = useState("SYSTEM");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchBroadcasts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/broadcasts");
      const data = await res.json();
      if (data.notifications) {
        setBroadcastList(data.notifications);
      }
    } catch (e) {
      console.error("Failed to fetch broadcasts", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          type,
          symbol,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Broadcast dispatched to ${data.recipients} active platform accounts.`);
        setTitle("");
        setMessage("");
        fetchBroadcasts();
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Broadcast Dispatcher Form & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dispatch Form (5 cols) */}
        <div className="lg:col-span-5 bg-[#0d1630] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Radio className="w-5 h-5 text-blue-400 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold text-white">Dispatch Platform Broadcast</h3>
              <p className="text-[11px] text-slate-400">Push instant alerts to all active demo traders</p>
            </div>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Alert Classification</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
              >
                <option value="ADMIN_BROADCAST">Platform Announcement (General)</option>
                <option value="BUY_ALERT">30-Agent High Confluence Signal</option>
                <option value="SELL_ALERT">Emergency Exit / Profit Booking Alert</option>
                <option value="AUTO_TRADE">Bot Execution Status Notice</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Associated Symbol / Tag</label>
              <input
                type="text"
                required
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="SYSTEM or RELIANCE or BANKNIFTY"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-mono text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Broadcast Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scheduled NSE 9:15 AM OI Model Session Open"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Message Content</label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter alert details, guidelines, or risk notifications..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs mt-2 flex items-center justify-center gap-1.5 transition shadow-md shadow-blue-600/30"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{actionLoading ? "Dispatching Broadcast..." : "Send Broadcast to All Accounts"}</span>
            </button>
          </form>

          {feedback && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}
        </div>

        {/* Right: Broadcast History Stream (7 cols) */}
        <div className="lg:col-span-7 bg-[#0d1630] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Broadcast Delivery Log</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Real-time WebSocket & DB Store</span>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {loading ? (
              <div className="text-center py-12 text-slate-400 text-xs">Loading broadcast logs...</div>
            ) : broadcastList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">No notifications sent yet.</div>
            ) : (
              broadcastList.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-white text-xs">{item.title}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-blue-300 font-mono font-bold">
                        {item.symbol}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                    <span>Target: Account #{item.userId}</span>
                    <span className="text-emerald-400">Delivered</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
