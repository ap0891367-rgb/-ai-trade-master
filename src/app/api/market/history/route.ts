import { NextResponse } from "next/server";
import { getCandlesWithFallback } from "@/lib/marketData";

export const dynamic = "force-dynamic";

/**
 * GET /api/market/history?symbol=RELIANCE&count=28
 *
 * Returns 5-minute candles from Yahoo Finance when reachable, otherwise the
 * simulated candles so charts never render empty.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get("symbol") ?? "RELIANCE").trim();
  const countParam = Number(searchParams.get("count"));
  const count = Number.isFinite(countParam) ? Math.max(5, Math.min(200, Math.round(countParam))) : 28;

  const { candles, live } = await getCandlesWithFallback(symbol, count);

  return NextResponse.json(
    { symbol, candles, live, source: live ? "yahoo" : "simulated", updatedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
