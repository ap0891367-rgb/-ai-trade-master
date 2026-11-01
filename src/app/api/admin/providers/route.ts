import { NextResponse } from "next/server";
import { db } from "@/db";
import { marketDataProviders, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  try {
    const providers = await db.select().from(marketDataProviders);
    return NextResponse.json({
      success: true,
      providers,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch market data providers" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { providerId, status, latencyMs } = body;

    if (!providerId) {
      return NextResponse.json({ error: "providerId is required" }, { status: 400 });
    }

    const updateFields: any = { lastTickAt: new Date() };
    if (status) updateFields.status = status;
    if (latencyMs !== undefined) updateFields.latencyMs = Number(latencyMs);

    const [updated] = await db
      .update(marketDataProviders)
      .set(updateFields)
      .where(eq(marketDataProviders.id, Number(providerId)))
      .returning();

    return NextResponse.json({
      success: true,
      provider: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update provider" }, { status: 500 });
  }
}
