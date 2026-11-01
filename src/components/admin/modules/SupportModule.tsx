"use client";

import React, { useState, useEffect } from "react";
import {
  Headphones,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Send,
  User,
  X
} from "lucide-react";

export function SupportModule() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [responseMsg, setResponseMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tickets");
      const data = await res.json();
      if (data.tickets) {
        setTickets(data.tickets);
      }
    } catch (e) {
      console.error("Failed to fetch support tickets", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleUpdateTicket = async (ticketId: number, status: string, customResponse?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          status,
          adminResponse: customResponse || responseMsg || "Your query has been addressed by Support Desk.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Ticket #${ticketId} updated to ${status}`);
        setSelectedTicket(null);
        setResponseMsg("");
        fetchTickets();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (statusFilter === "ALL") return true;
    return t.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1630] border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-sm font-bold text-white">Customer Support & Algo Helpdesk</h3>
            <p className="text-xs text-slate-400">Triage user queries on 30-agent bot execution, virtual wallets, and market data.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 font-mono"
          >
            <option value="ALL">All Tickets ({tickets.length})</option>
            <option value="OPEN">Open Only</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Tickets List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading support tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">No support tickets found.</div>
        ) : (
          filteredTickets.map((t) => {
            const isResolved = t.status === "RESOLVED";
            const isOpen = t.status === "OPEN";

            return (
              <div
                key={t.id}
                className="p-5 rounded-2xl bg-[#0d1630] border border-slate-800 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-400">{t.ticketNumber}</span>
                    <h4 className="font-bold text-white text-sm">{t.subject}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      t.priority === "HIGH" || t.priority === "CRITICAL"
                        ? "bg-rose-500/20 text-rose-300"
                        : "bg-blue-500/20 text-blue-300"
                    }`}>
                      {t.priority}
                    </span>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isResolved
                        ? "bg-emerald-500/20 text-emerald-400"
                        : isOpen
                        ? "bg-rose-500/20 text-rose-400 animate-pulse"
                        : "bg-amber-500/20 text-amber-400"
                    }`}>
                      ● {t.status}
                    </span>
                  </div>
                </div>

                {/* User Message */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-xs text-slate-200">
                  <div className="text-[10px] text-slate-500 font-mono mb-1 flex items-center justify-between">
                    <span>From: {t.userName || `User #${t.userId}`} ({t.userEmail})</span>
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p>{t.userMessage}</p>
                </div>

                {/* Admin Response if present */}
                {t.adminResponse && (
                  <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-200">
                    <div className="text-[10px] text-blue-400 font-bold mb-1">
                      Support Executive Response:
                    </div>
                    <p>{t.adminResponse}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedTicket(t);
                      setResponseMsg(t.adminResponse || "");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-sm"
                  >
                    Reply / Update Status
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-lg p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Reply to {selectedTicket.ticketNumber}</h3>
                <span className="text-xs text-slate-400">{selectedTicket.subject}</span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <strong className="text-white block mb-1">User Query:</strong>
              {selectedTicket.userMessage}
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Support Executive Response:</label>
              <textarea
                rows={4}
                required
                value={responseMsg}
                onChange={(e) => setResponseMsg(e.target.value)}
                placeholder="Type your official helpdesk response..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleUpdateTicket(selectedTicket.id, "IN_PROGRESS")}
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Mark In Progress
              </button>
              <button
                onClick={() => handleUpdateTicket(selectedTicket.id, "RESOLVED")}
                disabled={actionLoading}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
              >
                Submit Response & Resolve Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
