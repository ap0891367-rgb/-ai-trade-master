import { NextResponse } from "next/server";
import { db } from "@/db";
import { kycRecords, users, auditLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/session";

export async function GET() {
  try {
    const records = await db
      .select({
        id: kycRecords.id,
        userId: kycRecords.userId,
        userName: users.name,
        userEmail: users.email,
        panNumber: kycRecords.panNumber,
        aadhaarMasked: kycRecords.aadhaarMasked,
        documentType: kycRecords.documentType,
        status: kycRecords.status,
        riskConsentSigned: kycRecords.riskConsentSigned,
        paperTradingAgreementSigned: kycRecords.paperTradingAgreementSigned,
        reviewerNotes: kycRecords.reviewerNotes,
        verifiedAt: kycRecords.verifiedAt,
        createdAt: kycRecords.createdAt,
      })
      .from(kycRecords)
      .leftJoin(users, eq(kycRecords.userId, users.id))
      .orderBy(desc(kycRecords.createdAt));

    return NextResponse.json({
      success: true,
      records,
      total: records.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch KYC records" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { recordId, status, reviewerNotes } = body;

    if (!recordId || !status) {
      return NextResponse.json({ error: "recordId and status are required" }, { status: 400 });
    }

    const [updated] = await db
      .update(kycRecords)
      .set({
        status,
        reviewerNotes: reviewerNotes || `Status updated to ${status} by Compliance Officer`,
        verifiedAt: status === "VERIFIED" ? new Date() : null,
      })
      .where(eq(kycRecords.id, Number(recordId)))
      .returning();

    if (updated) {
      // Also update user kycStatus
      await db.update(users).set({ kycStatus: status }).where(eq(users.id, updated.userId));

      await db.insert(auditLogs).values({
        action: "KYC_STATUS_UPDATED",
        targetEntity: "KycRecord",
        targetId: String(recordId),
        details: { newStatus: status, reviewerNotes },
        adminEmail: admin.email,
      });
    }

    return NextResponse.json({
      success: true,
      record: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update KYC status" }, { status: 500 });
  }
}
