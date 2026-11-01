import type { MasterVerdict } from "@/lib/agents/types";

/**
 * Real LLM-backed verdict for the 30-agent scan.
 *
 * Configure ONE of:
 *   - OPENAI_API_KEY   (optionally OPENAI_BASE_URL + AI_MODEL) — any OpenAI-compatible API
 *   - GEMINI_API_KEY   (optionally GEMINI_MODEL)
 *
 * With no key configured (or on any failure) the scan silently falls back to the
 * built-in deterministic engine, so the demo keeps working offline.
 */

export type AiProvider = "openai" | "gemini";

export interface AiVerdict {
  verdict: MasterVerdict;
  confidence: number;
  buyVotes: number;
  sellVotes: number;
  holdVotes: number;
  summaryHi: string;
  summaryEn: string;
  reasoning: string[];
  provider: AiProvider;
  model: string;
}

export interface AiConfig {
  provider: AiProvider;
  model: string;
  apiKey: string;
  baseUrl: string;
}

export function getAiConfig(): AiConfig | null {
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    return {
      provider: "openai",
      model: process.env.AI_MODEL?.trim() || "gpt-4o-mini",
      apiKey: openaiKey,
      baseUrl: (process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1").replace(/\/$/, ""),
    };
  }

  const geminiKey = process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
  if (geminiKey) {
    return {
      provider: "gemini",
      model: process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash",
      apiKey: geminiKey,
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    };
  }

  return null;
}

export function isAiEnabled(): boolean {
  return getAiConfig() !== null;
}

export interface AiScanInput {
  symbol: string;
  companyName: string;
  price: number;
  changePercent: number;
  dayHigh?: number;
  dayLow?: number;
  recentCandles?: { open: number; high: number; low: number; close: number; volume: number }[];
}

const VERDICTS: MasterVerdict[] = ["STRONG_BUY", "BUY", "HOLD", "SELL", "STRONG_SELL"];

function buildPrompt(input: AiScanInput): string {
  const candleSummary = (input.recentCandles ?? [])
    .slice(-20)
    .map((c) => `${c.close}`)
    .join(", ");

  return [
    "You are the master coordinator of a 30-agent Indian market analysis desk.",
    "The desk covers momentum, trend, volatility, volume, price action, sentiment, risk and one Vedic astrology agent.",
    "",
    `Instrument: ${input.companyName} (${input.symbol})`,
    `Last price: ${input.price}`,
    `Change today: ${input.changePercent.toFixed(2)}%`,
    input.dayHigh ? `Day high: ${input.dayHigh}` : "",
    input.dayLow ? `Day low: ${input.dayLow}` : "",
    candleSummary ? `Recent closes (oldest to newest, 5m): ${candleSummary}` : "",
    "",
    "Decide the aggregate desk verdict using only this data and general market reasoning.",
    "Be conservative: HOLD when the evidence is genuinely mixed.",
    "",
    "Respond with STRICT JSON only, no markdown, matching:",
    `{"verdict":"STRONG_BUY|BUY|HOLD|SELL|STRONG_SELL","confidence":0-100,` +
      `"buyVotes":0-30,"sellVotes":0-30,"holdVotes":0-30,` +
      `"summaryHi":"one sentence in Hindi (Devanagari)","summaryEn":"one sentence in English",` +
      `"reasoning":["3 to 5 short bullet points in English"]}`,
    "buyVotes + sellVotes + holdVotes must equal 30.",
  ]
    .filter(Boolean)
    .join("\n");
}

function extractJson(text: string): Record<string, unknown> | null {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : text).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function clampVotes(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(30, Math.round(n)));
}

function normaliseVotes(raw: Record<string, unknown>) {
  let buy = clampVotes(Number(raw.buyVotes));
  let sell = clampVotes(Number(raw.sellVotes));
  let hold = clampVotes(Number(raw.holdVotes));
  const total = buy + sell + hold;

  if (total !== 30) {
    // Rebuild a plausible split from the verdict when the model's maths is off.
    const verdict = String(raw.verdict ?? "HOLD") as MasterVerdict;
    const split: Record<MasterVerdict, [number, number, number]> = {
      STRONG_BUY: [23, 2, 5],
      BUY: [18, 5, 7],
      HOLD: [7, 6, 17],
      SELL: [5, 18, 7],
      STRONG_SELL: [2, 23, 5],
    };
    [buy, sell, hold] = split[verdict] ?? split.HOLD;
  }

  return { buy, sell, hold };
}

function normaliseVerdict(value: unknown): MasterVerdict {
  const upper = String(value ?? "").toUpperCase().replace(/[\s-]+/g, "_");
  return (VERDICTS as string[]).includes(upper) ? (upper as MasterVerdict) : "HOLD";
}

function normaliseVerdictFromVotes(buy: number, sell: number, hold: number, confidence: number): MasterVerdict {
  if (buy > sell && buy >= hold) return buy >= 20 || confidence >= 80 ? "STRONG_BUY" : "BUY";
  if (sell > buy && sell >= hold) return sell >= 20 || confidence >= 80 ? "STRONG_SELL" : "SELL";
  return "HOLD";
}

async function callOpenAi(config: AiConfig, prompt: string): Promise<string> {
  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.4,
      max_tokens: 700,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You output only strict JSON. Never wrap it in markdown." },
        { role: "user", content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`OpenAI-compatible API ${res.status}: ${detail.slice(0, 200)}`);
  }

  const json = await res.json();
  return String(json?.choices?.[0]?.message?.content ?? "");
}

async function callGemini(config: AiConfig, prompt: string): Promise<string> {
  const url = `${config.baseUrl}/models/${encodeURIComponent(config.model)}:generateContent?key=${encodeURIComponent(
    config.apiKey
  )}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, responseMimeType: "application/json", maxOutputTokens: 700 },
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Gemini API ${res.status}: ${detail.slice(0, 200)}`);
  }

  const json = await res.json();
  return String(json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "");
}

export async function requestAiVerdict(input: AiScanInput): Promise<AiVerdict | null> {
  const config = getAiConfig();
  if (!config) return null;

  const prompt = buildPrompt(input);

  try {
    const text = config.provider === "openai" ? await callOpenAi(config, prompt) : await callGemini(config, prompt);
    const raw = extractJson(text);
    if (!raw) throw new Error("model did not return JSON");

    const verdict = normaliseVerdict(raw.verdict);
    const confidence = Math.max(0, Math.min(100, Number(raw.confidence) || 60));
    const votes = normaliseVotes(raw);
    const reasoning = Array.isArray(raw.reasoning)
      ? raw.reasoning.map((r) => String(r)).filter(Boolean).slice(0, 6)
      : [];

    return {
      // Keep the verdict and the vote split consistent with each other.
      verdict: normaliseVerdictFromVotes(votes.buy, votes.sell, votes.hold, confidence),
      confidence: Number(confidence.toFixed(1)),
      buyVotes: votes.buy,
      sellVotes: votes.sell,
      holdVotes: votes.hold,
      summaryHi: String(raw.summaryHi ?? raw.summary ?? "").slice(0, 400),
      summaryEn: String(raw.summaryEn ?? raw.summary ?? "").slice(0, 400),
      reasoning,
      provider: config.provider,
      model: config.model,
    };
  } catch (err) {
    console.warn("AI verdict failed:", (err as Error).message);
    return null;
  }
}
