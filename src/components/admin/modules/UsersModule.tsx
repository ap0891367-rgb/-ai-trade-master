"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Shield,
  Edit,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Lock,
  ChevronDown,
  X,
  CreditCard
} from "lucide-react";

export function UsersModule() {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentNote, setAdjustmentNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New User Form State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("TRADER");
  const [newBalance, setNewBalance] = useState("500000");
  const [newPhone, setNewPhone] = useState("+91 98000 12345");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}&role=${roleFilter}&status=${statusFilter}`);
      const data = await res.json();
      if (data.users) {
        setUsersList(data.users);
      }
    } catch (e) {
      console.error("Failed to fetch users", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter]);

  const handleUpdateStatus = async (userId: number, newStatus: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`User status updated to ${newStatus}`);
        fetchUsers();
        if (selectedUser) setSelectedUser({ ...selectedUser, status: newStatus });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`User role changed to ${newRole}`);
        fetchUsers();
        if (selectedUser) setSelectedUser({ ...selectedUser, role: newRole });
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleBalanceAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !adjustmentAmount) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          balanceAdjustment: Number(adjustmentAmount),
          adjustmentNote: adjustmentNote || "Administrative manual credit/debit adjustment",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Adjusted ₹${adjustmentAmount} for ${selectedUser.name}`);
        setAdjustmentAmount("");
        setAdjustmentNote("");
        fetchUsers();
        setSelectedUser(null);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          role: newRole,
          walletBalance: newBalance,
          phoneNumber: newPhone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`User ${newName} created successfully.`);
        setIsAddModalOpen(false);
        setNewName("");
        setNewEmail("");
        fetchUsers();
      } else {
        alert(data.error || "Failed to create user");
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Controls: Search, Filter, Add User */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1630] border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="RISK_OFFICER">Risk Officer</option>
            <option value="COMPLIANCE_MANAGER">Compliance Manager</option>
            <option value="SUPPORT_EXECUTIVE">Support Executive</option>
            <option value="TRADER">Trader</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING_VERIFICATION">Pending</option>
            <option value="LOCKED">Locked</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-md shadow-blue-600/30"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-[#0d1630] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Registered Platform Accounts ({usersList.length})</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Real-time DB Sync</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">User / Contact</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">KYC Status</th>
                <th className="p-3.5">Virtual Balance</th>
                <th className="p-3.5">Risk Level</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">Loading user accounts...</td>
                </tr>
              ) : usersList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">No users found matching query.</td>
                </tr>
              ) : (
                usersList.map((u) => {
                  const isActive = u.status === "ACTIVE";
                  const isVerified = u.kycStatus === "VERIFIED";

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                        {u.phoneNumber && <div className="text-[10px] text-slate-500 font-mono">{u.phoneNumber}</div>}
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                          u.role === "SUPER_ADMIN"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : u.role === "RISK_OFFICER"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : u.role === "COMPLIANCE_MANAGER"
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                            : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/20 text-rose-400"
                        }`}>
                          ● {u.status}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isVerified ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                        }`}>
                          {u.kycStatus}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono font-bold text-emerald-400">
                        ₹{Number(u.walletBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-slate-300">
                        {u.riskLevel}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 font-semibold text-xs border border-blue-500/30 transition"
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Management & Balance Adjustment Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-lg p-6 text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-base font-bold text-white">{selectedUser.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">{selectedUser.email}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Account Quick Status Toggles */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Account Status</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleUpdateStatus(selectedUser.id, "ACTIVE")}
                    className={`flex-1 py-1 rounded-lg font-bold text-[11px] ${
                      selectedUser.status === "ACTIVE" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedUser.id, "SUSPENDED")}
                    className={`flex-1 py-1 rounded-lg font-bold text-[11px] ${
                      selectedUser.status === "SUSPENDED" ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    Suspend
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Assign Role</span>
                <select
                  value={selectedUser.role}
                  onChange={(e) => handleUpdateRole(selectedUser.id, e.target.value)}
                  className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                >
                  <option value="TRADER">Trader</option>
                  <option value="SUPPORT_EXECUTIVE">Support Executive</option>
                  <option value="COMPLIANCE_MANAGER">Compliance Manager</option>
                  <option value="RISK_OFFICER">Risk Officer</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
            </div>

            {/* Virtual Balance Adjustment Form */}
            <form onSubmit={handleBalanceAdjustment} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Virtual Balance Adjustment
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  Current: ₹{Number(selectedUser.walletBalance).toLocaleString("en-IN")}
                </span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Amount in INR (+ to credit, - to debit):
                </label>
                <input
                  type="number"
                  step="1000"
                  required
                  placeholder="+100000 or -50000"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Audit Reason (Mandatory for Compliance):
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Approved demo capital increase for testing"
                  value={adjustmentNote}
                  onChange={(e) => setAdjustmentNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                {actionLoading ? "Applying Adjustment..." : "Confirm Balance Adjustment"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-md p-6 text-white shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <span>Create New Platform Account</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Amitabh Sengupta"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="amitabh@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  >
                    <option value="TRADER">Trader</option>
                    <option value="SUPPORT_EXECUTIVE">Support Executive</option>
                    <option value="COMPLIANCE_MANAGER">Compliance Manager</option>
                    <option value="RISK_OFFICER">Risk Officer</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Initial Balance</label>
                  <select
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  >
                    <option value="200000">₹2,00,000</option>
                    <option value="500000">₹5,00,000 (Standard)</option>
                    <option value="1000000">₹10,00,000 (HNI)</option>
                    <option value="2500000">₹25,00,000</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98000 00000"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs mt-2 transition shadow-md shadow-blue-600/30"
              >
                {actionLoading ? "Creating Account..." : "Create Account & Credit Wallet"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
