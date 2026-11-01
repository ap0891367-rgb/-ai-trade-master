import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, walletTransactions, trades } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/session";

const MAX_DEPOSIT = 10_000_000;

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const userId = session.id;

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const txs = await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, userId))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(30);

    const userTrades = await db.select().from(trades).where(eq(trades.userId, userId));

    const openTrades = userTrades.filter((t) => t.status === "OPEN");
    const investedAmount = openTrades.reduce((acc, t) => acc + Number(t.investedAmount), 0);
    const unrealizedPnl = openTrades.reduce((acc, t) => acc + Number(t.pnl || 0), 0);
    const closedTrades = userTrades.filter((t) => t.status === "CLOSED");
    const realizedPnl = closedTrades.reduce((acc, t) => acc + Number(t.pnl || 0), 0);

    const totalPortfolioValue = Number(user.walletBalance) + investedAmount + unrealizedPnl;

    return NextResponse.json({
      success: true,
      wallet: {
        balance: Number(user.walletBalance),
        currency: user.currency,
        investedAmount,
        unrealizedPnl,
        realizedPnl,
        totalPortfolioValue,
        openPositionsCount: openTrades.length,
        closedPositionsCount: closedTrades.length,
        transactions: txs,
      },
    });
  } catch (err: unknown) {
    console.error("Wallet GET error:", err);
    return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const userId = session.id;

    const body = await req.json();
    const { action, amount } = body;

    if (!["DEPOSIT", "WITHDRAW", "RESET"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const requestedAmount = Number(amount ?? 100000);
    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0 || requestedAmount > MAX_DEPOSIT) {
      return NextResponse.json(
        { error: `Amount must be between 1 and ${MAX_DEPOSIT}` },
        { status: 400 },
      );
    }

    const result = await db.transaction(async (tx) => {
      const [user] = await tx.select().from(users).where(eq(users.id, userId)).for("update").limit(1);
      if (!user) return { error: "User not found", status: 404 } as const;

      let newBalance = Number(user.walletBalance);
      let description = "";
      let txType = "DEPOSIT";

      if (action === "DEPOSIT") {
        newBalance += requestedAmount;
        description = `Demo wallet credited with ₹${requestedAmount.toLocaleString("en-IN")}`;
        txType = "DEPOSIT";
      } else if (action === "RESET") {
        newBalance = 500000;
        description = "Wallet balance reset to default ₹5,00,000";
        txType = "RESET";
      } else {
        if (newBalance < requestedAmount) {
          return { error: "Insufficient wallet balance", status: 400 } as const;
        }
        newBalance -= requestedAmount;
        description = `Demo wallet withdrawal ₹${requestedAmount.toLocaleString("en-IN")}`;
        txType = "WITHDRAW";
      }

      const [updatedUser] = await tx
        .update(users)
        .set({ walletBalance: newBalance.toFixed(2) })
        .where(eq(users.id, userId))
        .returning();

      await tx.insert(walletTransactions).values({
        userId,
        type: txType,
        amount: (action === "RESET" ? newBalance : requestedAmount).toFixed(2),
        description,
      });

      return { user: updatedUser, message: description };
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      walletBalance: Number(result.user.walletBalance),
      message: result.message,
    });
  } catch (err: unknown) {
    console.error("Wallet POST error:", err);
    return NextResponse.json({ error: "Failed to process wallet request" }, { status: 500 });
  }
}
