import { NextResponse } from "next/server";
import { getCandlesWithFallback, isChartInterval, type ChartInterval } from "@/lib/marketData";

export const dynamic = "force-dynamic";

/**
 * GET /api/market/history?symbol=RELIANCE&count=28&interval=5m
 *
 * Returns candles from Yahoo Finance when reachable, otherwise the simulated
 * candles so charts never render empty. `interval` is one of 1m, 5m, 15m, 1h, 1D.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = (searchParams.get("symbol") ?? "RELIANCE").trim();

  const intervalParam = (searchParams.get("interval") ?? "5m").trim();
  const interval: ChartInterval = isChartInterval(intervalParam) ? intervalParam : "5m";

  const countParam = Number(searchParams.get("count"));
  const count = Number.isFinite(countParam) ? Math.max(5, Math.min(200, Math.round(countParam))) : 28;

  const { candles, live } = await getCandlesWithFallback(symbol, count, interval);

  return NextResponse.json(
    {
      symbol,
      interval,
      candles,
      live,
      source: live ? "yahoo" : "simulated",
      updatedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
