import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { requireSuperAdmin } from "@/lib/session";
import { getFooterConfig, saveFooterConfig } from "@/lib/footerStore";
import { isSameOrigin, jsonError } from "@/lib/requestGuard";

export const dynamic = "force-dynamic";

/** Footer Management read endpoint (Super Admin only). */
export async function GET() {
  const admin = await requireSuperAdmin();
  if (!admin) return jsonError("Super Admin access required", 403);

  try {
    const config = await getFooterConfig();
    let subscribers = 0;
    try {
      const [row] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(newsletterSubscribers);
      subscribers = Number(row?.count ?? 0);
    } catch {
      subscribers = 0;
    }

    return NextResponse.json({ success: true, config, subscribers });
  } catch (error) {
    console.error("Admin footer read error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load footer configuration" },
      { status: 500 },
    );
  }
}

/** Replaces the footer configuration. Requires a SUPER_ADMIN session. */
export async function PUT(req: Request) {
  const admin = await requireSuperAdmin();
  if (!admin) return jsonError("Super Admin access required", 403);

  if (!isSameOrigin(req)) {
    return jsonError("Cross-origin request blocked", 403);
  }

  try {
    const body = await req.json();
    const config = await saveFooterConfig(body?.config ?? body, admin.email);
    return NextResponse.json({
      success: true,
      config,
      message: "Footer saved. The dashboard will show these changes on the next load.",
    });
  } catch (error) {
    console.error("Admin footer save error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save footer configuration" },
      { status: 500 },
    );
  }
}
