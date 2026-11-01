import { NextResponse } from "next/server";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "ALL";

    let logs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(150);

    if (action !== "ALL") {
      logs = logs.filter(l => l.action.toLowerCase().includes(action.toLowerCase()));
    }

    return NextResponse.json({
      success: true,
      logs,
      total: logs.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch audit logs" }, { status: 500 });
  }
}
