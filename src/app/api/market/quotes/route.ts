import { NextResponse } from "next/server";
import { FAST_QUOTE_TTL_MS, MARKET_SYMBOLS, getLiveQuotes } from "@/lib/marketData";

export const dynamic = "force-dynamic";

/**
 * GET /api/market/quotes?symbols=RELIANCE,NIFTY50&fast=1
 *
 * Public read-only endpoint: returns live quotes for the requested app symbols.
 * Symbols that Yahoo cannot resolve are simply omitted; the client keeps showing
 * its simulated fallback price for those.
 *
 * `fast=1` bypasses the default 60s cache (10s TTL) and is meant for the single
 * symbol currently open on the chart, so the price line ticks in real time
 * without hammering the upstream feed for the whole watchlist.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const requested = (searchParams.get("symbols") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MARKET_SYMBOLS.length);

  const symbols = requested.length ? requested : MARKET_SYMBOLS;
  const fast = searchParams.get("fast") === "1";
  const quotes = await getLiveQuotes(symbols, fast ? 2 : 5, fast ? FAST_QUOTE_TTL_MS : undefined);

  return NextResponse.json(
    {
      quotes,
      source: Object.keys(quotes).length ? "yahoo" : "unavailable",
      requested: symbols.length,
      fast,
      updatedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
