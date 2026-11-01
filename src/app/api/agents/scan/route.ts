import { NextResponse } from "next/server";
import { run30AgentAnalysis } from "@/lib/agents/agentEngine";
import { getCandlesWithFallback, getLiveQuote } from "@/lib/marketData";
import { isAiEnabled, requestAiVerdict, type AiVerdict } from "@/lib/aiSignals";
import { db } from "@/db";
import { agentAnalysisLogs, notifications, users, trades, walletTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";

const AUTO_TRADE_ALLOCATION = 25_000;

/**
 * Applies a real LLM verdict on top of the deterministic 30-agent engine.
 * Targets/stops are re-anchored to the live price so auto-trading stays sane.
 */
function applyAiVerdict(
  analysis: ReturnType<typeof run30AgentAnalysis>,
  ai: AiVerdict
): ReturnType<typeof run30AgentAnalysis> {
  const price = analysis.currentPrice;
  const isBuy = ai.verdict === "STRONG_BUY" || ai.verdict === "BUY";
  const isSell = ai.verdict === "STRONG_SELL" || ai.verdict === "SELL";
  const unit = price * 0.015;

  return {
    ...analysis,
    verdict: ai.verdict,
    overallConfidence: ai.confidence,
    buyVotes: ai.buyVotes,
    sellVotes: ai.sellVotes,
    holdVotes: ai.holdVotes,
    weightedScore: Number(((ai.buyVotes - ai.sellVotes) / 3).toFixed(2)),
    entryPrice: Number(price.toFixed(2)),
    targetPrice: Number((isBuy ? price + unit * 2 : isSell ? price - unit * 2 : analysis.targetPrice).toFixed(2)),
    stopLoss: Number((isBuy ? price - unit : isSell ? price + unit : analysis.stopLoss).toFixed(2)),
    riskRewardRatio: isBuy || isSell ? "1:2" : analysis.riskRewardRatio,
    recommendedActionHi: ai.summaryHi || analysis.recommendedActionHi,
    entryExitPlan: {
      ...analysis.entryExitPlan,
      action: isBuy ? "BUY_ENTRY" : isSell ? "SELL_EXIT" : "HOLD_WAIT",
      entryPrice: Number(price.toFixed(2)),
      target1: Number((isBuy ? price + unit * 2 : isSell ? price - unit * 2 : analysis.entryExitPlan.target1).toFixed(2)),
      stopLoss: Number((isBuy ? price - unit : isSell ? price + unit : analysis.entryExitPlan.stopLoss).toFixed(2)),
      agentConsensusSummary: ai.summaryEn || analysis.entryExitPlan.agentConsensusSummary,
    },
  };
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const { symbol = "RELIANCE", currentPrice } = body;

    // Prefer a live quote; the client-supplied price is only a fallback so a
    // stale or forged value cannot move targets around.
    const quote = await getLiveQuote(String(symbol));
    const price = quote?.price ?? (Number(currentPrice) || undefined);

    let analysis = run30AgentAnalysis(String(symbol), price, quote?.previousClose);
    const candleResult = await getCandlesWithFallback(String(symbol), 28);

    const aiEnabled = isAiEnabled();
    let aiVerdict: AiVerdict | null = null;
    if (aiEnabled) {
      aiVerdict = await requestAiVerdict({
        symbol: String(symbol),
        companyName: analysis.companyName,
        price: analysis.currentPrice,
        changePercent: analysis.change24hPercent,
        dayHigh: quote?.dayHigh,
        dayLow: quote?.dayLow,
        recentCandles: candleResult.candles.slice(-20),
      });
      if (aiVerdict) analysis = applyAiVerdict(analysis, aiVerdict);
    }

    const candles = candleResult.candles;
    const market = {
      live: Boolean(quote),
      source: quote ? quote.source : "simulated",
      price: analysis.currentPrice,
      changePercent: quote ? quote.changePercent : analysis.change24hPercent,
      candlesLive: candleResult.live,
      updatedAt: new Date().toISOString(),
    };

    // Scan logs are best-effort telemetry; never fail the request because of them.
    try {
      await db.insert(agentAnalysisLogs).values({
        symbol: String(symbol),
        mainVerdict: analysis.verdict,
        buyVotes: analysis.buyVotes,
        sellVotes: analysis.sellVotes,
        holdVotes: analysis.holdVotes,
        confidence: analysis.overallConfidence.toFixed(2),
        astroVerdict: analysis.astroHighlights.verdict,
        astroRashi: analysis.astroHighlights.rashi,
      });
    } catch (e: unknown) {
      console.warn("Scan log skipped:", e);
    }

    let autoTradeExecuted = false;
    let autoTradeDetails = null;

    const [user] = await db.select().from(users).where(eq(users.id, session.id)).limit(1);

    if (user) {
      const notifTitle = `⚡ ${analysis.verdict.replace("_", " ")}: ${symbol} (${analysis.buyVotes}/30 Agents Agree)`;
      const notifMsg = `Main Agent says: ${analysis.recommendedActionHi} [Astro Agent: ${analysis.astroHighlights.summary}]`;

      await db.insert(notifications).values({
        userId: session.id,
        symbol: String(symbol),
        title: notifTitle,
        message: notifMsg,
        type: analysis.verdict.includes("BUY") ? "BUY_ALERT" : analysis.verdict.includes("SELL") ? "SELL_ALERT" : "HOLD_ALERT",
        read: false,
        metadata: {
          confidence: analysis.overallConfidence,
          target: analysis.targetPrice,
          stopLoss: analysis.stopLoss,
          entryPrice: analysis.entryPrice,
          astroRashi: analysis.astroHighlights.rashi,
        },
      });

      // Auto-trading is opt-in via the user's saved preference only. The client
      // cannot force trades by passing a flag in the request body.
      const isBuySignal = analysis.verdict === "STRONG_BUY" || analysis.verdict === "BUY";

      if (user.autoTradingEnabled && isBuySignal) {
        const outcome = await db.transaction(async (tx) => {
          const [lockedUser] = await tx
            .select()
            .from(users)
            .where(eq(users.id, session.id))
            .for("update")
            .limit(1);
          if (!lockedUser) return null;

          const currentBal = Number(lockedUser.walletBalance);
          if (currentBal < AUTO_TRADE_ALLOCATION) return null;

          const quantity = Number((AUTO_TRADE_ALLOCATION / analysis.entryPrice).toFixed(2));
          if (quantity <= 0) return null;

          const newBal = (currentBal - AUTO_TRADE_ALLOCATION).toFixed(2);
          await tx.update(users).set({ walletBalance: newBal }).where(eq(users.id, session.id));

          await tx.insert(walletTransactions).values({
            userId: session.id,
            type: "TRADE_BUY",
            amount: AUTO_TRADE_ALLOCATION.toFixed(2),
            description: `Auto-Trade BUY executed by Main Agent for ${quantity} shares of ${symbol} at ₹${analysis.entryPrice}`,
          });

          const [newTrade] = await tx
            .insert(trades)
            .values({
              userId: session.id,
              symbol: String(symbol),
              companyName: analysis.companyName,
              side: "BUY",
              entryPrice: analysis.entryPrice.toFixed(2),
              currentPrice: analysis.entryPrice.toFixed(2),
              quantity: quantity.toFixed(2),
              investedAmount: AUTO_TRADE_ALLOCATION.toFixed(2),
              stopLoss: analysis.stopLoss.toFixed(2),
              takeProfit: analysis.targetPrice.toFixed(2),
              mainAgentConfidence: analysis.overallConfidence.toFixed(2),
              astroVerdict: `${analysis.astroHighlights.rashi} - ${analysis.astroHighlights.muhurat}`,
              status: "OPEN",
            })
            .returning();

          await tx.insert(notifications).values({
            userId: session.id,
            symbol: String(symbol),
            title: `🤖 AUTO-TRADE EXECUTED: ${quantity} ${symbol} @ ₹${analysis.entryPrice}`,
            message: `Main Agent automatically bought ₹${AUTO_TRADE_ALLOCATION} worth of ${symbol} based on 30-agent confluence.`,
            type: "AUTO_TRADE",
            read: false,
          });

          return newTrade;
        });

        if (outcome) {
          autoTradeExecuted = true;
          autoTradeDetails = outcome;
        }
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      candles,
      autoTradeExecuted,
      autoTradeDetails,
      market,
      ai: {
        enabled: aiEnabled,
        applied: Boolean(aiVerdict),
        provider: aiVerdict?.provider ?? null,
        model: aiVerdict?.model ?? null,
        summaryHi: aiVerdict?.summaryHi ?? null,
        summaryEn: aiVerdict?.summaryEn ?? null,
        reasoning: aiVerdict?.reasoning ?? [],
      },
    });
  } catch (err: unknown) {
    console.error("Scan error:", err);
    return NextResponse.json({ error: "Failed to scan agents" }, { status: 500 });
  }
}
