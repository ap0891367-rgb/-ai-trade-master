import { NextResponse } from "next/server";
import { db } from "@/db";
import { backtestRuns, strategies } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const runs = await db
      .select()
      .from(backtestRuns)
      .where(eq(backtestRuns.userId, session.id))
      .orderBy(desc(backtestRuns.createdAt));

    const availableStrategies = await db.select().from(strategies);

    return NextResponse.json({ success: true, backtests: runs, strategies: availableStrategies });
  } catch (err: unknown) {
    console.error("Backtests GET error:", err);
    return NextResponse.json({ error: "Failed to fetch backtests" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const {
      strategyCode = "30-Agent Consensus",
      symbol = "RELIANCE",
      timeframe = "15m",
      initialCapital = 500000,
      startDate = "2026-01-01",
      endDate = "2026-09-30",
    } = body;

    const capital = Number(initialCapital);
    if (!Number.isFinite(capital) || capital <= 0 || capital > 100_000_000) {
      return NextResponse.json({ error: "Invalid initial capital" }, { status: 400 });
    }

    // Simulated backtest metrics for the demo strategies.
    let returnPct = 28.5;
    let winRate = 74.2;
    let totalTrades = 138;
    let sharpe = 2.45;
    let maxDd = 5.2;

    if (String(strategyCode).includes("OI")) {
      returnPct = 34.8;
      winRate = 77.6;
      totalTrades = 162;
      sharpe = 2.82;
      maxDd = 4.6;
    } else if (String(strategyCode).includes("VWAP")) {
      returnPct = 24.1;
      winRate = 69.8;
      totalTrades = 194;
      sharpe = 2.18;
      maxDd = 6.4;
    }

    const netProfit = (capital * returnPct) / 100;
    const finalCapital = capital + netProfit;

    const [newRun] = await db
      .insert(backtestRuns)
      .values({
        userId: session.id,
        strategyCode: String(strategyCode),
        symbol: String(symbol),
        timeframe: String(timeframe),
        startDate: String(startDate),
        endDate: String(endDate),
        initialCapital: capital.toFixed(2),
        finalCapital: finalCapital.toFixed(2),
        netProfit: netProfit.toFixed(2),
        netProfitPct: returnPct.toFixed(2),
        winRate: winRate.toFixed(2),
        totalTrades,
        sharpeRatio: sharpe.toFixed(2),
        maxDrawdownPct: maxDd.toFixed(2),
      })
      .returning();

    return NextResponse.json({ success: true, backtest: newRun });
  } catch (err: unknown) {
    console.error("Backtests POST error:", err);
    return NextResponse.json({ error: "Failed to execute backtest" }, { status: 500 });
  }
}
