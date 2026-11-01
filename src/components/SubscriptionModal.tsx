"use client";

import React, { useState } from "react";
import {
  DollarSign,
  CheckCircle2,
  X,
  CreditCard,
  ShieldCheck,
  Zap,
  ArrowRight
} from "lucide-react";
import { ENTERPRISE_SUBSCRIPTION_PLANS, SubscriptionPlanDef } from "@/lib/subscriptionPlans";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanCode: string;
  onSubscribe: (planCode: string, cycle: "MONTHLY" | "ANNUAL", couponCode?: string) => Promise<void>;
}

export function SubscriptionModal({
  isOpen,
  onClose,
  currentPlanCode,
  onSubscribe,
}: SubscriptionModalProps) {
  const [cycle, setCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [coupon, setCoupon] = useState("");
  const [subscribingCode, setSubscribingCode] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelect = async (plan: SubscriptionPlanDef) => {
    setSubscribingCode(plan.code);
    try {
      await onSubscribe(plan.code, cycle, coupon);
      setFeedback(`Upgraded to ${plan.name}!`);
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 2000);
    } catch (e: any) {
      alert(e.message || "Subscription upgrade failed");
    } finally {
      setSubscribingCode(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 text-white">
      <div className="bg-[#0b1329] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#090f20]">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white">
              AI Trade Master Subscription Plans
            </h3>
            <p className="text-xs text-slate-400">
              Select an enterprise SaaS plan to unlock more AI analyses, watchlists, and demo bots.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cycle Toggle & Coupon */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="inline-flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800 font-bold">
            <button
              onClick={() => setCycle("MONTHLY")}
              className={`px-3 py-1.5 rounded-xl transition ${
                cycle === "MONTHLY" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setCycle("ANNUAL")}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                cycle === "ANNUAL" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Annual</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 text-emerald-100 font-mono">
                ~17% Off
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Coupon Code (e.g. TRADERAI50)"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono uppercase text-white"
            />
          </div>
        </div>

        {feedback && (
          <div className="m-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* 5 Plans Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {ENTERPRISE_SUBSCRIPTION_PLANS.map((plan) => {
            const price = cycle === "ANNUAL" ? plan.priceAnnual : plan.priceMonthly;
            const isCurrent = currentPlanCode === plan.code;

            return (
              <div
                key={plan.code}
                className={`rounded-2xl p-4 border flex flex-col justify-between ${
                  plan.isPopular
                    ? "bg-gradient-to-b from-blue-950/60 to-slate-900 border-cyan-400"
                    : "bg-slate-900/70 border-slate-800"
                }`}
              >
                <div>
                  <h4 className="font-extrabold text-sm text-white">{plan.name}</h4>
                  <div className="my-2">
                    <span className="text-xl font-black font-mono">₹{price.toLocaleString("en-IN")}</span>
                    <span className="text-[10px] text-slate-400 ml-1">/{cycle === "ANNUAL" ? "yr" : "mo"}</span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-300 border-t border-slate-800 pt-2.5">
                    {plan.features.slice(0, 4).map((f, i) => (
                      <div key={i} className="flex items-start gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800">
                  <button
                    onClick={() => handleSelect(plan)}
                    disabled={isCurrent || subscribingCode === plan.code}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition ${
                      isCurrent
                        ? "bg-slate-800 text-slate-500"
                        : plan.isPopular
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow"
                        : "bg-slate-800 hover:bg-slate-700 text-white"
                    }`}
                  >
                    {isCurrent ? "Active" : subscribingCode === plan.code ? "Upgrading..." : "Select"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
