import { NextResponse } from "next/server";
import { db } from "@/db";
import { notifications, users, auditLogs } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  try {
    const list = await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt))
      .limit(80);

    return NextResponse.json({
      success: true,
      notifications: list,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { title, message, type = "ADMIN_BROADCAST", targetUser = "ALL", symbol = "SYSTEM" } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    const allUsers = await db.select({ id: users.id }).from(users);

    const inserts = allUsers.map(u => ({
      userId: u.id,
      symbol,
      title,
      message,
      type,
      read: false,
      metadata: { broadcast: true, sentAt: new Date().toISOString() },
    }));

    if (inserts.length > 0) {
      await db.insert(notifications).values(inserts);
    }

    await db.insert(auditLogs).values({
      action: "ADMIN_BROADCAST_SENT",
      targetEntity: "Notification",
      targetId: "ALL_USERS",
      details: { title, recipientCount: inserts.length },
      adminEmail: admin.email,
    });

    return NextResponse.json({
      success: true,
      recipients: inserts.length,
      message: "Broadcast sent to all active demo traders",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to broadcast message" }, { status: 500 });
  }
}
