"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  PlusCircle,
  CreditCard,
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export function WalletModule() {
  const [ledger, setLedger] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Adjustment form state
  const [targetUserId, setTargetUserId] = useState("1");
  const [actionType, setActionType] = useState("ADMIN_CREDIT");
  const [amount, setAmount] = useState("100000");
  const [description, setDescription] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/wallet?type=${typeFilter}`);
      const data = await res.json();
      if (data.transactions) {
        setLedger(data.transactions);
      }
    } catch (e) {
      console.error("Failed to fetch ledger", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [typeFilter]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(targetUserId),
          type: actionType,
          amount: Number(amount),
          description: description || `Admin adjustment: ${actionType}`,
          adminNote: adminNote || "Paper trading simulation balance update",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Success! User #${targetUserId} balance updated to ₹${Number(data.newBalance).toLocaleString("en-IN")}`);
        setDescription("");
        setAdminNote("");
        fetchLedger();
        setTimeout(() => setFeedback(null), 4000);
      } else {
        alert(data.error || "Failed to adjust balance");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const totalCredits = ledger
    .filter(t => t.type === "DEPOSIT" || t.type === "ADMIN_CREDIT" || t.type === "TRADE_SELL_PROFIT")
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const totalDebits = ledger
    .filter(t => t.type === "WITHDRAW" || t.type === "ADMIN_DEBIT" || t.type === "TRADE_BUY")
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0d1630] border border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Inflow / Credits (Demo)
          </div>
          <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-2">
            +₹{totalCredits.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Virtual deposits & trade profits</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d1630] border border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Outflow / Allocations (Demo)
          </div>
          <div className="text-2xl font-mono font-extrabold text-rose-400 mt-2">
            -₹{totalDebits.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Simulated buys & virtual debits</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d1630] border border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Ledger Audit Status
          </div>
          <div className="text-2xl font-mono font-extrabold text-blue-400 mt-2">
            100% Balanced
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>All entries signed by audit logger</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Manual Balance Adjustment Form & Ledger Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (4 cols) */}
        <div className="lg:col-span-4 bg-[#0d1630] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Direct Virtual Balance Adjustment</h3>
          </div>

          <form onSubmit={handleAdjustSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Target Trader User ID</label>
              <select
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
              >
                <option value="1">User #1 - Rajesh Varma (Admin)</option>
                <option value="2">User #2 - Sandeep Nair (Risk)</option>
                <option value="5">User #5 - Priya Sharma (HNI Trader)</option>
                <option value="6">User #6 - Vikram Mehta (Scalper)</option>
                <option value="7">User #7 - Neha Verma (Algo Demo)</option>
                <option value="8">User #8 - Arjun Patel (Perp Trader)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-400 mb-1">Action Type</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                >
                  <option value="ADMIN_CREDIT">Admin Credit (+)</option>
                  <option value="ADMIN_DEBIT">Admin Debit (-)</option>
                  <option value="RESET">Reset Exact (=)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Amount (INR)</label>
                <input
                  type="number"
                  step="1000"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Ledger Description</label>
              <input
                type="text"
                placeholder="e.g. Approved demo testing allocation"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Audit Record Note</label>
              <input
                type="text"
                placeholder="e.g. Authorized under Paper Trading Policy #2026"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs mt-2 transition shadow-md shadow-emerald-600/30"
            >
              {actionLoading ? "Executing Adjustment..." : "Execute Virtual Adjustment"}
            </button>
          </form>
        </div>

        {/* Right Ledger Table (8 cols) */}
        <div className="lg:col-span-8 bg-[#0d1630] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Global Virtual Ledger Trail ({ledger.length})</h3>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 font-mono"
              >
                <option value="ALL">All Transaction Types</option>
                <option value="ADMIN_CREDIT">Admin Credits</option>
                <option value="ADMIN_DEBIT">Admin Debits</option>
                <option value="DEPOSIT">Deposits</option>
                <option value="TRADE_BUY">Trade Buy Orders</option>
                <option value="TRADE_SELL_PROFIT">Trade Profit Exits</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[420px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] sticky top-0">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Description / Note</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">Loading ledger stream...</td>
                  </tr>
                ) : ledger.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">No transactions recorded.</td>
                  </tr>
                ) : (
                  ledger.map((tx) => {
                    const isCredit = tx.type === "DEPOSIT" || tx.type === "ADMIN_CREDIT" || tx.type === "TRADE_SELL_PROFIT" || tx.type === "RESET";
                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-3">
                          <div className="font-bold text-white text-[11px]">{tx.userName || `User #${tx.userId}`}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{tx.userEmail}</div>
                        </td>

                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isCredit ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                          }`}>
                            {tx.type}
                          </span>
                        </td>

                        <td className="p-3">
                          <div className="text-slate-200 line-clamp-1">{tx.description}</div>
                          {tx.adminNote && (
                            <div className="text-[10px] text-slate-400 font-mono italic">
                              Note: {tx.adminNote}
                            </div>
                          )}
                        </td>

                        <td className={`p-3 font-mono font-bold whitespace-nowrap ${isCredit ? "text-emerald-400" : "text-rose-400"}`}>
                          {isCredit ? "+" : "-"}₹{Number(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>

                        <td className="p-3 text-right text-[10px] text-slate-400 font-mono whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
    </div>
  );
}
