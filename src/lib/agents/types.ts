export type AgentCategory = 
  | "MOMENTUM"
  | "TREND"
  | "VOLATILITY"
  | "VOLUME"
  | "PRICE_ACTION"
  | "SENTIMENT"
  | "RISK"
  | "ASTROLOGY";

export type SignalVerdict = "BUY" | "SELL" | "HOLD";
export type MasterVerdict = "STRONG_BUY" | "BUY" | "HOLD" | "SELL" | "STRONG_SELL";
export type MarketSegment = "INDIAN_ANGEL" | "DELTA_EXCHANGE" | "FOREX";

export interface AgentDefinition {
  id: string;
  number: number;
  name: string;
  category: AgentCategory;
  icon: string;
  tagline: string;
  formula: string;
  defaultWeight: number;
  descriptionHi: string;
}

export interface AstroCompanyProfile {
  symbol: string;
  name: string;
  segment: MarketSegment;
  exchange: "Angel One (NSE)" | "Delta Exchange" | "Forex / Commodities";
  foundedDate: string;
  rashi: string; // Hindi/Sanskrit: Mesh, Vrishabh, Mithun, etc.
  rashiEnglish: string; // Aries, Taurus, etc.
  rashiLord: string; // Surya, Chandra, Mangal, Budh, Guru, Shukra, Shani
  element: "Agni (Fire)" | "Prithvi (Earth)" | "Vayu (Air)" | "Jal (Water)";
  luckyColor: string;
  nakshatra: string;
  rashiSymbol: string;
  currencyPrefix: string; // "₹" or "$"
}

export interface AgentSignal {
  agentId: string;
  agentNumber: number;
  name: string;
  category: AgentCategory;
  icon: string;
  verdict: SignalVerdict;
  confidence: number; // 0 - 100
  reading: string;
  detailHi: string;
  weight: number;
  indicatorKey: string;
  astroDetails?: {
    rashi: string;
    rashiLord: string;
    muhurat: "Ati-Shubh" | "Shubh" | "Samanya (Neutral)" | "Rahu Kaal / Ashubh";
    planetaryPosition: string;
    nakshatraInfluence: string;
  };
}

export interface EntryExitPlan {
  action: "BUY_ENTRY" | "SELL_EXIT" | "HOLD_WAIT";
  entryPrice: number;
  stopLoss: number;
  target1: number;
  target2: number;
  riskReward: string;
  agentConsensusSummary: string;
  astroMuhuratVerdict: string;
}

export interface MasterAgentAnalysis {
  timestamp: string;
  symbol: string;
  companyName: string;
  segment: MarketSegment;
  exchange: string;
  currentPrice: number;
  currencyPrefix: string;
  change24h: number;
  change24hPercent: number;
  verdict: MasterVerdict;
  overallConfidence: number; // 0 - 100
  buyVotes: number;
  sellVotes: number;
  holdVotes: number;
  totalAgents: number; // 30
  weightedScore: number;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  riskRewardRatio: string;
  recommendedActionHi: string;
  entryExitPlan: EntryExitPlan;
  agentSignals: AgentSignal[];
  astroHighlights: {
    rashi: string;
    rashiLord: string;
    verdict: SignalVerdict;
    muhurat: string;
    planetaryTransit: string;
    summary: string;
  };
}

export interface MarketTicker {
  symbol: string;
  name: string;
  segment: MarketSegment;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume: string;
  rashi: string;
  rashiLord: string;
  rashiSymbol: string;
  currencyPrefix: string;
}
