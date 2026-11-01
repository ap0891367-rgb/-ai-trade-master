import { NextResponse } from "next/server";
import { db } from "@/db";
import { walletTransactions, users, auditLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "ALL";

    const ledger = await db
      .select({
        id: walletTransactions.id,
        userId: walletTransactions.userId,
        userName: users.name,
        userEmail: users.email,
        type: walletTransactions.type,
        amount: walletTransactions.amount,
        description: walletTransactions.description,
        adminNote: walletTransactions.adminNote,
        createdAt: walletTransactions.createdAt,
      })
      .from(walletTransactions)
      .leftJoin(users, eq(walletTransactions.userId, users.id))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(100);

    let filtered = ledger;
    if (type !== "ALL") {
      filtered = filtered.filter(t => t.type === type);
    }

    return NextResponse.json({
      success: true,
      transactions: filtered,
      total: filtered.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch wallet transactions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { userId, type = "ADMIN_CREDIT", amount, description, adminNote } = body;

    if (!userId || !amount) {
      return NextResponse.json({ error: "userId and amount are required" }, { status: 400 });
    }

    const amtNum = Number(amount);
    if (!Number.isFinite(amtNum) || amtNum <= 0 || amtNum > 100_000_000) {
      return NextResponse.json({ error: "Amount must be between 1 and 100000000" }, { status: 400 });
    }

    const result = await db.transaction(async (trx) => {
      const [targetUser] = await trx
        .select()
        .from(users)
        .where(eq(users.id, Number(userId)))
        .for("update")
        .limit(1);
      if (!targetUser) return { error: "User not found", status: 404 } as const;

      let newBal = Number(targetUser.walletBalance);

      if (type === "ADMIN_CREDIT" || type === "DEPOSIT") {
        newBal += amtNum;
      } else if (type === "ADMIN_DEBIT" || type === "WITHDRAW") {
        if (newBal < amtNum) return { error: "Insufficient wallet balance", status: 400 } as const;
        newBal -= amtNum;
      } else if (type === "RESET") {
        newBal = amtNum;
      } else {
        return { error: "Invalid wallet transaction type", status: 400 } as const;
      }

      await trx.update(users).set({ walletBalance: newBal.toFixed(2) }).where(eq(users.id, targetUser.id));

      const [tx] = await trx
        .insert(walletTransactions)
        .values({
          userId: targetUser.id,
          type,
          amount: amtNum.toFixed(2),
          description: description || `Admin virtual adjustment: ${type}`,
          adminNote: adminNote || "Administrative balance override",
        })
        .returning();

      await trx.insert(auditLogs).values({
        action: "WALLET_MANUAL_ADJUSTMENT",
        targetEntity: "WalletTransaction",
        targetId: String(tx.id),
        details: { userId: targetUser.id, type, amount: amtNum, newBalance: newBal, adminNote },
        adminEmail: admin.email,
      });

      return { transaction: tx, newBalance: newBal };
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      transaction: result.transaction,
      newBalance: result.newBalance,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to adjust wallet" }, { status: 500 });
  }
}
