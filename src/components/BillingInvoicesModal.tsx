"use client";

import React, { useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  X,
  FileText,
  Download,
  Clock,
  ShieldCheck,
  Calendar
} from "lucide-react";

interface BillingInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: any[];
  currentPlan: string;
}

export function BillingInvoicesModal({
  isOpen,
  onClose,
  invoices,
  currentPlan,
}: BillingInvoicesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 text-white">
      <div className="bg-[#0b1329] border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#090f20]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Billing & Subscription Invoices</h3>
              <p className="text-xs text-slate-400">Separately audited SaaS software licensing records</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Current Plan Tier</div>
              <div className="text-lg font-black text-white font-mono mt-0.5">{currentPlan} PLAN</div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold font-mono text-xs">
              ● Active Billing
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Invoice History ({invoices.length})
            </h4>

            {invoices.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                No past invoices generated. Your Free plan includes standard paper trading features.
              </div>
            ) : (
              invoices.map((inv) => (
                <div
                  key={inv.id || inv.invoiceNumber}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white font-mono">{inv.invoiceNumber}</div>
                      <div className="text-[10px] text-slate-400">
                        Plan: {inv.planCode} • {inv.billingCycle} • {inv.paymentGateway}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-emerald-400">
                      ₹{Number(inv.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">PAID</span>
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
