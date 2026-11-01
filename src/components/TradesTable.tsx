"use client";

import React, { useState } from "react";
import { ArrowUpRight, ArrowDownLeft, XCircle, CheckCircle, Clock, ShieldAlert } from "lucide-react";

interface TradesTableProps {
  trades: any[];
  onCloseTrade: (tradeId: number, currentPrice: number) => Promise<void>;
  currentPrices: Record<string, number>;
}

export function TradesTable({ trades, onCloseTrade, currentPrices }: TradesTableProps) {
  const [tab, setTab] = useState<"OPEN" | "CLOSED">("OPEN");
  const [closingId, setClosingId] = useState<number | null>(null);

  const openTrades = trades.filter(t => t.status === "OPEN");
  const closedTrades = trades.filter(t => t.status === "CLOSED");

  const handleClose = async (t: any) => {
    const livePrice = currentPrices[t.symbol] || Number(t.currentPrice);
    setClosingId(t.id);
    try {
      await onCloseTrade(t.id, livePrice);
    } finally {
      setClosingId(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-5 shadow-xl text-white overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 mb-3 sm:mb-4">
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setTab("OPEN")}
              className={`px-3 py-1.5 rounded-lg transition font-bold ${
                tab === "OPEN" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Active Positions ({openTrades.length})
            </button>
            <button
              onClick={() => setTab("CLOSED")}
              className={`px-3 py-1.5 rounded-lg transition font-bold ${
                tab === "CLOSED" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Closed History ({closedTrades.length})
            </button>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Auto & Manual Executions
        </span>
      </div>

      {/* Content */}
      {tab === "OPEN" ? (
        openTrades.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
            No active positions open. Execute trades from the Main Agent recommendations or enable Auto-Trading.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-lg">Asset</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Entry</th>
                  <th className="p-3">Current</th>
                  <th className="p-3">Qty / Invested</th>
                  <th className="p-3">SL / Target</th>
                  <th className="p-3">Live P&L</th>
                  <th className="p-3">Astro / Confidence</th>
                  <th className="p-3 rounded-r-lg text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {openTrades.map((t) => {
                  const livePrice = currentPrices[t.symbol] || Number(t.currentPrice);
                  const entryPrice = Number(t.entryPrice);
                  const qty = Number(t.quantity);
                  const invested = Number(t.investedAmount);
                  const pnl = (livePrice - entryPrice) * qty;
                  const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
                  const isProfit = pnl >= 0;

                  return (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3">
                        <div className="font-bold text-white">{t.symbol}</div>
                        <div className="text-[10px] text-slate-400">{t.companyName}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                          {t.side}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-medium text-slate-200">
                        ₹{entryPrice.toFixed(2)}
                      </td>
                      <td className="p-3 font-mono font-bold text-white">
                        ₹{livePrice.toFixed(2)}
                      </td>
                      <td className="p-3 font-mono text-slate-300">
                        <div>{qty} units</div>
                        <div className="text-[10px] text-slate-400">₹{invested.toLocaleString("en-IN")}</div>
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        <div className="text-rose-400">SL: ₹{t.stopLoss || "—"}</div>
                        <div className="text-emerald-400">TP: ₹{t.takeProfit || "—"}</div>
                      </td>
                      <td className="p-3 font-mono">
                        <div className={`font-bold ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                          {isProfit ? "+" : ""}₹{pnl.toFixed(2)}
                        </div>
                        <div className={`text-[10px] ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                          ({isProfit ? "+" : ""}{pnlPct.toFixed(2)}%)
                        </div>
                      </td>
                      <td className="p-3 text-[11px] text-slate-300">
                        <div className="line-clamp-1">{t.astroVerdict || "Shubh Muhurat"}</div>
                        <div className="text-[10px] text-blue-400">{t.mainAgentConfidence}% Confidence</div>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleClose(t)}
                          disabled={closingId === t.id}
                          className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white font-semibold text-[11px] transition shadow disabled:opacity-50"
                        >
                          {closingId === t.id ? "Closing..." : "Exit Position"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        closedTrades.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
            No closed trades in history yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-lg">Asset</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Entry</th>
                  <th className="p-3">Exit</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Realized P&L</th>
                  <th className="p-3">Return %</th>
                  <th className="p-3 rounded-r-lg">Closed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {closedTrades.map((t) => {
                  const pnl = Number(t.pnl || 0);
                  const isProfit = pnl >= 0;
                  return (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-white">{t.symbol}</td>
                      <td className="p-3 font-semibold text-emerald-400">{t.side}</td>
                      <td className="p-3 font-mono text-slate-300">₹{Number(t.entryPrice).toFixed(2)}</td>
                      <td className="p-3 font-mono text-slate-300">₹{Number(t.exitPrice || t.currentPrice).toFixed(2)}</td>
                      <td className="p-3 font-mono text-slate-300">{t.quantity}</td>
                      <td className={`p-3 font-mono font-bold ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                        {isProfit ? "+" : ""}₹{pnl.toFixed(2)}
                      </td>
                      <td className={`p-3 font-mono ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                        {isProfit ? "+" : ""}{Number(t.pnlPercent || 0).toFixed(2)}%
                      </td>
                      <td className="p-3 text-[10px] text-slate-400 font-mono">
                        {t.closedAt ? new Date(t.closedAt).toLocaleString() : "Just now"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
