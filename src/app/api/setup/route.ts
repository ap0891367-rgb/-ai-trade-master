import { NextResponse } from "next/server";
import { ensureAdminSeeded } from "@/lib/adminSeed";

/**
 * One-time bootstrap endpoint.
 * Requires SETUP_SECRET (header `x-setup-secret` or ?secret=) so it cannot be
 * triggered by the public. Creates the default admin, demo trader, plans, bots,
 * compliance records, etc. Safe to call multiple times (idempotent).
 */
async function handle(req: Request) {
  const expected = process.env.SETUP_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "SETUP_SECRET is not configured on the server" },
      { status: 503 },
    );
  }

  const url = new URL(req.url);
  const provided = req.headers.get("x-setup-secret") || url.searchParams.get("secret");
  if (provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const seeded = await ensureAdminSeeded();
  if (!seeded) {
    return NextResponse.json({ error: "Seeding failed. Check server logs." }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Database seeded" });
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
