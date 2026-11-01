"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  Play,
  Pause,
  AlertTriangle,
  Sliders,
  Plus,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  X,
  Zap,
  Activity,
  Layers
} from "lucide-react";

export function BotsModule() {
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Edit Bot Parameter Modal
  const [editingBot, setEditingBot] = useState<any | null>(null);
  const [allocation, setAllocation] = useState("");
  const [maxDailyLoss, setMaxDailyLoss] = useState("");
  const [takeProfitPct, setTakeProfitPct] = useState("");
  const [stopLossPct, setStopLossPct] = useState("");

  // Create Bot Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newBotName, setNewBotName] = useState("");
  const [newBotStrategy, setNewBotStrategy] = useState("30-Agent Consensus");
  const [newBotSymbol, setNewBotSymbol] = useState("RELIANCE");
  const [newBotExchange, setNewBotExchange] = useState("Angel One (NSE)");
  const [newBotAllocation, setNewBotAllocation] = useState("75000");

  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchBots = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bots?status=${statusFilter}`);
      const data = await res.json();
      if (data.bots) {
        setBots(data.bots);
      }
    } catch (e) {
      console.error("Failed to fetch bots", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, [statusFilter]);

  const handleToggleBot = async (botId: number) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/bots", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId, action: "TOGGLE_STATUS" }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Bot status updated to ${data.bot.status}`);
        fetchBots();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmergencyStop = async (botId: number, currentStopped: boolean) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/bots", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId,
          action: currentStopped ? "RESUME" : "EMERGENCY_STOP",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Emergency state updated for Bot #${botId}`);
        fetchBots();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBot) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/bots", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId: editingBot.id,
          allocation,
          maxDailyLoss,
          takeProfitPct,
          stopLossPct,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Parameters updated for ${editingBot.name}`);
        setEditingBot(null);
        fetchBots();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBotName,
          strategy: newBotStrategy,
          symbol: newBotSymbol,
          exchange: newBotExchange,
          allocation: newBotAllocation,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Bot '${newBotName}' deployed successfully.`);
        setIsCreateOpen(false);
        setNewBotName("");
        fetchBots();
      } else {
        alert(data.error || "Failed to create bot");
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1630] border border-slate-800 p-4 rounded-2xl">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-400" />
            <span>AI Trading Bot Engine & Automation Cockpit</span>
          </h3>
          <p className="text-xs text-slate-400">
            Monitor real-time quantitative bots, adjust risk allocations, and enforce emergency kill-switches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 font-mono"
          >
            <option value="ALL">All Bot Statuses</option>
            <option value="ACTIVE">Active Bots Only</option>
            <option value="PAUSED">Paused Bots Only</option>
            <option value="STOPPED">Halted / Stopped</option>
          </select>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Deploy New Bot</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Bots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-400 text-xs">
            Loading AI Bot Engine Fleet...
          </div>
        ) : bots.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-slate-400 text-xs">
            No bots found matching status.
          </div>
        ) : (
          bots.map((bot) => {
            const isActive = bot.status === "ACTIVE" && !bot.emergencyStopped;
            const isHalted = bot.emergencyStopped;

            return (
              <div
                key={bot.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isHalted
                    ? "bg-[#0d1630] border-rose-500/50 shadow-lg shadow-rose-500/10"
                    : isActive
                    ? "bg-[#0d1630] border-slate-800 hover:border-blue-500/60"
                    : "bg-[#0d1630]/60 border-slate-800/80 opacity-80"
                }`}
              >
                <div>
                  {/* Top Bar: Name, Status Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-white text-sm">{bot.name}</span>
                      </div>
                      <span className="text-[10px] text-blue-400 font-mono font-bold">
                        {bot.symbol} • {bot.exchange}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      isHalted
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                        : isActive
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}>
                      ● {isHalted ? "EMERGENCY HALT" : bot.status}
                    </span>
                  </div>

                  {/* Strategy & Metrics */}
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 my-3 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Strategy:</span>
                      <span className="text-white font-medium truncate max-w-[160px]">{bot.strategy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Trades:</span>
                      <span className="font-mono text-slate-200">{bot.totalTrades} Executions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Win Rate:</span>
                      <span className="font-mono font-bold text-emerald-400">{bot.winRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Simulated Net P&L:</span>
                      <span className={`font-mono font-extrabold ${Number(bot.totalPnl) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {Number(bot.totalPnl) >= 0 ? "+" : ""}₹{Number(bot.totalPnl).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Parameters Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 mb-4">
                    <div className="bg-slate-900/60 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">Allocation</span>
                      <span className="font-bold text-white">₹{Number(bot.allocation).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">Max Daily Loss</span>
                      <span className="font-bold text-rose-400">₹{Number(bot.maxDailyLoss).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">Target TP</span>
                      <span className="font-bold text-emerald-400">+{bot.takeProfitPct}%</span>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-500 block">Stop SL</span>
                      <span className="font-bold text-rose-400">-{bot.stopLossPct}%</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions: Toggle Pause/Play, Tune Params, Emergency Stop */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-1.5 text-xs">
                  <button
                    onClick={() => handleToggleBot(bot.id)}
                    disabled={actionLoading || isHalted}
                    className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1 transition ${
                      isActive
                        ? "bg-slate-800 hover:bg-slate-700 text-amber-300"
                        : "bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300"
                    }`}
                  >
                    {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isActive ? "Pause" : "Activate"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingBot(bot);
                      setAllocation(String(bot.allocation));
                      setMaxDailyLoss(String(bot.maxDailyLoss));
                      setTakeProfitPct(String(bot.takeProfitPct));
                      setStopLossPct(String(bot.stopLossPct));
                    }}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                    title="Tune Parameters"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleEmergencyStop(bot.id, isHalted)}
                    disabled={actionLoading}
                    className={`p-1.5 rounded-xl transition ${
                      isHalted
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                        : "bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white"
                    }`}
                    title={isHalted ? "Resume from emergency halt" : "Emergency Kill Switch"}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tune Parameters Modal */}
      {editingBot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-md p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Tune Bot Parameters</h3>
                <span className="text-xs text-blue-400 font-mono">{editingBot.name}</span>
              </div>
              <button
                onClick={() => setEditingBot(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Simulated Capital Allocation (INR)</label>
                <input
                  type="number"
                  step="5000"
                  required
                  value={allocation}
                  onChange={(e) => setAllocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Max Daily Drawdown Loss (INR)</label>
                <input
                  type="number"
                  step="1000"
                  required
                  value={maxDailyLoss}
                  onChange={(e) => setMaxDailyLoss(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Take Profit (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={takeProfitPct}
                    onChange={(e) => setTakeProfitPct(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Stop Loss (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={stopLossPct}
                    onChange={(e) => setStopLossPct(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs mt-3 transition shadow-md shadow-blue-600/30"
              >
                {actionLoading ? "Applying Changes..." : "Save Bot Parameters"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Deploy New Bot Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-md p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-400" />
                <span>Deploy New AI Trading Bot</span>
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Bot Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INFY Alpha Scalper"
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Trading Strategy</label>
                <select
                  value={newBotStrategy}
                  onChange={(e) => setNewBotStrategy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                >
                  <option value="30-Agent Consensus">30-Agent Consensus Engine</option>
                  <option value="NSE 9:15 OI Surge">NSE 9:15 AM Open Interest Surge</option>
                  <option value="VWAP Institutional Scalper">VWAP Institutional Scalper</option>
                  <option value="Astro-Technical Confluence">Astro-Technical Rashi Confluence</option>
                  <option value="Mean Reversion Keltner">Mean Reversion Keltner Squeeze</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Asset Symbol</label>
                  <input
                    type="text"
                    required
                    placeholder="INFY or BTC/USDT"
                    value={newBotSymbol}
                    onChange={(e) => setNewBotSymbol(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Exchange</label>
                  <select
                    value={newBotExchange}
                    onChange={(e) => setNewBotExchange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  >
                    <option value="Angel One (NSE)">Angel One (NSE)</option>
                    <option value="Delta Exchange">Delta Exchange</option>
                    <option value="Forex / Commodities">Forex / Commodities</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Simulated Allocation (INR)</label>
                <input
                  type="number"
                  step="5000"
                  required
                  value={newBotAllocation}
                  onChange={(e) => setNewBotAllocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-white"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs mt-3 transition shadow-md shadow-purple-600/30"
              >
                {actionLoading ? "Deploying Bot..." : "Deploy & Activate Bot"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
