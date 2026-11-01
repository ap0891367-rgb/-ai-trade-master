"use client";

import React, { useState } from "react";
import { 
  Wallet, 
  PlusCircle, 
  RotateCcw, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  X, 
  DollarSign, 
  TrendingUp,
  ShieldCheck,
  CreditCard
} from "lucide-react";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletData: {
    balance: number;
    currency: string;
    investedAmount: number;
    unrealizedPnl: number;
    realizedPnl: number;
    totalPortfolioValue: number;
    transactions: any[];
  } | null;
  onAddFunds: (amount: number) => Promise<void>;
  onResetWallet: () => Promise<void>;
}

export function WalletModal({
  isOpen,
  onClose,
  walletData,
  onAddFunds,
  onResetWallet,
}: WalletModalProps) {
  const [customAmount, setCustomAmount] = useState<string>("100000");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen || !walletData) return null;

  const handleDeposit = async (amt: number) => {
    try {
      setLoading(true);
      await onAddFunds(amt);
      setFeedback(`₹${amt.toLocaleString("en-IN")} deposited successfully!`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (e: any) {
      setFeedback("Failed to add funds");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset your wallet to ₹5,00,000?")) return;
    try {
      setLoading(true);
      await onResetWallet();
      setFeedback("Wallet successfully reset to ₹5,00,000");
      setTimeout(() => setFeedback(null), 3000);
    } catch (e) {
      setFeedback("Failed to reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto text-white shadow-2xl touch-scroll">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-3 sticky top-0 bg-slate-900/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 shrink-0">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-white">AI Trading Wallet & Capital</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">Manage virtual paper-trading balance and funds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition shrink-0"
            aria-label="Close wallet"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
          {/* Feedback alert */}
          {feedback && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Portfolio Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Available Cash</span>
              <div className="text-base sm:text-lg font-mono font-bold text-white mt-1 break-all">
                ₹{walletData.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Invested Value</span>
              <div className="text-base sm:text-lg font-mono font-bold text-blue-400 mt-1 break-all">
                ₹{walletData.investedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Unrealized P&L</span>
              <div className={`text-base sm:text-lg font-mono font-bold mt-1 break-all ${walletData.unrealizedPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {walletData.unrealizedPnl >= 0 ? "+" : ""}₹{walletData.unrealizedPnl.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-slate-800/70 p-3.5 rounded-xl border border-slate-700/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Portfolio</span>
              <div className="text-base sm:text-lg font-mono font-bold text-emerald-400 mt-1 break-all">
                ₹{walletData.totalPortfolioValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Quick Add Funds section */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-blue-400" />
              Add Virtual Demo Funds
            </h4>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleDeposit(50000)}
                disabled={loading}
                className="px-3 py-2 min-h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition"
              >
                + ₹50,000
              </button>
              <button
                onClick={() => handleDeposit(100000)}
                disabled={loading}
                className="px-3 py-2 min-h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition"
              >
                + ₹1,00,000
              </button>
              <button
                onClick={() => handleDeposit(500000)}
                disabled={loading}
                className="px-3 py-2 min-h-10 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-xs font-bold text-blue-300 transition"
              >
                + ₹5,00,000
              </button>
              
              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full sm:w-auto sm:ml-auto justify-center px-3 py-2 min-h-10 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-semibold text-rose-300 transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to ₹5 Lakh</span>
              </button>
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Recent Transactions ({walletData.transactions.length})
            </h4>

            {walletData.transactions.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No transactions recorded yet. Trades and deposits will show up here.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {walletData.transactions.map((tx: any) => {
                  const isCredit = tx.type === "DEPOSIT" || tx.type === "TRADE_SELL_PROFIT" || tx.type === "RESET";
                  return (
                    <div
                      key={tx.id}
                      className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/60 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-1.5 rounded-lg shrink-0 ${
                          isCredit ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                        }`}>
                          {isCredit ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-white font-medium truncate">{tx.description}</div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>

                      <div className={`font-mono font-bold shrink-0 ${isCredit ? "text-emerald-400" : "text-rose-400"}`}>
                        {isCredit ? "+" : "-"}₹{Number(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
