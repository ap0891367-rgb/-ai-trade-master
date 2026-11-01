import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, walletTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, needsRehash, verifyPassword } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";

const DEMO_EMAIL = "demo@autotrading.ai";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "demo1234";
const DEMO_LOGIN_ENABLED = process.env.DEMO_LOGIN_ENABLED !== "false";

async function ensureDemoUser() {
  const [existing] = await db.select().from(users).where(eq(users.email, DEMO_EMAIL)).limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(users)
    .values({
      name: "Trader VIP Demo",
      email: DEMO_EMAIL,
      passwordHash: hashPassword(DEMO_PASSWORD),
      walletBalance: "500000.00",
      currency: "INR",
      autoTradingEnabled: false,
      riskLevel: "MODERATE",
    })
    .returning();

  await db.insert(walletTransactions).values({
    userId: created.id,
    type: "DEPOSIT",
    amount: "500000.00",
    description: "Initial demo capital credited",
  });

  return created;
}

function publicUser(user: typeof users.$inferSelect) {
  return {
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
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, isDemo = false } = body;

    // 1-click demo trader login (demo account only, no arbitrary accounts).
    if (isDemo) {
      if (!DEMO_LOGIN_ENABLED) {
        return NextResponse.json({ error: "Demo login is disabled" }, { status: 403 });
      }
      const demoUser = await ensureDemoUser();
      await setSessionCookie(demoUser);
      return NextResponse.json({ success: true, user: publicUser(demoUser) });
    }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    let cleanEmail = String(email).trim().toLowerCase();
    const cleanPass = String(password);
    if (cleanEmail === "demo") cleanEmail = DEMO_EMAIL;

    const [user] = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (user.status === "SUSPENDED" || user.status === "LOCKED") {
      return NextResponse.json({ error: "This account is not active. Please contact support." }, { status: 403 });
    }

    if (!verifyPassword(cleanPass, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Transparently upgrade legacy SHA-256 hashes to scrypt.
    if (needsRehash(user.passwordHash)) {
      await db
        .update(users)
        .set({ passwordHash: hashPassword(cleanPass), lastLoginAt: new Date() })
        .where(eq(users.id, user.id));
    } else {
      await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
    }

    await setSessionCookie(user);
    return NextResponse.json({ success: true, user: publicUser(user) });
  } catch (err: unknown) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 });
  }
}
