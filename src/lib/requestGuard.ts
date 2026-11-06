/**
 * Small helpers shared by mutating route handlers.
 *
 * The app authenticates with a SameSite=Lax httpOnly cookie. As an extra CSRF
 * defence for state-changing admin calls we also require the browser-reported
 * Origin to match the host serving the request.
 */

export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin || origin === "null") {
    // Non-browser clients (curl/server-to-server) do not send Origin. The
    // signed session cookie is still required by the route handler.
    return !origin;
  }

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function jsonError(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status });
}
