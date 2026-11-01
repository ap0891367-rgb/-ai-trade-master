import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, walletTransactions, auditLogs, trades, kycRecords } from "@/db/schema";
import { eq, desc, or, ilike } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import { requireAdmin } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const roleFilter = searchParams.get("role") || "";
    const statusFilter = searchParams.get("status") || "";

    let query = db.select().from(users);

    const allUsers = await query.orderBy(desc(users.createdAt));

    let filtered = allUsers;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) ||
        (u.phoneNumber && u.phoneNumber.toLowerCase().includes(q))
      );
    }

    if (roleFilter && roleFilter !== "ALL") {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    if (statusFilter && statusFilter !== "ALL") {
      filtered = filtered.filter(u => u.status === statusFilter);
    }

    // Sanitize password hashes
    const sanitized = filtered.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      kycStatus: u.kycStatus,
      phoneNumber: u.phoneNumber,
      walletBalance: Number(u.walletBalance),
      currency: u.currency,
      autoTradingEnabled: u.autoTradingEnabled,
      riskLevel: u.riskLevel,
      twoFactorEnabled: u.twoFactorEnabled,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({
      success: true,
      users: sanitized,
      total: sanitized.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { 
      name, 
      email, 
      password = "demoPassword123", 
      role = "TRADER", 
      status = "ACTIVE",
      walletBalance = "500000.00",
      phoneNumber = "",
      riskLevel = "MODERATE"
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });
    }

    const passwordHash = hashPassword(password);

    const [newUser] = await db.insert(users).values({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role,
      status,
      kycStatus: "VERIFIED",
      phoneNumber,
      walletBalance: Number(walletBalance).toFixed(2),
      riskLevel,
      autoTradingEnabled: false,
    }).returning();

    // Initial Ledger Entry
    await db.insert(walletTransactions).values({
      userId: newUser.id,
      type: "DEPOSIT",
      amount: Number(walletBalance).toFixed(2),
      description: "Initial virtual balance assigned by Administrator",
      adminNote: "Account creation allocation",
    });

    // Auto KYC record
    await db.insert(kycRecords).values({
      userId: newUser.id,
      documentType: "PAN_CARD",
      status: "VERIFIED",
      riskConsentSigned: true,
      paperTradingAgreementSigned: true,
      reviewerNotes: "Standard administrator onboarding",
    });

    // Audit Log
    await db.insert(auditLogs).values({
      action: "USER_CREATED",
      targetEntity: "User",
      targetId: String(newUser.id),
      details: { email: cleanEmail, role, walletBalance },
      adminEmail: "admin@autotrading.ai",
    });

    return NextResponse.json({
      success: true,
      user: newUser,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create user" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { userId, status, role, kycStatus, balanceAdjustment, adjustmentNote } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const [targetUser] = await db.select().from(users).where(eq(users.id, Number(userId))).limit(1);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateFields: any = {};
    if (status) updateFields.status = status;
    if (role) updateFields.role = role;
    if (kycStatus) updateFields.kycStatus = kycStatus;

    // Handle Balance adjustment
    let newBalance = Number(targetUser.walletBalance);
    if (balanceAdjustment !== undefined && Number(balanceAdjustment) !== 0) {
      const adjustmentAmount = Number(balanceAdjustment);
      newBalance = Math.max(0, newBalance + adjustmentAmount);
      updateFields.walletBalance = newBalance.toFixed(2);

      await db.insert(walletTransactions).values({
        userId: targetUser.id,
        type: adjustmentAmount >= 0 ? "ADMIN_CREDIT" : "ADMIN_DEBIT",
        amount: Math.abs(adjustmentAmount).toFixed(2),
        description: `Admin balance adjustment (${adjustmentAmount >= 0 ? "+" : "-"}₹${Math.abs(adjustmentAmount).toLocaleString("en-IN")})`,
        adminNote: adjustmentNote || "Administrative balance override",
      });
    }

    const [updated] = await db
      .update(users)
      .set(updateFields)
      .where(eq(users.id, Number(userId)))
      .returning();

    // Audit log
    await db.insert(auditLogs).values({
      action: "USER_UPDATED",
      targetEntity: "User",
      targetId: String(userId),
      details: { changes: updateFields, targetEmail: targetUser.email, note: adjustmentNote },
      adminEmail: admin.email,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        status: updated.status,
        kycStatus: updated.kycStatus,
        walletBalance: Number(updated.walletBalance),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update user" }, { status: 500 });
  }
}
