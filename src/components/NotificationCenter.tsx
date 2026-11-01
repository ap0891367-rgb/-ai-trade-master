"use client";

import React from "react";
import { Bell, CheckCheck, X, Sparkles, TrendingUp, TrendingDown, Bot, Zap } from "lucide-react";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: any[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onSelectSymbol?: (symbol: string) => void;
}

export function NotificationCenter({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onMarkAllRead,
  onSelectSymbol,
}: NotificationCenterProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-16 bg-black/40 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col text-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Main Agent Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-[10px] font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="p-3 space-y-2.5 overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No notifications yet. Run scans or activate auto-trading to receive agent alerts.
            </div>
          ) : (
            notifications.map((notif: any) => {
              const isBuy = notif.type === "BUY_ALERT";
              const isSell = notif.type === "SELL_ALERT";
              const isAuto = notif.type === "AUTO_TRADE";

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (onSelectSymbol && notif.symbol) onSelectSymbol(notif.symbol);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    !notif.read
                      ? "bg-slate-800/80 border-blue-500/40 shadow-sm"
                      : "bg-slate-800/30 border-slate-700/50 opacity-80"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      isAuto
                        ? "bg-purple-500/20 text-purple-400"
                        : isBuy
                        ? "bg-emerald-500/20 text-emerald-400"
                        : isSell
                        ? "bg-rose-500/20 text-rose-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}>
                      {isAuto ? <Zap className="w-4 h-4" /> : isBuy ? <TrendingUp className="w-4 h-4" /> : isSell ? <TrendingDown className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-white line-clamp-1">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-snug">
                        {notif.message}
                      </p>

                      {notif.symbol && (
                        <div className="mt-2 flex items-center justify-between text-[10px]">
                          <span className="font-mono px-1.5 py-0.5 rounded bg-slate-700/80 text-blue-300 font-semibold">
                            {notif.symbol}
                          </span>
                          <span className="text-blue-400 hover:underline">
                            Click to inspect chart →
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
