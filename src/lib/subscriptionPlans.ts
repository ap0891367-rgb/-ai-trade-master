export interface SubscriptionPlanDef {
  code: "FREE" | "STARTER" | "PRO" | "PREMIUM" | "ENTERPRISE";
  name: string;
  priceMonthly: number; // in INR
  priceAnnual: number;  // in INR
  aiAnalysesPerMonth: number;
  watchlistsLimit: number;
  demoBotsLimit: number;
  backtestsPerMonth: number;
  isPopular?: boolean;
  features: string[];
}

export const ENTERPRISE_SUBSCRIPTION_PLANS: SubscriptionPlanDef[] = [
  {
    code: "FREE",
    name: "Free Trial / Basic",
    priceMonthly: 0,
    priceAnnual: 0,
    aiAnalysesPerMonth: 20,
    watchlistsLimit: 3,
    demoBotsLimit: 1,
    backtestsPerMonth: 2,
    features: [
      "20 AI analyses/month",
      "3 Watchlists",
      "1 Demo Bot",
      "2 Backtests/month",
      "Realtime NSE simulated feed",
      "Basic risk monitoring",
    ],
  },
  {
    code: "STARTER",
    name: "Starter Trader",
    priceMonthly: 199,
    priceAnnual: 1990,
    aiAnalysesPerMonth: 200,
    watchlistsLimit: 10,
    demoBotsLimit: 3,
    backtestsPerMonth: 20,
    features: [
      "200 AI analyses/month",
      "10 Watchlists",
      "3 Demo Bots",
      "20 Backtests/month",
      "NSE 9:15 AM OI Scanner Agent",
      "Email + Sound signal alerts",
    ],
  },
  {
    code: "PRO",
    name: "Pro Quant",
    priceMonthly: 499,
    priceAnnual: 4990,
    aiAnalysesPerMonth: 1000,
    watchlistsLimit: 25,
    demoBotsLimit: 10,
    backtestsPerMonth: 100,
    isPopular: true,
    features: [
      "1,000 AI analyses/month",
      "25 Watchlists",
      "10 Demo Bots",
      "100 Backtests/month",
      "Astro-Technical Rashi confluence",
      "Sub-tick order execution slippage",
      "Priority customer helpdesk",
    ],
  },
  {
    code: "PREMIUM",
    name: "Premium Alpha",
    priceMonthly: 999,
    priceAnnual: 9990,
    aiAnalysesPerMonth: 3000,
    watchlistsLimit: 100,
    demoBotsLimit: 25,
    backtestsPerMonth: 300,
    features: [
      "3,000 AI analyses/month",
      "100 Watchlists",
      "25 Demo Bots",
      "300 Backtests/month",
      "All 10 Master AI Agents unlocked",
      "Custom algorithmic bot scripting",
      "VIP Dedicated Support Lead",
    ],
  },
  {
    code: "ENTERPRISE",
    name: "Institutional Enterprise",
    priceMonthly: 4999,
    priceAnnual: 49990,
    aiAnalysesPerMonth: 100000,
    watchlistsLimit: 1000,
    demoBotsLimit: 250,
    backtestsPerMonth: 5000,
    features: [
      "Custom Pricing & Organization Management",
      "Team Accounts & Multi-seat RBAC",
      "Custom Quant Analytics & Backtest Clusters",
      "Authorized WebSocket & REST API Access",
      "Dedicated Enterprise Account Manager",
      "SLA 99.9% Uptime Guarantee",
    ],
  },
];
