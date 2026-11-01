import { NextResponse } from "next/server";
import { db } from "@/db";
import { trades, users, walletTransactions, notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/session";

const MAX_OPEN_TRADE_VALUE = 5_000_000;
const MAX_PRICE_DEVIATION = 0.25; // 25% vs the stored mark price

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const userTrades = await db
      .select()
      .from(trades)
      .where(eq(trades.userId, session.id))
      .orderBy(desc(trades.createdAt));

    return NextResponse.json({ success: true, trades: userTrades });
  } catch (err: unknown) {
    console.error("Trades GET error:", err);
    return NextResponse.json({ error: "Failed to fetch trades" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const userId = session.id;

    const body = await req.json();
    const {
      action,
      tradeId,
      symbol,
      companyName,
      side = "BUY",
      price,
      quantity,
      investedAmount,
      stopLoss,
      takeProfit,
      confidence = 85,
      astroVerdict = "Shubh Muhurat",
    } = body;

    if (action === "OPEN_TRADE") {
      const entryPrice = Number(price);
      if (!symbol || !Number.isFinite(entryPrice) || entryPrice <= 0) {
        return NextResponse.json({ error: "A valid symbol and price are required" }, { status: 400 });
      }
      if (!["BUY", "SELL"].includes(side)) {
        return NextResponse.json({ error: "Invalid side" }, { status: 400 });
      }

      const amountToInvest = Number(investedAmount ?? entryPrice * Number(quantity));
      if (!Number.isFinite(amountToInvest) || amountToInvest <= 0 || amountToInvest > MAX_OPEN_TRADE_VALUE) {
        return NextResponse.json({ error: "Invalid order value" }, { status: 400 });
      }

      const calculatedQty = Number(quantity ?? (amountToInvest / entryPrice).toFixed(2));
      if (!Number.isFinite(calculatedQty) || calculatedQty <= 0) {
        return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
      }

      const result = await db.transaction(async (tx) => {
        const [user] = await tx.select().from(users).where(eq(users.id, userId)).for("update").limit(1);
        if (!user) return { error: "User not found", status: 404 } as const;

        const currentBal = Number(user.walletBalance);
        if (currentBal < amountToInvest) {
          return { error: "Insufficient wallet balance to execute this trade", status: 400 } as const;
        }

        const newBal = (currentBal - amountToInvest).toFixed(2);
        await tx.update(users).set({ walletBalance: newBal }).where(eq(users.id, userId));

        await tx.insert(walletTransactions).values({
          userId,
          type: "TRADE_BUY",
          amount: amountToInvest.toFixed(2),
          description: `Bought ${calculatedQty} shares of ${symbol} @ ₹${entryPrice}`,
        });

        const [newTrade] = await tx
          .insert(trades)
          .values({
            userId,
            symbol,
            companyName: companyName || symbol,
            side,
            entryPrice: entryPrice.toFixed(2),
            currentPrice: entryPrice.toFixed(2),
            quantity: calculatedQty.toFixed(2),
            investedAmount: amountToInvest.toFixed(2),
            stopLoss: stopLoss ? Number(stopLoss).toFixed(2) : null,
            takeProfit: takeProfit ? Number(takeProfit).toFixed(2) : null,
            mainAgentConfidence: Number(confidence).toFixed(2),
            astroVerdict,
            status: "OPEN",
          })
          .returning();

        await tx.insert(notifications).values({
          userId,
          symbol,
          title: `✅ Trade Opened: ${symbol} (${calculatedQty} units)`,
          message: `Position entered at ₹${entryPrice}. Main Agent Confidence: ${confidence}%. Astro: ${astroVerdict}`,
          type: "BUY_ALERT",
          read: false,
        });

        return { trade: newTrade, newBalance: Number(newBal) };
      });

      if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }

      return NextResponse.json({ success: true, trade: result.trade, newBalance: result.newBalance });
    }

    if (action === "CLOSE_TRADE") {
      if (!tradeId) {
        return NextResponse.json({ error: "tradeId required for closing position" }, { status: 400 });
      }

      const result = await db.transaction(async (tx) => {
        const [existingTrade] = await tx.select().from(trades).where(eq(trades.id, Number(tradeId))).for("update").limit(1);
        if (!existingTrade || existingTrade.userId !== userId) {
          return { error: "Trade not found", status: 404 } as const;
        }
        if (existingTrade.status === "CLOSED") {
          return { error: "Trade is already closed", status: 400 } as const;
        }

        const markPrice = Number(existingTrade.currentPrice);
        const requestedExit = price === undefined || price === null ? markPrice : Number(price);
        if (!Number.isFinite(requestedExit) || requestedExit <= 0) {
          return { error: "Invalid exit price", status: 400 } as const;
        }
        if (markPrice > 0 && Math.abs(requestedExit - markPrice) / markPrice > MAX_PRICE_DEVIATION) {
          return { error: "Exit price deviates too far from the current mark price", status: 400 } as const;
        }

        const entryPriceVal = Number(existingTrade.entryPrice);
        const qty = Number(existingTrade.quantity);
        const invested = Number(existingTrade.investedAmount);

        const pnl =
          existingTrade.side === "BUY"
            ? (requestedExit - entryPriceVal) * qty
            : (entryPriceVal - requestedExit) * qty;
        const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;

        const [user] = await tx.select().from(users).where(eq(users.id, userId)).for("update").limit(1);
        if (!user) return { error: "User not found", status: 404 } as const;

        const returnedCapital = Math.max(0, invested + pnl);
        const newBal = (Number(user.walletBalance) + returnedCapital).toFixed(2);

        await tx.update(users).set({ walletBalance: newBal }).where(eq(users.id, userId));

        const [closedTrade] = await tx
          .update(trades)
          .set({
            status: "CLOSED",
            exitPrice: requestedExit.toFixed(2),
            pnl: pnl.toFixed(2),
            pnlPercent: pnlPercent.toFixed(2),
            closedAt: new Date(),
          })
          .where(eq(trades.id, existingTrade.id))
          .returning();

        await tx.insert(walletTransactions).values({
          userId,
          type: pnl >= 0 ? "TRADE_SELL_PROFIT" : "TRADE_SELL_LOSS",
          amount: returnedCapital.toFixed(2),
          description: `Exited ${existingTrade.symbol} @ ₹${requestedExit} (P&L: ${pnl >= 0 ? "+" : ""}₹${pnl.toFixed(2)})`,
        });

        await tx.insert(notifications).values({
          userId,
          symbol: existingTrade.symbol,
          title: `🏁 Position Exited: ${existingTrade.symbol} (${pnl >= 0 ? "Profit" : "Loss"}: ₹${pnl.toFixed(2)})`,
          message: `Exited at ₹${requestedExit}. Return: ${pnlPercent.toFixed(2)}%. Funds returned to wallet.`,
          type: pnl >= 0 ? "BUY_ALERT" : "SELL_ALERT",
          read: false,
        });

        return { trade: closedTrade, newBalance: Number(newBal) };
      });

      if ("error" in result) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }

      return NextResponse.json({ success: true, trade: result.trade, newBalance: result.newBalance });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    console.error("Trades POST error:", err);
    return NextResponse.json({ error: "Failed to process trade" }, { status: 500 });
  }
}
