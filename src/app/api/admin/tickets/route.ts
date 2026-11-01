import { NextResponse } from "next/server";
import { db } from "@/db";
import { supportTickets, users, auditLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  try {
    const tickets = await db
      .select({
        id: supportTickets.id,
        ticketNumber: supportTickets.ticketNumber,
        userId: supportTickets.userId,
        userName: users.name,
        userEmail: users.email,
        subject: supportTickets.subject,
        category: supportTickets.category,
        priority: supportTickets.priority,
        status: supportTickets.status,
        userMessage: supportTickets.userMessage,
        adminResponse: supportTickets.adminResponse,
        createdAt: supportTickets.createdAt,
        updatedAt: supportTickets.updatedAt,
      })
      .from(supportTickets)
      .leftJoin(users, eq(supportTickets.userId, users.id))
      .orderBy(desc(supportTickets.createdAt));

    return NextResponse.json({
      success: true,
      tickets,
      total: tickets.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch support tickets" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { ticketId, status, adminResponse } = body;

    if (!ticketId) {
      return NextResponse.json({ error: "ticketId is required" }, { status: 400 });
    }

    const updateFields: any = { updatedAt: new Date() };
    if (status) updateFields.status = status;
    if (adminResponse !== undefined) updateFields.adminResponse = adminResponse;

    const [updated] = await db
      .update(supportTickets)
      .set(updateFields)
      .where(eq(supportTickets.id, Number(ticketId)))
      .returning();

    await db.insert(auditLogs).values({
      action: "SUPPORT_TICKET_UPDATED",
      targetEntity: "SupportTicket",
      targetId: String(ticketId),
      details: { status, adminResponse },
      adminEmail: admin.email,
    });

    return NextResponse.json({
      success: true,
      ticket: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update ticket" }, { status: 500 });
  }
}
