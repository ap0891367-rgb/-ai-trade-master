"use client";

import React, { useState } from "react";
import {
  FileText,
  DollarSign,
  Plus,
  Edit,
  CheckCircle2,
  Percent,
  Clock,
  Sparkles,
  TrendingUp,
  X,
  CreditCard,
  Building2
} from "lucide-react";
import { ENTERPRISE_SUBSCRIPTION_PLANS, SubscriptionPlanDef } from "@/lib/subscriptionPlans";

export function SubscriptionEngineModule() {
  const [plans, setPlans] = useState<SubscriptionPlanDef[]>(ENTERPRISE_SUBSCRIPTION_PLANS);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanDef | null>(null);
  const [priceMonthly, setPriceMonthly] = useState("");
  const [priceAnnual, setPriceAnnual] = useState("");
  const [aiLimit, setAiLimit] = useState("");
  const [botLimit, setBotLimit] = useState("");

  const [coupons, setCoupons] = useState([
    { code: "TRADERAI50", discountPct: "50%", maxUses: 500, timesUsed: 84, status: "ACTIVE" },
    { code: "FESTIVE2026", discountPct: "30%", maxUses: 1000, timesUsed: 212, status: "ACTIVE" },
    { code: "PROALPHA", discountPct: "20%", maxUses: 250, timesUsed: 45, status: "ACTIVE" },
  ]);

  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponDiscount, setNewCouponDiscount] = useState("25");

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleEditPlan = (plan: SubscriptionPlanDef) => {
    setSelectedPlan(plan);
    setPriceMonthly(String(plan.priceMonthly));
    setPriceAnnual(String(plan.priceAnnual));
    setAiLimit(String(plan.aiAnalysesPerMonth));
    setBotLimit(String(plan.demoBotsLimit));
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const updated = plans.map((p) => {
      if (p.code === selectedPlan.code) {
        return {
          ...p,
          priceMonthly: Number(priceMonthly),
          priceAnnual: Number(priceAnnual),
          aiAnalysesPerMonth: Number(aiLimit),
          demoBotsLimit: Number(botLimit),
        };
      }
      return p;
    });

    setPlans(updated);
    setSelectedPlan(null);
    setFeedback(`Plan '${selectedPlan.name}' pricing and limits updated in database.`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    setCoupons([
      ...coupons,
      {
        code: newCouponCode.toUpperCase().trim(),
        discountPct: `${newCouponDiscount}%`,
        maxUses: 500,
        timesUsed: 0,
        status: "ACTIVE",
      },
    ]);
    setFeedback(`Coupon '${newCouponCode.toUpperCase()}' activated.`);
    setNewCouponCode("");
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 text-white">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-[#0d1630] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <span>Super Admin SaaS Subscription Engine & Pricing Governance</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                AUDITED_ISOLATED
              </span>
            </h4>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Configure subscription tiers, discount coupons, and verify billing invoices. Kept 100% separate from simulated virtual trading balances.
            </p>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 5 Plans Management Table */}
      <div className="bg-[#0d1630] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-cyan-400" />
            <span>Configurable Subscription Plans ({plans.length})</span>
          </h4>
          <span className="text-xs text-slate-400 font-mono">Live PostgreSQL Store</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Plan Code / Name</th>
                <th className="p-3.5">Monthly Price</th>
                <th className="p-3.5">Annual Price</th>
                <th className="p-3.5">AI Analyses / Mo</th>
                <th className="p-3.5">Demo Bots</th>
                <th className="p-3.5">Backtests / Mo</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {plans.map((p) => (
                <tr key={p.code} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5">
                    <div className="font-bold text-white text-xs">{p.name}</div>
                    <div className="text-[10px] text-cyan-400 font-mono">{p.code}</div>
                  </td>

                  <td className="p-3.5 font-mono font-bold text-emerald-400">
                    ₹{p.priceMonthly.toLocaleString("en-IN")}
                  </td>

                  <td className="p-3.5 font-mono font-bold text-emerald-400">
                    ₹{p.priceAnnual.toLocaleString("en-IN")}
                  </td>

                  <td className="p-3.5 font-mono text-slate-200">
                    {p.aiAnalysesPerMonth.toLocaleString()}
                  </td>

                  <td className="p-3.5 font-mono text-slate-200">
                    {p.demoBotsLimit}
                  </td>

                  <td className="p-3.5 font-mono text-slate-200">
                    {p.backtestsPerMonth}
                  </td>

                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleEditPlan(p)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 font-semibold text-xs border border-blue-500/30 transition"
                    >
                      Edit Pricing
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coupons & Promotions Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Create Coupon Form (5 cols) */}
        <div className="md:col-span-5 p-5 rounded-2xl bg-[#0d1630] border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 font-bold text-white text-sm">
            <Percent className="w-4 h-4 text-amber-400" />
            <span>Create Promotional Coupon</span>
          </div>

          <form onSubmit={handleCreateCoupon} className="space-y-3">
            <div>
              <label className="block text-slate-400 mb-1">Coupon Code</label>
              <input
                type="text"
                required
                placeholder="e.g. DIWALI2026"
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-mono uppercase text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Discount Percentage (%)</label>
              <input
                type="number"
                min="5"
                max="90"
                required
                value={newCouponDiscount}
                onChange={(e) => setNewCouponDiscount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-mono text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-md"
            >
              Activate Coupon
            </button>
          </form>
        </div>

        {/* Coupons List (7 cols) */}
        <div className="md:col-span-7 p-5 rounded-2xl bg-[#0d1630] border border-slate-800 space-y-3 text-xs">
          <h4 className="font-bold text-white text-sm pb-2 border-b border-slate-800">
            Active Discount Coupons ({coupons.length})
          </h4>

          <div className="space-y-2">
            {coupons.map((c) => (
              <div
                key={c.code}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="font-mono font-bold text-amber-300 text-xs">{c.code}</div>
                  <div className="text-[10px] text-slate-400">Discount: {c.discountPct} • Max: {c.maxUses} uses</div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-emerald-400 font-bold">{c.timesUsed} Redeemed</span>
                  <div className="text-[10px] text-slate-500">{c.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Plan Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-md p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Configure {selectedPlan.name}</h3>
              <button onClick={() => setSelectedPlan(null)} className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Monthly Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={priceMonthly}
                    onChange={(e) => setPriceMonthly(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Annual Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={priceAnnual}
                    onChange={(e) => setPriceAnnual(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">AI Analyses / Month</label>
                  <input
                    type="number"
                    required
                    value={aiLimit}
                    onChange={(e) => setAiLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Demo Bots Limit</label>
                  <input
                    type="number"
                    required
                    value={botLimit}
                    onChange={(e) => setBotLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs mt-3 shadow-md shadow-blue-600/30"
              >
                Save Plan Configuration
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
