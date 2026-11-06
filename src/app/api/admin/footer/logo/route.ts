import { NextResponse } from "next/server";

import { requireSuperAdmin } from "@/lib/session";
import { isSameOrigin, jsonError } from "@/lib/requestGuard";

export const dynamic = "force-dynamic";

const MAX_LOGO_BYTES = 1_500_000; // ~1.5 MB after client-side compression
const ALLOWED = /^data:image\/(png|jpe?g|webp|gif);base64,([a-z0-9+/=\s]+)$/i;

/**
 * Validates and normalizes an uploaded footer logo.
 *
 * The image is returned as a base64 data URL and persisted with the rest of the
 * footer config on save, so it survives redeploys on ephemeral hosts like
 * Render (no local filesystem dependency).
 */
export async function POST(req: Request) {
  const admin = await requireSuperAdmin();
  if (!admin) return jsonError("Super Admin access required", 403);

  if (!isSameOrigin(req)) {
    return jsonError("Cross-origin request blocked", 403);
  }

  try {
    const body = await req.json().catch(() => null);
    const dataUrl = body?.dataUrl;

    if (typeof dataUrl !== "string" || !ALLOWED.test(dataUrl)) {
      return jsonError("Upload a PNG, JPEG, WEBP or GIF image", 400);
    }

    const bytes = Math.floor((dataUrl.length * 3) / 4);
    if (bytes > MAX_LOGO_BYTES) {
      return jsonError("Logo is too large. Please use an image under 1.5 MB.", 413);
    }

    return NextResponse.json({ success: true, url: dataUrl, bytes });
  } catch (error) {
    console.error("Footer logo upload error:", error);
    return NextResponse.json(
      { success: false, error: "Logo upload failed" },
      { status: 500 },
    );
  }
}
