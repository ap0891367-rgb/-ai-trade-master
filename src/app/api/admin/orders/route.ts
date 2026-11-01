import { NextResponse } from "next/server";
import { db } from "@/db";
import { demoOrders, users, auditLogs, walletTransactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/session";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";
    const exchange = searchParams.get("exchange") || "ALL";

    let orders = await db.select().from(demoOrders).orderBy(desc(demoOrders.createdAt));

    if (status !== "ALL") {
      orders = orders.filter(o => o.status === status);
    }

    if (exchange !== "ALL") {
      orders = orders.filter(o => o.exchange.toLowerCase().includes(exchange.toLowerCase()));
    }

    return NextResponse.json({
      success: true,
      orders,
      total: orders.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch demo orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { 
      symbol, 
      side = "BUY", 
      quantity = "10.00", 
      orderType = "MARKET", 
      requestedPrice, 
      exchange = "Angel One (NSE)",
      userId = 1 
    } = body;

    if (!symbol || !requestedPrice) {
      return NextResponse.json({ error: "Symbol and price are required" }, { status: 400 });
    }

    const priceNum = Number(requestedPrice);
    const qtyNum = Number(quantity);
    // Add realistic 0.05% execution slippage for market orders
    const executedPrice = orderType === "MARKET" 
      ? (side === "BUY" ? priceNum * 1.0005 : priceNum * 0.9995).toFixed(2)
      : priceNum.toFixed(2);

    const [newOrder] = await db.insert(demoOrders).values({
      userId: Number(userId),
      symbol: symbol.toUpperCase().trim(),
      orderType,
      side,
      quantity: qtyNum.toFixed(2),
      requestedPrice: priceNum.toFixed(2),
      executedPrice,
      status: "FILLED",
      exchange,
    }).returning();

    return NextResponse.json({
      success: true,
      order: newOrder,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create order" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { orderId, action = "CANCEL" } = body;

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const [order] = await db.select().from(demoOrders).where(eq(demoOrders.id, Number(orderId))).limit(1);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(demoOrders)
      .set({ status: action === "CANCEL" ? "CANCELLED" : "REJECTED" })
      .where(eq(demoOrders.id, Number(orderId)))
      .returning();

    return NextResponse.json({
      success: true,
      order: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update order" }, { status: 500 });
  }
}
