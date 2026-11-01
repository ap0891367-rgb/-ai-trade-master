"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  ShieldCheck,
  Eye,
  FileText,
  Clock,
  X
} from "lucide-react";

export function KycModule() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/kyc");
      const data = await res.json();
      if (data.records) {
        setRecords(data.records);
      }
    } catch (e) {
      console.error("Failed to fetch KYC records", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleUpdateKyc = async (status: "VERIFIED" | "REJECTED") => {
    if (!selectedRecord) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/kyc", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId: selectedRecord.id,
          status,
          reviewerNotes: notes || `Compliance status marked ${status}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`KYC Record #${selectedRecord.id} updated to ${status}`);
        setSelectedRecord(null);
        setNotes("");
        fetchRecords();
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-[#0d1630] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <span>KYC & SEBI Paper-Trading Compliance Documentation</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                AUDITED
              </span>
            </h4>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Review mock customer identities, digital risk disclosure agreements, and compliance approvals.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl">
          Total Documents: {records.length}
        </span>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KYC Table */}
      <div className="bg-[#0d1630] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Trader Name / Email</th>
                <th className="p-3.5">Document Type</th>
                <th className="p-3.5">PAN / ID Masked</th>
                <th className="p-3.5">Risk Consent</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Reviewed Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">Loading compliance records...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">No KYC records on file.</td>
                </tr>
              ) : (
                records.map((r) => {
                  const isVerified = r.status === "VERIFIED";

                  return (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white text-xs">{r.userName || `User #${r.userId}`}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{r.userEmail}</div>
                      </td>

                      <td className="p-3.5 font-mono text-slate-300">{r.documentType || "PAN_CARD"}</td>

                      <td className="p-3.5 font-mono text-slate-200">
                        {r.panNumber || r.aadhaarMasked || "ABCDE1234F"}
                      </td>

                      <td className="p-3.5">
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Signed v3.2</span>
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isVerified ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                        }`}>
                          ● {r.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-[10px] text-slate-400 font-mono">
                        {r.verifiedAt ? new Date(r.verifiedAt).toLocaleDateString() : "Pending"}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedRecord(r);
                            setNotes(r.reviewerNotes || "");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 font-semibold text-xs border border-blue-500/30 transition"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-md p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Review Compliance Record</h3>
                <span className="text-xs text-blue-400 font-mono">{selectedRecord.userName}</span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">User Email:</span>
                <span className="text-white">{selectedRecord.userEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Document Type:</span>
                <span className="text-white">{selectedRecord.documentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Identification:</span>
                <span className="text-emerald-400 font-bold">{selectedRecord.panNumber || selectedRecord.aadhaarMasked}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SEBI Paper Trading Consent:</span>
                <span className="text-emerald-400">Confirmed (IP Logged)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Compliance Officer Notes:</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter review notes and audit justification..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handleUpdateKyc("REJECTED")}
                disabled={actionLoading}
                className="flex-1 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs transition"
              >
                Reject KYC
              </button>
              <button
                onClick={() => handleUpdateKyc("VERIFIED")}
                disabled={actionLoading}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/30"
              >
                Approve & Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
