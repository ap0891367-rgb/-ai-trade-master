import { NextResponse } from "next/server";
import { db } from "@/db";
import { 
  users, 
  tradingBots, 
  demoOrders, 
  trades, 
  walletTransactions, 
  auditLogs, 
  marketDataProviders, 
  platformConfig,
  supportTickets,
  kycRecords
} from "@/db/schema";
import { ensureAdminSeeded } from "@/lib/adminSeed";
import { eq, desc, sql } from "drizzle-orm";

export async function GET() {
  try {
    await ensureAdminSeeded();

    // 1. User Metrics
    const allUsers = await db.select().from(users);
    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter(u => u.status === "ACTIVE").length;
    const verifiedKyc = allUsers.filter(u => u.kycStatus === "VERIFIED").length;
    const totalWalletBalance = allUsers.reduce((acc, u) => acc + Number(u.walletBalance || 0), 0);

    // 2. Bot Metrics
    const allBots = await db.select().from(tradingBots);
    const totalBots = allBots.length;
    const activeBots = allBots.filter(b => b.status === "ACTIVE" && !b.emergencyStopped).length;
    const emergencyStoppedBots = allBots.filter(b => b.emergencyStopped).length;
    const totalBotPnl = allBots.reduce((acc, b) => acc + Number(b.totalPnl || 0), 0);
    const averageWinRate = allBots.length > 0 
      ? Number((allBots.reduce((acc, b) => acc + Number(b.winRate || 0), 0) / allBots.length).toFixed(1)) 
      : 70.0;

    // 3. Demo Orders & Trades
    const allOrders = await db.select().from(demoOrders);
    const filledOrders = allOrders.filter(o => o.status === "FILLED").length;
    const pendingOrders = allOrders.filter(o => o.status === "PENDING").length;

    const allTrades = await db.select().from(trades);
    const openTrades = allTrades.filter(t => t.status === "OPEN").length;
    const closedTrades = allTrades.filter(t => t.status === "CLOSED").length;
    const realizedPnl = allTrades.filter(t => t.status === "CLOSED").reduce((acc, t) => acc + Number(t.pnl || 0), 0);
    const unrealizedPnl = allTrades.filter(t => t.status === "OPEN").reduce((acc, t) => acc + Number(t.pnl || 0), 0);
    const totalSimulatedPnl = realizedPnl + unrealizedPnl + totalBotPnl;

    // 4. System Health & Providers
    const providers = await db.select().from(marketDataProviders);
    const connectedProviders = providers.filter(p => p.status === "CONNECTED").length;
    const avgLatency = providers.length > 0
      ? Math.round(providers.reduce((acc, p) => acc + p.latencyMs, 0) / providers.length)
      : 15;

    // 5. Open Tickets & Audit Events
    const tickets = await db.select().from(supportTickets);
    const openTickets = tickets.filter(t => t.status === "OPEN" || t.status === "IN_PROGRESS").length;

    const recentAuditLogs = await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(6);

    const recentOrders = await db
      .select()
      .from(demoOrders)
      .orderBy(desc(demoOrders.createdAt))
      .limit(6);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      kpis: {
        totalUsers,
        activeUsers,
        verifiedKyc,
        totalWalletBalance,
        totalBots,
        activeBots,
        emergencyStoppedBots,
        averageWinRate,
        totalOrders: allOrders.length,
        filledOrders,
        pendingOrders,
        openTrades,
        closedTrades,
        totalSimulatedPnl,
        unrealizedPnl,
        realizedPnl,
        openTickets,
        connectedProviders,
        totalProviders: providers.length,
        avgLatencyMs: avgLatency,
      },
      providers,
      recentAuditLogs,
      recentOrders,
      topBots: allBots.slice(0, 4),
    });
  } catch (err: any) {
    console.error("Admin overview error:", err);
    return NextResponse.json({ error: err.message || "Failed to load admin overview" }, { status: 500 });
  }
}
