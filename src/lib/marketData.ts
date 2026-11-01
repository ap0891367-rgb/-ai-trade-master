import { generateCandles, type CandleData } from "@/lib/agents/agentEngine";

/**
 * Live market data via Yahoo Finance's public chart endpoint.
 *
 * The app can be demoed without any API key: if a symbol (or the network) is
 * unavailable we fall back to the simulated candles/prices the UI already had.
 * Yahoo is polled politely (per-symbol cache + small concurrency limit) because
 * it is an unofficial, unauthenticated endpoint.
 */

export interface LiveQuote {
  symbol: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh?: number;
  dayLow?: number;
  volume?: number;
  currency?: string;
  exchange?: string;
  source: "yahoo";
  fetchedAt: string;
}

/** App symbols -> Yahoo Finance tickers. */
export const YAHOO_SYMBOLS: Record<string, string> = {
  RELIANCE: "RELIANCE.NS",
  TCS: "TCS.NS",
  HDFCBANK: "HDFCBANK.NS",
  INFY: "INFY.NS",
  TATASTEEL: "TATASTEEL.NS",
  ITC: "ITC.NS",
  SBIN: "SBIN.NS",
  TATAMOTORS: "TATAMOTORS.NS",
  BHARTIARTL: "BHARTIARTL.NS",
  NIFTY50: "^NSEI",
  BANKNIFTY: "^NSEBANK",
  "BTC/USDT": "BTC-USD",
  "ETH/USDT": "ETH-USD",
  "SOL/USDT": "SOL-USD",
  "XRP/USDT": "XRP-USD",
  "DOGE/USDT": "DOGE-USD",
  "PEPE/USDT": "PEPE-USD",
  "USD/INR": "INR=X",
  "USD/JPY": "JPY=X",
  "EUR/USD": "EURUSD=X",
  "GBP/USD": "GBPUSD=X",
  "XAU/USD": "GC=F",
  CRUDEOIL: "CL=F",
};

export const MARKET_SYMBOLS = Object.keys(YAHOO_SYMBOLS);

const QUOTE_TTL_MS = 60_000;
const MISS_TTL_MS = 20_000;
const HISTORY_TTL_MS = 5 * 60_000;

const quoteCache = new Map<string, { at: number; quote: LiveQuote | null }>();
const historyCache = new Map<string, { at: number; candles: CandleData[] }>();

function yahooTicker(symbol: string): string | null {
  return YAHOO_SYMBOLS[symbol] ?? null;
}

async function yahooChart(ticker: string, interval: string, range: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    ticker
  )}?interval=${interval}&range=${range}&includePrePost=false`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
      Accept: "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(7_000),
  });

  if (!res.ok) throw new Error(`Yahoo responded ${res.status} for ${ticker}`);
  return res.json();
}

function round(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return value >= 1 ? Number(value.toFixed(2)) : Number(value.toFixed(6));
}

export async function getLiveQuote(symbol: string): Promise<LiveQuote | null> {
  const cached = quoteCache.get(symbol);
  if (cached && Date.now() - cached.at < (cached.quote ? QUOTE_TTL_MS : MISS_TTL_MS)) {
    return cached.quote;
  }

  const ticker = yahooTicker(symbol);
  if (!ticker) {
    quoteCache.set(symbol, { at: Date.now(), quote: null });
    return null;
  }

  try {
    const json = await yahooChart(ticker, "5m", "1d");
    const result = json?.chart?.result?.[0];
    const meta = result?.meta;
    const price = Number(meta?.regularMarketPrice);
    if (!meta || !Number.isFinite(price) || price <= 0) throw new Error("no price in response");

    const previousClose = Number(meta.chartPreviousClose ?? meta.previousClose ?? price);
    const change = price - previousClose;
    const quote: LiveQuote = {
      symbol,
      price: round(price),
      previousClose: round(previousClose),
      change: round(change),
      changePercent: previousClose ? round((change / previousClose) * 100) : 0,
      dayHigh: Number.isFinite(Number(meta.regularMarketDayHigh)) ? round(Number(meta.regularMarketDayHigh)) : undefined,
      dayLow: Number.isFinite(Number(meta.regularMarketDayLow)) ? round(Number(meta.regularMarketDayLow)) : undefined,
      volume: Number.isFinite(Number(meta.regularMarketVolume)) ? Number(meta.regularMarketVolume) : undefined,
      currency: meta.currency,
      exchange: meta.fullExchangeName ?? meta.exchangeName,
      source: "yahoo",
      fetchedAt: new Date().toISOString(),
    };

    quoteCache.set(symbol, { at: Date.now(), quote });
    return quote;
  } catch (err) {
    console.warn(`Live quote failed for ${symbol}:`, (err as Error).message);
    quoteCache.set(symbol, { at: Date.now(), quote: null });
    return null;
  }
}

/** Fetches several symbols with a small concurrency limit to stay polite. */
export async function getLiveQuotes(symbols: string[], concurrency = 5): Promise<Record<string, LiveQuote>> {
  const out: Record<string, LiveQuote> = {};
  const queue = [...new Set(symbols)];
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length) {
      const symbol = queue.shift();
      if (!symbol) break;
      const quote = await getLiveQuote(symbol);
      if (quote) out[symbol] = quote;
    }
  });
  await Promise.all(workers);
  return out;
}

function formatIstTime(epochSeconds: number): string {
  return new Date(epochSeconds * 1000).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export async function getLiveCandles(symbol: string, count = 28): Promise<CandleData[] | null> {
  const cached = historyCache.get(symbol);
  if (cached && Date.now() - cached.at < HISTORY_TTL_MS) {
    return cached.candles.slice(-count);
  }

  const ticker = yahooTicker(symbol);
  if (!ticker) return null;

  try {
    const json = await yahooChart(ticker, "5m", "5d");
    const result = json?.chart?.result?.[0];
    const timestamps: number[] = result?.timestamp ?? [];
    const quote = result?.indicators?.quote?.[0];
    if (!timestamps.length || !quote) throw new Error("no timestamps");

    const candles: CandleData[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      const open = Number(quote.open?.[i]);
      const high = Number(quote.high?.[i]);
      const low = Number(quote.low?.[i]);
      const close = Number(quote.close?.[i]);
      if (![open, high, low, close].every((n) => Number.isFinite(n))) continue;
      candles.push({
        time: formatIstTime(timestamps[i]),
        open: round(open),
        high: round(high),
        low: round(low),
        close: round(close),
        volume: Number(quote.volume?.[i]) || 0,
      });
    }

    if (candles.length < 5) throw new Error("too few candles");
    historyCache.set(symbol, { at: Date.now(), candles });
    return candles.slice(-count);
  } catch (err) {
    console.warn(`Live candles failed for ${symbol}:`, (err as Error).message);
    return null;
  }
}

/** Live candles when possible, simulated ones otherwise. */
export async function getCandlesWithFallback(symbol: string, count = 28): Promise<{ candles: CandleData[]; live: boolean }> {
  const live = await getLiveCandles(symbol, count);
  if (live) return { candles: live, live: true };
  return { candles: generateCandles(symbol, count), live: false };
}
