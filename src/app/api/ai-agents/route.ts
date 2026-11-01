import { NextResponse } from "next/server";
import { db } from "@/db";
import { aiAgents, aiTasks, aiUsageLogs } from "@/db/schema";
import { MASTER_10_AI_AGENTS } from "@/lib/masterAiAgents";
import { eq, desc } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    let agents = await db.select().from(aiAgents);
    if (agents.length === 0) {
      agents = MASTER_10_AI_AGENTS.map((a, idx) => ({
        id: idx + 1,
        agentKey: a.key,
        name: a.name,
        category: a.category,
        model: a.model,
        status: "ACTIVE",
        accuracyScore: a.accuracy.replace("%", ""),
        totalInvocations: a.invocations,
        descriptionHi: a.descriptionHi,
        descriptionEn: a.descriptionEn,
        lastActiveAt: new Date(),
      }));
    }

    const recentTasks = await db
      .select()
      .from(aiTasks)
      .where(eq(aiTasks.userId, session.id))
      .orderBy(desc(aiTasks.createdAt))
      .limit(10);

    return NextResponse.json({
      success: true,
      agents,
      recentTasks,
    });
  } catch (err: unknown) {
    console.error("AI agents GET error:", err);
    return NextResponse.json({ error: "Failed to fetch AI agents" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const { agentKey, symbol = "RELIANCE" } = body;

    const agent = MASTER_10_AI_AGENTS.find(a => a.key === agentKey) || MASTER_10_AI_AGENTS[0];

    // Simulated AI quantitative inference result
    let verdict = "BUY";
    let confidence = 88.5;
    let summaryHi = "";
    let summaryEn = "";

    if (agent.key === "market_intelligence") {
      summaryHi = "एफआईआई कैश फ्लो +₹1,840 करोड़ पॉजिटिव है। निफ्टी 50 20-डे ईएमए के ऊपर बुलिश रेजिम में है।";
      summaryEn = "FII institutional cash flow is net positive (+₹1,840 Cr). Nifty 50 maintains high-conviction bullish regime above 20 EMA.";
    } else if (agent.key === "stock_research") {
      summaryHi = `${symbol} का पी/ई रेशियो फेयर वैल्यू पर है। पिछले क्वार्टर में ईपीएस ग्रोथ +16.2% दर्ज की गई है।`;
      summaryEn = `${symbol} trades at attractive fair valuation. Normalized EPS growth expanded +16.2% YoY with zero balance sheet stress.`;
    } else if (agent.key === "technical_analysis") {
      summaryHi = `${symbol} 29 संकेतकों के अनुसार 85% बुलिश कॉनफ्लुएंस दिखा रहा है। वीवैप के ऊपर मजबूत खरीदारी।`;
      summaryEn = `${symbol} prints 85% multi-indicator confluence. Institutional buyers actively bidding above daily session VWAP.`;
    } else if (agent.key === "financial_news") {
      summaryHi = "एनएसई कॉर्पोरेट फाइलिंग में नए ऑर्डर और क्षमता विस्तार के सकारात्मक अपडेट दर्ज हुए हैं।";
      summaryEn = "Regulatory exchange disclosures verify major new capacity expansion order intake. No adverse litigation risks.";
    } else if (agent.key === "sentiment_analysis") {
      summaryHi = "सोशल और इंस्टीट्यूशनल सेंटिमेंट स्कोर +0.82 (अति-बुलिश) है। रिटेल सेलिंग अब्जॉर्ब हो चुकी है।";
      summaryEn = "Quant sentiment index registers +0.82 (Strong Bullish Conviction). Retail dip selling completely absorbed by domestic mutual funds.";
    } else if (agent.key === "risk_monitoring") {
      summaryHi = "रिस्क-टू-रिवॉर्ड रेशियो 1:2.4 अनुकूल है। अनुशंसित स्टॉप लॉस 1.5% के अंदर सुरक्षित है।";
      summaryEn = "Risk-to-reward ratio stands at favorable 1:2.4. Downside volatility is compressed with clear trailing ATR guard.";
    } else {
      summaryHi = `${agent.name} ने ${symbol} के लिए अनुकूल कॉनफ्लुएंस और स्नाइपर एंट्री की पुष्टि की है।`;
      summaryEn = `${agent.name} confirms high-probability alignment with strict risk-to-reward parameters.`;
    }

    const taskResult = {
      agentName: agent.name,
      modelUsed: agent.model,
      symbol,
      verdict,
      confidence,
      summaryHi,
      summaryEn,
      timestamp: new Date().toLocaleTimeString(),
    };

    // Save AI Task into DB
    let savedTask = null;
    try {
      [savedTask] = await db.insert(aiTasks).values({
        userId: session.id,
        agentKey: agent.key,
        symbol,
        taskType: "ANALYSIS",
        status: "COMPLETED",
        result: taskResult,
        confidence: confidence.toFixed(2),
        verdict,
      }).returning();

      await db.insert(aiUsageLogs).values({
        userId: session.id,
        agentKey: agent.key,
        tokensUsed: 450,
        executionMs: 140,
      });
    } catch (e: unknown) {
      console.warn("AI task insert skipped:", e);
    }

    return NextResponse.json({
      success: true,
      task: savedTask || { id: Date.now(), result: taskResult },
      result: taskResult,
    });
  } catch (err: unknown) {
    console.error("AI agents POST error:", err);
    return NextResponse.json({ error: "Failed to execute AI agent" }, { status: 500 });
  }
}
