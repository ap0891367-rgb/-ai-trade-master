import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge guard for every /api/admin/* route.
 * The actual role/permission logic still lives server-side in the route handlers;
 * this stops unauthenticated requests (and non-admin roles) before they reach them.
 */

const SESSION_COOKIE = "atm_session";
const ADMIN_ROLES = new Set([
  "SUPER_ADMIN",
  "ADMIN",
  "RISK_OFFICER",
  "COMPLIANCE_MANAGER",
  "SUPPORT_EXECUTIVE",
]);

function secret(): string {
  return process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16
    ? process.env.AUTH_SECRET
    : "dev-only-insecure-secret-change-me";
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function readSession(token: string | undefined): Promise<{ role?: string; exp?: number } | null> {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlToBytes(signature),
    encoder.encode(body),
  );
  if (!valid) return null;

  try {
    const json = new TextDecoder().decode(base64UrlToBytes(body));
    const payload = JSON.parse(json) as { role?: string; exp?: number };
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await readSession(token);

  if (!session || !session.role || !ADMIN_ROLES.has(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
