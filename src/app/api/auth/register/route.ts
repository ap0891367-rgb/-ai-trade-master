import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, walletTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";

const STARTING_BALANCE = "500000.00";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, currency = "INR" } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPass = String(password);

    if (cleanName.length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }
    if (cleanPass.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 });
    }

    // Starting balance is decided by the server, never by the client.
    const [newUser] = await db
      .insert(users)
      .values({
        name: cleanName,
        email: cleanEmail,
        passwordHash: hashPassword(cleanPass),
        walletBalance: STARTING_BALANCE,
        currency,
        autoTradingEnabled: false,
      })
      .returning();

    await db.insert(walletTransactions).values({
      userId: newUser.id,
      type: "DEPOSIT",
      amount: STARTING_BALANCE,
      description: "Initial demo trading account balance credited",
    });

    await setSessionCookie(newUser);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        walletBalance: Number(newUser.walletBalance),
        currency: newUser.currency,
        autoTradingEnabled: newUser.autoTradingEnabled,
        riskLevel: newUser.riskLevel,
      },
    });
  } catch (err: unknown) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
