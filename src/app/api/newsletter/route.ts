import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { isValidEmail } from "@/lib/footer";
import { jsonError } from "@/lib/requestGuard";

/** Public newsletter signup used by the dashboard footer. */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = body?.email;

    if (!isValidEmail(email)) {
      return jsonError("Please enter a valid email address", 400);
    }

    const cleanEmail = email.trim().toLowerCase();

    const [existing] = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, cleanEmail))
      .limit(1);

    if (existing && existing.status === "SUBSCRIBED") {
      return NextResponse.json({
        success: true,
        alreadySubscribed: true,
        message: "You are already subscribed to AI Trade Master updates.",
      });
    }

    if (existing) {
      await db
        .update(newsletterSubscribers)
        .set({ status: "SUBSCRIBED", source: "footer" })
        .where(eq(newsletterSubscribers.id, existing.id));
    } else {
      await db.insert(newsletterSubscribers).values({
        email: cleanEmail,
        status: "SUBSCRIBED",
        source: "footer",
      });
    }

    return NextResponse.json(
      {
        success: true,
        alreadySubscribed: false,
        message: "You're on the list. Welcome aboard!",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Could not save your subscription right now. Please try again.",
      },
      { status: 503 },
    );
  }
}
