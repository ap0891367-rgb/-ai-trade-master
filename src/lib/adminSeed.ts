import { db } from "@/db";
import { 
  users, 
  tradingBots, 
  demoOrders, 
  walletTransactions, 
  kycRecords, 
  supportTickets, 
  auditLogs, 
  platformConfig, 
  marketDataProviders,
  userProfiles,
  aiAgents,
  strategies,
  virtualWallets,
  portfolios,
  portfolioPositions,
  marketData,
  watchlists,
  backtestRuns,
  riskProfiles,
  subscriptions,
  subscriptionPlans,
  subscriptionInvoices,
  subscriptionCoupons,
  complianceRecords,
  brandingSettings,
  languageSettings,
  systemSettings
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth";
import { ENTERPRISE_SUBSCRIPTION_PLANS } from "@/lib/subscriptionPlans";
import { MASTER_10_AI_AGENTS } from "@/lib/masterAiAgents";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";

export async function ensureAdminSeeded() {
  try {
    const defaultHash = hashPassword(process.env.DEMO_PASSWORD || "demo1234");
    const adminHash = hashPassword(process.env.ADMIN_PASSWORD || "admin123");

    // 1. Seed Core Administrative Users & Traders
    const adminEmail = process.env.ADMIN_EMAIL || "admin@autotrading.ai";
    const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);

    if (existingAdmin.length === 0) {
      const seededUsers = [
        {
          name: "Rajesh Varma (Chief Admin)",
          email: adminEmail,
          passwordHash: adminHash,
          role: "SUPER_ADMIN",
          status: "ACTIVE",
          kycStatus: "VERIFIED",
          phoneNumber: "+91 98200 11223",
          walletBalance: "2500000.00",
          currency: "INR",
          autoTradingEnabled: true,
          riskLevel: "CONSERVATIVE",
          twoFactorEnabled: true,
          currentPlan: "ENTERPRISE",
          language: "en",
        },
        {
          name: "Trader VIP Demo",
          email: "demo@autotrading.ai",
          passwordHash: defaultHash,
          role: "TRADER",
          status: "ACTIVE",
          kycStatus: "VERIFIED",
          phoneNumber: "+91 98000 55443",
          walletBalance: "500000.00",
          currency: "INR",
          autoTradingEnabled: true,
          riskLevel: "MODERATE",
          twoFactorEnabled: false,
          currentPlan: "PRO",
          language: "hi",
        },
        {
          name: "Sandeep Nair (Risk Officer)",
          email: "risk.officer@autotrading.ai",
          passwordHash: defaultHash,
          role: "RISK_OFFICER",
          status: "ACTIVE",
          kycStatus: "VERIFIED",
          phoneNumber: "+91 98330 44556",
          walletBalance: "1000000.00",
          currency: "INR",
          autoTradingEnabled: true,
          riskLevel: "CONSERVATIVE",
          twoFactorEnabled: true,
          currentPlan: "ENTERPRISE",
          language: "en",
        },
        {
          name: "Meera Krishnan (Compliance)",
          email: "compliance@autotrading.ai",
          passwordHash: defaultHash,
          role: "COMPLIANCE_MANAGER",
          status: "ACTIVE",
          kycStatus: "VERIFIED",
          phoneNumber: "+91 98440 77889",
          walletBalance: "750000.00",
          currency: "INR",
          autoTradingEnabled: false,
          riskLevel: "CONSERVATIVE",
          twoFactorEnabled: true,
          currentPlan: "ENTERPRISE",
          language: "ta",
        },
        {
          name: "Sunil Deshmukh (Support Lead)",
          email: "support@autotrading.ai",
          passwordHash: defaultHash,
          role: "SUPPORT_EXECUTIVE",
          status: "ACTIVE",
          kycStatus: "VERIFIED",
          phoneNumber: "+91 98550 99001",
          walletBalance: "500000.00",
          currency: "INR",
          autoTradingEnabled: false,
          riskLevel: "MODERATE",
          twoFactorEnabled: false,
          currentPlan: "ENTERPRISE",
          language: "mr",
        },
        {
          name: "Priya Sharma (HNI Trader)",
          email: "priya.sharma@autotrading.ai",
          passwordHash: defaultHash,
          role: "TRADER",
          status: "ACTIVE",
          kycStatus: "VERIFIED",
          phoneNumber: "+91 99100 23456",
          walletBalance: "820450.00",
          currency: "INR",
          autoTradingEnabled: true,
          riskLevel: "MODERATE",
          twoFactorEnabled: false,
          currentPlan: "PREMIUM",
          language: "hi",
        },
      ];

      for (const u of seededUsers) {
        await db.insert(users).values(u).onConflictDoNothing();
      }
    }

    const [adminUser] = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
    const [demoTrader] = await db.select().from(users).where(eq(users.email, "demo@autotrading.ai")).limit(1);
    const adminId = adminUser?.id || 1;
    const traderId = demoTrader?.id || 2;

    // 2. Seed Subscription Plans
    const existingPlans = await db.select().from(subscriptionPlans).limit(1);
    if (existingPlans.length === 0) {
      for (const plan of ENTERPRISE_SUBSCRIPTION_PLANS) {
        await db.insert(subscriptionPlans).values({
          code: plan.code,
          name: plan.name,
          priceMonthly: plan.priceMonthly.toFixed(2),
          priceAnnual: plan.priceAnnual.toFixed(2),
          aiAnalysesPerMonth: plan.aiAnalysesPerMonth,
          watchlistsLimit: plan.watchlistsLimit,
          demoBotsLimit: plan.demoBotsLimit,
          backtestsPerMonth: plan.backtestsPerMonth,
          features: plan.features,
          isPopular: !!plan.isPopular,
          isActive: true,
        }).onConflictDoNothing();
      }
    }

    // 3. Seed 10 Master AI Agents
    const existingAiAgents = await db.select().from(aiAgents).limit(1);
    if (existingAiAgents.length === 0) {
      for (const agent of MASTER_10_AI_AGENTS) {
        await db.insert(aiAgents).values({
          agentKey: agent.key,
          name: agent.name,
          category: agent.category,
          model: agent.model,
          status: "ACTIVE",
          accuracyScore: agent.accuracy.replace("%", ""),
          totalInvocations: agent.invocations,
          descriptionHi: agent.descriptionHi,
          descriptionEn: agent.descriptionEn,
        }).onConflictDoNothing();
      }
    }

    // 4. Seed Supported Languages
    const existingLanguages = await db.select().from(languageSettings).limit(1);
    if (existingLanguages.length === 0) {
      for (const lang of SUPPORTED_LANGUAGES) {
        await db.insert(languageSettings).values({
          code: lang.code,
          nameEnglish: lang.nameEnglish,
          nameNative: lang.nameNative,
          isDefault: lang.code === "hi",
          isActive: true,
        }).onConflictDoNothing();
      }
    }

    // 5. Seed Branding Settings
    const existingBranding = await db.select().from(brandingSettings).limit(1);
    if (existingBranding.length === 0) {
      await db.insert(brandingSettings).values({
        projectName: "AI Trade Master",
        tagline: "Trade Smarter with AI.",
        primaryColor: "#101D35",
        secondaryColor: "#287BFF",
        accentColor: "#38D9F5",
        successColor: "#16C784",
        supportEmail: "support@aitrademaster.com",
        logoUrl: "/logo.svg",
      });
    }

    // 6. Seed Compliance Records & Disclaimer
    const existingCompliance = await db.select().from(complianceRecords).limit(1);
    if (existingCompliance.length === 0) {
      await db.insert(complianceRecords).values([
        {
          recordType: "SEBI_PAPER_TRADING_DISCLAIMER",
          title: "SEBI Mandated Paper-Trading & Simulation Notice",
          regulationRef: "SEBI/HO/MRD/2026/PAPER_TRADE_REG",
          content: "AI Trade Master operates solely as a financial research and paper-trading simulation platform. No real customer investment deposits are accepted or pooled. Simulated performance does not guarantee future financial returns.",
          version: "v3.2",
        },
        {
          recordType: "RISK_CONSENT",
          title: "Algorithmic Risk & Maximum Drawdown Acknowledgement",
          regulationRef: "SEBI/CIR/MIRSD/2026/ALGO_RISK_v1",
          content: "Users acknowledge all trading strategies, 30-agent signals, and automated bots are executed on virtual demo wallets using historical or delayed simulated feeds.",
          version: "v3.2",
        },
      ]);
    }

    // 7. Seed Subscription Coupons
    const existingCoupons = await db.select().from(subscriptionCoupons).limit(1);
    if (existingCoupons.length === 0) {
      await db.insert(subscriptionCoupons).values([
        { code: "TRADERAI50", discountPct: "50.00", validUntil: "2026-12-31", maxUses: 500, timesUsed: 84 },
        { code: "FESTIVE2026", discountPct: "30.00", validUntil: "2026-12-31", maxUses: 1000, timesUsed: 212 },
        { code: "PROALPHA", discountPct: "20.00", validUntil: "2026-12-31", maxUses: 250, timesUsed: 45 },
      ]);
    }

    // 8. Seed Virtual Wallet for Demo Trader
    const existingWallet = await db.select().from(virtualWallets).where(eq(virtualWallets.userId, traderId)).limit(1);
    if (existingWallet.length === 0) {
      await db.insert(virtualWallets).values({
        userId: traderId,
        currency: "INR",
        balance: "500000.00",
        lockedMargin: "45000.00",
        peakBalance: "542000.00",
      });
    }

    // 9. Seed Active Risk Profile for Demo Trader
    const existingRisk = await db.select().from(riskProfiles).where(eq(riskProfiles.userId, traderId)).limit(1);
    if (existingRisk.length === 0) {
      await db.insert(riskProfiles).values({
        userId: traderId,
        maxDailyLoss: "15000.00",
        maxPositionSize: "100000.00",
        maxOpenPositions: 5,
        maxDrawdownHaltPct: "10.00",
        killSwitchActive: false,
      });
    }

    // 10. Seed Backtest Runs
    const existingBacktests = await db.select().from(backtestRuns).limit(1);
    if (existingBacktests.length === 0) {
      await db.insert(backtestRuns).values([
        {
          userId: traderId,
          strategyCode: "30-Agent Consensus",
          symbol: "RELIANCE",
          timeframe: "15m",
          startDate: "2026-01-01",
          endDate: "2026-09-30",
          initialCapital: "500000.00",
          finalCapital: "648500.00",
          netProfit: "148500.00",
          netProfitPct: "29.70",
          winRate: "74.80",
          totalTrades: 124,
          sharpeRatio: "2.42",
          maxDrawdownPct: "5.40",
        },
        {
          userId: traderId,
          strategyCode: "NSE 9:15 OI Surge",
          symbol: "BANKNIFTY",
          timeframe: "5m",
          startDate: "2026-01-01",
          endDate: "2026-09-30",
          initialCapital: "500000.00",
          finalCapital: "682000.00",
          netProfit: "182000.00",
          netProfitPct: "36.40",
          winRate: "78.40",
          totalTrades: 168,
          sharpeRatio: "2.88",
          maxDrawdownPct: "4.80",
        },
      ]);
    }

    // 11. Seed Trading Bots
    const existingBots = await db.select().from(tradingBots).limit(1);
    if (existingBots.length === 0) {
      await db.insert(tradingBots).values([
        {
          userId: traderId,
          name: "AGNI 30-Agent Master Arbiter",
          strategy: "30-Agent Consensus",
          status: "ACTIVE",
          symbol: "RELIANCE",
          exchange: "Angel One (NSE)",
          allocation: "100000.00",
          maxDailyLoss: "8000.00",
          takeProfitPct: "3.80",
          stopLossPct: "1.60",
          totalTrades: 38,
          winRate: "73.60",
          totalPnl: "28450.00",
          emergencyStopped: false,
        },
        {
          userId: traderId,
          name: "NSE 9:15 AM OI Momentum Hunter",
          strategy: "NSE 9:15 OI Surge",
          status: "ACTIVE",
          symbol: "BANKNIFTY",
          exchange: "Angel One (NSE)",
          allocation: "150000.00",
          maxDailyLoss: "12000.00",
          takeProfitPct: "4.20",
          stopLossPct: "1.80",
          totalTrades: 44,
          winRate: "77.20",
          totalPnl: "42100.00",
          emergencyStopped: false,
        },
        {
          userId: traderId,
          name: "Delta Crypto Whale Scalper",
          strategy: "VWAP Institutional Scalper",
          status: "ACTIVE",
          symbol: "BTC/USDT",
          exchange: "Delta Exchange",
          allocation: "75000.00",
          maxDailyLoss: "6000.00",
          takeProfitPct: "3.20",
          stopLossPct: "1.40",
          totalTrades: 29,
          winRate: "69.00",
          totalPnl: "18200.00",
          emergencyStopped: false,
        },
      ]);
    }

    // 12. Seed Platform Config
    const existingConfigs = await db.select().from(platformConfig).limit(1);
    if (existingConfigs.length === 0) {
      await db.insert(platformConfig).values([
        { key: "MARKET_TRADING_HOURS", value: "09:15-15:30 IST", description: "Daily automated trading session", category: "TRADING" },
        { key: "PAPER_TRADING_MODE", value: "STRICT_SIMULATION_ONLY", description: "All executions are virtual simulations", category: "COMPLIANCE" },
        { key: "CIRCUIT_BREAKER_LIMIT", value: "10.0%", description: "Single stock deviation circuit limit", category: "RISK" },
        { key: "AUTO_EMERGENCY_STOP_DRAWDOWN", value: "12.5%", description: "Platform-wide emergency halt threshold", category: "RISK" },
      ]);
    }

    // 13. Seed Market Data Providers
    const existingProviders = await db.select().from(marketDataProviders).limit(1);
    if (existingProviders.length === 0) {
      await db.insert(marketDataProviders).values([
        { providerName: "Angel One NSE L2 Feed Gateway", exchange: "Angel One (NSE/BSE)", status: "CONNECTED", latencyMs: 12, feedMode: "SIMULATED_AUTHORIZED_FEED" },
        { providerName: "Delta Exchange Perpetual Tick Stream", exchange: "Delta Exchange", status: "CONNECTED", latencyMs: 18, feedMode: "REALTIME_WS_GATEWAY" },
        { providerName: "Interbank Forex & Bullion Aggregator", exchange: "Forex / Commodities", status: "CONNECTED", latencyMs: 24, feedMode: "GLOBAL_EOD_STREAM" },
      ]);
    }

    return true;
  } catch (err) {
    console.error("Master admin seed error:", err);
    return false;
  }
}
