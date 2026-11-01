import crypto from "crypto";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const SESSION_COOKIE = "atm_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "RISK_OFFICER",
  "COMPLIANCE_MANAGER",
  "SUPPORT_EXECUTIVE",
] as const;

export interface SessionPayload {
  id: number;
  email: string;
  role: string;
  exp: number;
}

export interface SessionUser extends SessionPayload {
  name: string;
}

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (value && value.length >= 16) return value;
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[auth] AUTH_SECRET is missing or too short. Sessions will be signed with an insecure development key.",
    );
  }
  return "dev-only-insecure-secret-change-me";
}

function sign(body: string): string {
  return crypto.createHmac("sha256", secret()).update(body).digest("base64url");
}

export function createSessionToken(user: { id: number; email: string; role: string }): string {
  const payload: SessionPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload?.id || !payload?.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Session payload enriched with the user's current name (from the database). */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session) return null;

  const [user] = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
  if (!user || user.status === "SUSPENDED" || user.status === "LOCKED") return null;

  return { ...session, name: user.name, role: user.role };
}

export function isAdminRole(role: string | undefined | null): boolean {
  return !!role && (ADMIN_ROLES as readonly string[]).includes(role);
}

export async function requireAdmin(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session || !isAdminRole(session.role)) return null;
  return session;
}

export async function setSessionCookie(user: { id: number; email: string; role: string }): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
