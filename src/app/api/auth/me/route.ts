import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const [user] = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: Number(user.walletBalance),
        currency: user.currency,
        autoTradingEnabled: user.autoTradingEnabled,
        riskLevel: user.riskLevel,
        language: user.language,
        currentPlan: user.currentPlan,
      },
    });
  } catch (err: unknown) {
    console.error("me GET error:", err);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { autoTradingEnabled, riskLevel } = body;

    const updateFields: Partial<typeof users.$inferInsert> = {};
    if (typeof autoTradingEnabled === "boolean") updateFields.autoTradingEnabled = autoTradingEnabled;
    if (riskLevel === "CONSERVATIVE" || riskLevel === "MODERATE" || riskLevel === "AGGRESSIVE") {
      updateFields.riskLevel = riskLevel;
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const [updated] = await db
      .update(users)
      .set(updateFields)
      .where(eq(users.id, session.id))
      .returning();

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        walletBalance: Number(updated.walletBalance),
        currency: updated.currency,
        autoTradingEnabled: updated.autoTradingEnabled,
        riskLevel: updated.riskLevel,
      },
    });
  } catch (err: unknown) {
    console.error("me PATCH error:", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
