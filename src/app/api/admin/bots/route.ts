import { NextResponse } from "next/server";
import { db } from "@/db";
import { tradingBots, auditLogs, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";

    let bots = await db.select().from(tradingBots).orderBy(desc(tradingBots.createdAt));

    if (status !== "ALL") {
      bots = bots.filter(b => b.status === status);
    }

    return NextResponse.json({
      success: true,
      bots,
      total: bots.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch bots" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { 
      name, 
      strategy, 
      symbol, 
      exchange = "Angel One (NSE)",
      allocation = "50000.00", 
      maxDailyLoss = "5000.00", 
      takeProfitPct = "3.50", 
      stopLossPct = "1.50",
      userId = 1
    } = body;

    if (!name || !strategy || !symbol) {
      return NextResponse.json({ error: "Name, strategy, and symbol are required" }, { status: 400 });
    }

    const [newBot] = await db.insert(tradingBots).values({
      userId: Number(userId),
      name: name.trim(),
      strategy,
      symbol: symbol.toUpperCase().trim(),
      exchange,
      allocation: Number(allocation).toFixed(2),
      maxDailyLoss: Number(maxDailyLoss).toFixed(2),
      takeProfitPct: Number(takeProfitPct).toFixed(2),
      stopLossPct: Number(stopLossPct).toFixed(2),
      status: "ACTIVE",
      emergencyStopped: false,
      totalTrades: 0,
      winRate: "70.00",
      totalPnl: "0.00",
    }).returning();

    // Audit log
    await db.insert(auditLogs).values({
      action: "BOT_CREATED",
      targetEntity: "TradingBot",
      targetId: String(newBot.id),
      details: { name, strategy, symbol, allocation },
      adminEmail: admin.email,
    });

    return NextResponse.json({
      success: true,
      bot: newBot,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create trading bot" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { 
      botId, 
      action, // "TOGGLE_STATUS", "EMERGENCY_STOP", "RESUME", "UPDATE_CONFIG", "EMERGENCY_STOP_ALL"
      status, 
      allocation, 
      maxDailyLoss, 
      takeProfitPct, 
      stopLossPct
    } = body;

    if (action === "EMERGENCY_STOP_ALL") {
      await db.update(tradingBots).set({
        status: "STOPPED",
        emergencyStopped: true,
      });

      await db.insert(auditLogs).values({
        action: "BOT_EMERGENCY_STOP_ALL",
        targetEntity: "TradingBot",
        targetId: "ALL",
        details: { reason: "Platform-wide emergency kill switch activated by administrator" },
        adminEmail: admin.email,
      });

      return NextResponse.json({
        success: true,
        message: "All trading bots have been immediately halted.",
      });
    }

    if (!botId) {
      return NextResponse.json({ error: "botId is required" }, { status: 400 });
    }

    const [targetBot] = await db.select().from(tradingBots).where(eq(tradingBots.id, Number(botId))).limit(1);
    if (!targetBot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    const updateFields: any = {};

    if (action === "EMERGENCY_STOP") {
      updateFields.status = "STOPPED";
      updateFields.emergencyStopped = true;
    } else if (action === "RESUME") {
      updateFields.status = "ACTIVE";
      updateFields.emergencyStopped = false;
    } else if (action === "TOGGLE_STATUS") {
      updateFields.status = targetBot.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    }

    if (allocation) updateFields.allocation = Number(allocation).toFixed(2);
    if (maxDailyLoss) updateFields.maxDailyLoss = Number(maxDailyLoss).toFixed(2);
    if (takeProfitPct) updateFields.takeProfitPct = Number(takeProfitPct).toFixed(2);
    if (stopLossPct) updateFields.stopLossPct = Number(stopLossPct).toFixed(2);
    if (status && !action) updateFields.status = status;

    const [updatedBot] = await db
      .update(tradingBots)
      .set(updateFields)
      .where(eq(tradingBots.id, Number(botId)))
      .returning();

    await db.insert(auditLogs).values({
      action: action || "BOT_CONFIG_UPDATED",
      targetEntity: "TradingBot",
      targetId: String(botId),
      details: { botName: targetBot.name, changes: updateFields },
      adminEmail: admin.email,
    });

    return NextResponse.json({
      success: true,
      bot: updatedBot,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update trading bot" }, { status: 500 });
  }
}
