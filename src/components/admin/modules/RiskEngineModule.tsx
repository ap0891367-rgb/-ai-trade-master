"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Zap,
  Activity,
  CheckCircle2,
  Lock,
  RotateCcw,
  Sliders,
  DollarSign
} from "lucide-react";

export function RiskEngineModule() {
  const [maxDailyLoss, setMaxDailyLoss] = useState("15000");
  const [maxPositionSize, setMaxPositionSize] = useState("100000");
  const [maxOpenPositions, setMaxOpenPositions] = useState("5");
  const [circuitHaltPct, setCircuitHaltPct] = useState("10.0");
  const [killSwitchActive, setKillSwitchActive] = useState(false);

  const [feedback, setFeedback] = useState<string | null>(null);

  const riskEvents = [
    { type: "MAX_DRAWDOWN_TRIGGER", severity: "CRITICAL", symbol: "BANKNIFTY", description: "Simulated intraday drawdown touched -4.8%. Position throttled.", timestamp: "10:14 AM" },
    { type: "CIRCUIT_LIMIT_WARNING", severity: "WARNING", symbol: "TATASTEEL", description: "Price move within 1.5% of upper circuit band. Auto-trail SL tightened.", timestamp: "11:32 AM" },
    { type: "HIGH_VOLATILITY_EXPANSION", severity: "INFO", symbol: "BTC/USDT", description: "Bollinger bandwidth expansion 3.8x. Strategy lot size adjusted down by 50%.", timestamp: "01:05 PM" },
  ];

  const handleSaveRisk = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback("Risk parameters and quantitative exposure limits updated.");
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 text-white">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-[#0d1630] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <span>Quantitative Risk Engine & Capital Preservation Circuit</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold">
                KILL_SWITCH_READY
              </span>
            </h4>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Enforces simulated daily loss limits, maximum drawdown halts, position exposure caps, and automated emergency bot pauses.
            </p>
          </div>
        </div>

        <button
          onClick={() => setKillSwitchActive(!killSwitchActive)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md ${
            killSwitchActive
              ? "bg-rose-600 text-white animate-pulse shadow-rose-600/30"
              : "bg-slate-800 text-rose-300 border border-rose-500/30 hover:bg-rose-950/40"
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>{killSwitchActive ? "GLOBAL KILL SWITCH ACTIVE" : "Arm Global Kill Switch"}</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Risk Parameters Form & Real-time Events */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Form (6 cols) */}
        <form onSubmit={handleSaveRisk} className="md:col-span-6 p-5 rounded-2xl bg-[#0d1630] border border-slate-800 space-y-4 text-xs">
          <h4 className="text-sm font-bold text-white pb-3 border-b border-slate-800">
            Automated Risk Limit Safeguards
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Max Daily Loss Cap (INR)</label>
              <input
                type="number"
                step="1000"
                required
                value={maxDailyLoss}
                onChange={(e) => setMaxDailyLoss(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-mono text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Max Single Position Size (INR)</label>
              <input
                type="number"
                step="5000"
                required
                value={maxPositionSize}
                onChange={(e) => setMaxPositionSize(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-mono text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Max Simultaneous Open Positions</label>
              <input
                type="number"
                min="1"
                max="25"
                required
                value={maxOpenPositions}
                onChange={(e) => setMaxOpenPositions(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-mono text-white"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Circuit Halt Threshold (%)</label>
              <input
                type="number"
                step="0.5"
                required
                value={circuitHaltPct}
                onChange={(e) => setCircuitHaltPct(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl font-mono text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30"
          >
            Apply Quantitative Risk Parameters
          </button>
        </form>

        {/* Right Event Trail (6 cols) */}
        <div className="md:col-span-6 p-5 rounded-2xl bg-[#0d1630] border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Real-Time Risk & Drawdown Events</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">SEBI Simulation Log</span>
          </div>

          <div className="space-y-2.5">
            {riskEvents.map((ev, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5"
              >
                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                  ev.severity === "CRITICAL" ? "bg-rose-500/20 text-rose-400" : "bg-amber-500/20 text-amber-400"
                }`}>
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-[11px] font-mono">{ev.type}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{ev.timestamp}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-0.5 leading-snug">{ev.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
