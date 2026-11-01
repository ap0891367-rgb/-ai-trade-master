import { NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const items = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, session.id))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    return NextResponse.json({
      success: true,
      notifications: items,
      unreadCount: items.filter((n) => !n.read).length,
    });
  } catch (err: unknown) {
    console.error("Notifications GET error:", err);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const { notificationId, markAll = false } = body;

    if (markAll) {
      await db
        .update(notifications)
        .set({ read: true })
        .where(eq(notifications.userId, session.id));
    } else if (notificationId) {
      await db
        .update(notifications)
        .set({ read: true })
        .where(and(eq(notifications.id, Number(notificationId)), eq(notifications.userId, session.id)));
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Notifications PATCH error:", err);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
