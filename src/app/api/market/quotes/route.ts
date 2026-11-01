import { NextResponse } from "next/server";
import { MARKET_SYMBOLS, getLiveQuotes } from "@/lib/marketData";

export const dynamic = "force-dynamic";

/**
 * GET /api/market/quotes?symbols=RELIANCE,NIFTY50
 *
 * Public read-only endpoint: returns live quotes for the requested app symbols.
 * Symbols that Yahoo cannot resolve are simply omitted; the client keeps showing
 * its simulated fallback price for those.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const requested = (searchParams.get("symbols") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const symbols = requested.length ? requested : MARKET_SYMBOLS;
  const quotes = await getLiveQuotes(symbols);

  return NextResponse.json(
    {
      quotes,
      source: Object.keys(quotes).length ? "yahoo" : "unavailable",
      requested: symbols.length,
      updatedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
