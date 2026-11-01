import { NextResponse } from "next/server";
import { db } from "@/db";
import { platformConfig, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  try {
    const configs = await db.select().from(platformConfig);
    return NextResponse.json({
      success: true,
      configs,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch platform configuration" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "key and value are required" }, { status: 400 });
    }

    const [updated] = await db
      .update(platformConfig)
      .set({ value: String(value), updatedAt: new Date() })
      .where(eq(platformConfig.key, key))
      .returning();

    await db.insert(auditLogs).values({
      action: "PLATFORM_CONFIG_UPDATED",
      targetEntity: "PlatformConfig",
      targetId: key,
      details: { key, newValue: value },
      adminEmail: admin.email,
    });

    return NextResponse.json({
      success: true,
      config: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update config" }, { status: 500 });
  }
}
