import { NextResponse } from "next/server";

import { getFooterConfig } from "@/lib/footerStore";

export const dynamic = "force-dynamic";

/**
 * Public footer configuration consumed by the trading dashboard.
 * No secrets or admin-only data are exposed here.
 */
export async function GET() {
  try {
    const config = await getFooterConfig();
    return NextResponse.json(
      { success: true, config },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("Public footer error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to load footer configuration" },
      { status: 500 },
    );
  }
}
