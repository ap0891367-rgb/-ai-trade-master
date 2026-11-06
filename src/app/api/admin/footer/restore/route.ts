import { NextResponse } from "next/server";

import { DEFAULT_FOOTER_CONFIG } from "@/lib/footer";
import { requireSuperAdmin } from "@/lib/session";
import { saveFooterConfig } from "@/lib/footerStore";
import { isSameOrigin, jsonError } from "@/lib/requestGuard";

export const dynamic = "force-dynamic";

/** Restores the factory footer configuration (Super Admin only). */
export async function POST(req: Request) {
  const admin = await requireSuperAdmin();
  if (!admin) return jsonError("Super Admin access required", 403);

  if (!isSameOrigin(req)) {
    return jsonError("Cross-origin request blocked", 403);
  }

  try {
    const config = await saveFooterConfig(DEFAULT_FOOTER_CONFIG, admin.email);
    return NextResponse.json({
      success: true,
      config,
      message: "Default footer restored.",
    });
  } catch (error) {
    console.error("Footer restore error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to restore the default footer" },
      { status: 500 },
    );
  }
}
