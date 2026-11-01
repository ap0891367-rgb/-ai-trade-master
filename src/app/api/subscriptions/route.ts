import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  subscriptionPlans,
  subscriptions,
  subscriptionInvoices,
  subscriptionCoupons,
  auditLogs,
  users,
} from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { ENTERPRISE_SUBSCRIPTION_PLANS } from "@/lib/subscriptionPlans";
import { getSession, requireAdmin } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();

    // Plans and active coupons are safe to show publicly (pricing page).
    let plans = await db.select().from(subscriptionPlans).orderBy(subscriptionPlans.id);
    if (plans.length === 0) {
      plans = ENTERPRISE_SUBSCRIPTION_PLANS.map((p, idx) => ({
        id: idx + 1,
        code: p.code,
        name: p.name,
        priceMonthly: p.priceMonthly.toString(),
        priceAnnual: p.priceAnnual.toString(),
        aiAnalysesPerMonth: p.aiAnalysesPerMonth,
        watchlistsLimit: p.watchlistsLimit,
        demoBotsLimit: p.demoBotsLimit,
        backtestsPerMonth: p.backtestsPerMonth,
        features: p.features,
        isPopular: !!p.isPopular,
        isActive: true,
      }));
    }

    const coupons = await db.select().from(subscriptionCoupons).where(eq(subscriptionCoupons.isActive, true));

    let userSubscription = null;
    let invoices: (typeof subscriptionInvoices.$inferSelect)[] = [];

    if (session) {
      const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.userId, session.id)).limit(1);
      userSubscription = sub ?? null;
      invoices = await db
        .select()
        .from(subscriptionInvoices)
        .where(eq(subscriptionInvoices.userId, session.id))
        .orderBy(desc(subscriptionInvoices.createdAt));
    }

    return NextResponse.json({
      success: true,
      plans,
      userSubscription,
      invoices,
      coupons,
    });
  } catch (err: unknown) {
    console.error("Subscriptions GET error:", err);
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const userId = session.id;

    const body = await req.json();
    const { planCode, billingCycle = "MONTHLY", couponCode } = body;

    if (!planCode || !["MONTHLY", "ANNUAL"].includes(billingCycle)) {
      return NextResponse.json({ error: "A valid plan and billing cycle are required" }, { status: 400 });
    }

    const plan = ENTERPRISE_SUBSCRIPTION_PLANS.find((p) => p.code === planCode);
    if (!plan) {
      return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
    }

    let price = billingCycle === "ANNUAL" ? plan.priceAnnual : plan.priceMonthly;
    let appliedCoupon: typeof subscriptionCoupons.$inferSelect | null = null;

    if (couponCode) {
      const code = String(couponCode).toUpperCase().trim();
      const [cp] = await db.select().from(subscriptionCoupons).where(eq(subscriptionCoupons.code, code)).limit(1);
      const today = new Date().toISOString().slice(0, 10);
      const exhausted = cp?.maxUses != null && (cp.timesUsed ?? 0) >= cp.maxUses;
      const expired = cp ? cp.validUntil < today : false;

      if (!cp || !cp.isActive || exhausted || expired) {
        return NextResponse.json({ error: "Coupon is invalid or expired" }, { status: 400 });
      }

      price = Math.max(0, price - (price * Number(cp.discountPct)) / 100);
      appliedCoupon = cp;
    }

    const now = new Date();
    const periodEnd = new Date(now);
    if (billingCycle === "ANNUAL") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    const result = await db.transaction(async (tx) => {
      await tx.update(users).set({ currentPlan: plan.code }).where(eq(users.id, userId));

      const [existingSub] = await tx
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .limit(1);

      let subResult;
      if (existingSub) {
        [subResult] = await tx
          .update(subscriptions)
          .set({
            planCode: plan.code,
            billingCycle,
            status: "ACTIVE",
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            updatedAt: now,
          })
          .where(eq(subscriptions.userId, userId))
          .returning();
      } else {
        [subResult] = await tx
          .insert(subscriptions)
          .values({
            userId,
            planCode: plan.code,
            billingCycle,
            status: "ACTIVE",
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
          })
          .returning();
      }

      if (appliedCoupon) {
        await tx
          .update(subscriptionCoupons)
          .set({ timesUsed: sql`coalesce(${subscriptionCoupons.timesUsed}, 0) + 1` })
          .where(eq(subscriptionCoupons.id, appliedCoupon.id));
      }

      const invoiceNum = `INV-${Date.now().toString().slice(-6)}-${userId}`;
      const [invoice] = await tx
        .insert(subscriptionInvoices)
        .values({
          invoiceNumber: invoiceNum,
          userId,
          planCode: plan.code,
          amount: price.toFixed(2),
          currency: "INR",
          status: "PAID",
          billingCycle,
          paymentGateway: "SIMULATED_PAYMENT_GATEWAY",
        })
        .returning();

      return { subscription: subResult, invoice };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully subscribed to ${plan.name} (${billingCycle})`,
      subscription: result.subscription,
      invoice: result.invoice,
    });
  } catch (err: unknown) {
    console.error("Subscriptions POST error:", err);
    return NextResponse.json({ error: "Failed to process subscription" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const {
      code,
      priceMonthly,
      priceAnnual,
      aiAnalysesPerMonth,
      watchlistsLimit,
      demoBotsLimit,
      backtestsPerMonth,
    } = body;

    if (!code) {
      return NextResponse.json({ error: "Plan code is required" }, { status: 400 });
    }

    const updateFields: Partial<typeof subscriptionPlans.$inferInsert> = {};
    if (priceMonthly !== undefined) updateFields.priceMonthly = Number(priceMonthly).toFixed(2);
    if (priceAnnual !== undefined) updateFields.priceAnnual = Number(priceAnnual).toFixed(2);
    if (aiAnalysesPerMonth !== undefined) updateFields.aiAnalysesPerMonth = Number(aiAnalysesPerMonth);
    if (watchlistsLimit !== undefined) updateFields.watchlistsLimit = Number(watchlistsLimit);
    if (demoBotsLimit !== undefined) updateFields.demoBotsLimit = Number(demoBotsLimit);
    if (backtestsPerMonth !== undefined) updateFields.backtestsPerMonth = Number(backtestsPerMonth);

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const [updatedPlan] = await db
      .update(subscriptionPlans)
      .set(updateFields)
      .where(eq(subscriptionPlans.code, code))
      .returning();

    await db.insert(auditLogs).values({
      action: "SUBSCRIPTION_PLAN_CONFIGURED",
      targetEntity: "SubscriptionPlan",
      targetId: code,
      details: updateFields,
      adminEmail: admin.email,
    });

    return NextResponse.json({ success: true, plan: updatedPlan });
  } catch (err: unknown) {
    console.error("Subscriptions PATCH error:", err);
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}
