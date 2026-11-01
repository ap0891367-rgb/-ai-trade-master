"use client";

import React, { useState, useEffect } from "react";
import {
  ListOrdered,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  XCircle,
  Clock,
  X
} from "lucide-react";

export function OrdersModule() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [exchangeFilter, setExchangeFilter] = useState("ALL");

  // Place order modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [symbol, setSymbol] = useState("RELIANCE");
  const [side, setSide] = useState("BUY");
  const [orderType, setOrderType] = useState("MARKET");
  const [quantity, setQuantity] = useState("20");
  const [requestedPrice, setRequestedPrice] = useState("2945.00");
  const [exchange, setExchange] = useState("Angel One (NSE)");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?status=${statusFilter}&exchange=${exchangeFilter}`);
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (e) {
      console.error("Failed to fetch orders", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, exchangeFilter]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          side,
          orderType,
          quantity,
          requestedPrice,
          exchange,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Simulated ${side} order placed for ${quantity} units of ${symbol}`);
        setIsModalOpen(false);
        fetchOrders();
      } else {
        alert(data.error || "Failed to place order");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "CANCEL" }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Order #${orderId} cancelled.`);
        fetchOrders();
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1630] border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Simulated Demo Order Book</h3>
            <p className="text-xs text-slate-400">Real-time matching engine simulation with slippage calculation</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 font-mono"
          >
            <option value="ALL">All Order Statuses</option>
            <option value="FILLED">Filled Executions</option>
            <option value="PENDING">Pending Limit Orders</option>
            <option value="CANCELLED">Cancelled Orders</option>
          </select>

          <select
            value={exchangeFilter}
            onChange={(e) => setExchangeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 font-mono"
          >
            <option value="ALL">All Exchanges</option>
            <option value="Angel">Angel One (NSE)</option>
            <option value="Delta">Delta Exchange</option>
            <option value="Forex">Forex / Commodities</option>
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Place Test Order</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-[#0d1630] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Order ID / Asset</th>
                <th className="p-3.5">Side</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Quantity</th>
                <th className="p-3.5">Req. Price</th>
                <th className="p-3.5">Exec. Price</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Exchange</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">Loading order executions...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">No orders found matching filter.</td>
                </tr>
              ) : (
                orders.map((o) => {
                  const isBuy = o.side === "BUY";
                  const isFilled = o.status === "FILLED";
                  const isPending = o.status === "PENDING";

                  return (
                    <tr key={o.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white text-xs">{o.symbol}</div>
                        <div className="text-[10px] text-slate-500 font-mono">ORD-00{o.id}</div>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          isBuy ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                        }`}>
                          {o.side}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono text-slate-300">{o.orderType}</td>

                      <td className="p-3.5 font-mono font-bold text-white">{o.quantity}</td>

                      <td className="p-3.5 font-mono text-slate-300">₹{o.requestedPrice}</td>

                      <td className="p-3.5 font-mono font-bold text-emerald-400">
                        {o.executedPrice ? `₹${o.executedPrice}` : "—"}
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isFilled
                            ? "bg-emerald-500/20 text-emerald-300"
                            : isPending
                            ? "bg-amber-500/20 text-amber-300 animate-pulse"
                            : "bg-slate-800 text-slate-400"
                        }`}>
                          {o.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-400 font-mono text-[11px]">{o.exchange}</td>

                      <td className="p-3.5 text-right">
                        {isPending && (
                          <button
                            onClick={() => handleCancelOrder(o.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-[11px] font-semibold transition"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Place Test Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-md p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-blue-400" />
                <span>Place Simulated Test Order</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Asset Symbol</label>
                  <input
                    type="text"
                    required
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Order Side</label>
                  <select
                    value={side}
                    onChange={(e) => setSide(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Order Type</label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  >
                    <option value="MARKET">MARKET</option>
                    <option value="LIMIT">LIMIT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Price (INR / USD)</label>
                <input
                  type="number"
                  step="0.05"
                  required
                  value={requestedPrice}
                  onChange={(e) => setRequestedPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Exchange Feed</label>
                <select
                  value={exchange}
                  onChange={(e) => setExchange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                >
                  <option value="Angel One (NSE)">Angel One (NSE)</option>
                  <option value="Delta Exchange">Delta Exchange</option>
                  <option value="Forex / Commodities">Forex / Commodities</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs mt-3 transition shadow-md shadow-blue-600/30"
              >
                {actionLoading ? "Executing..." : "Execute Simulated Order"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
