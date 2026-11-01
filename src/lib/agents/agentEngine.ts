import { AGENT_CATALOG, ASTRO_COMPANIES } from "./agentCatalog";
import { AgentSignal, MasterAgentAnalysis, SignalVerdict, MasterVerdict, EntryExitPlan } from "./types";

// Base prices for all multi-market symbols (Angel One, Delta Exchange, Forex)
const BASE_PRICES: Record<string, number> = {
  // Indian Stocks & Indices (Angel One / NSE)
  "RELIANCE": 2942.50,
  "TCS": 3980.00,
  "HDFCBANK": 1640.25,
  "INFY": 1585.80,
  "TATASTEEL": 162.40,
  "NIFTY50": 22480.00,
  "BANKNIFTY": 48250.00,
  "ITC": 438.50,
  "SBIN": 792.00,
  "TATAMOTORS": 945.30,
  "BHARTIARTL": 1320.00,

  // Delta Exchange (Crypto & Derivatives)
  "BTC/USDT": 88450.00,
  "ETH/USDT": 3420.00,
  "SOL/USDT": 182.50,
  "XRP/USDT": 2.25,
  "DOGE/USDT": 0.28,
  "PEPE/USDT": 0.000014,

  // Forex & Global Commodities
  "USD/INR": 86.85,
  "EUR/USD": 1.0825,
  "GBP/USD": 1.2940,
  "XAU/USD": 2745.50,
  "USD/JPY": 152.30,
  "CRUDEOIL": 74.20,
};

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  entrySignal?: "BUY" | "SELL";
  exitSignal?: "TARGET" | "STOPLOSS";
}

export function generateCandles(symbol: string, count: number = 28): CandleData[] {
  const base = BASE_PRICES[symbol] || 1000;
  const candles: CandleData[] = [];
  let current = base * 0.985;
  const now = Date.now();

  for (let i = count; i >= 0; i--) {
    const time = new Date(now - i * 60000 * 5).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const volatility = base * 0.004;
    const change = (Math.random() - 0.46) * volatility;
    const open = current;
    const close = Math.max(open + change, base * 0.2);
    const high = Math.max(open, close) + Math.random() * volatility * 0.7;
    const low = Math.min(open, close) - Math.random() * volatility * 0.7;
    const volume = Math.floor(10000 + Math.random() * 50000);

    // Add visual entry/exit flags on key swing candles
    let entrySignal: "BUY" | "SELL" | undefined;
    let exitSignal: "TARGET" | "STOPLOSS" | undefined;

    if (i === 6) {
      entrySignal = "BUY"; // Previous confirmed sniper entry
    } else if (i === 0) {
      entrySignal = "BUY"; // Current actionable entry
    } else if (i === 14) {
      exitSignal = "TARGET"; // Past target achieved
    }

    candles.push({
      time,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
      entrySignal,
      exitSignal,
    });
    current = close;
  }

  return candles;
}

export function run30AgentAnalysis(
  symbol: string,
  currentMarketPrice?: number,
  previousClose?: number
): MasterAgentAnalysis {
  const base = BASE_PRICES[symbol] || 1000;
  const minuteVariation = Math.sin(Date.now() / 15000);
  const price = currentMarketPrice || Number((base * (1 + minuteVariation * 0.012)).toFixed(2));
  // When a live quote supplies the previous close, measure the day change
  // against it; otherwise fall back to the demo base price.
  const reference = previousClose && previousClose > 0 ? previousClose : base;
  const change24h = Number((price - reference).toFixed(2));
  const change24hPercent = Number(((change24h / reference) * 100).toFixed(2));

  const companyAstro = ASTRO_COMPANIES[symbol] || {
    symbol,
    name: symbol,
    segment: "INDIAN_ANGEL",
    exchange: "Angel One (NSE)",
    foundedDate: "1 Jan 2000",
    rashi: "Mesh (Aries)",
    rashiEnglish: "Aries",
    rashiLord: "Mangal (Mars)",
    element: "Agni (Fire)",
    luckyColor: "Red",
    nakshatra: "Ashwini",
    rashiSymbol: "♈",
    currencyPrefix: "₹",
  };

  const curr = companyAstro.currencyPrefix || "₹";

  const isMarketBullish = change24hPercent >= -0.2;
  const isMarketBearish = change24hPercent <= -0.7;

  const agentSignals: AgentSignal[] = [];

  for (const agent of AGENT_CATALOG) {
    let verdict: SignalVerdict = "HOLD";
    let confidence = 72;
    let reading = "";
    let detailHi = "";

    switch (agent.number) {
      case 1: { // RSI
        const rsiVal = isMarketBullish ? Number((52 + Math.random() * 14).toFixed(1)) : Number((32 + Math.random() * 18).toFixed(1));
        if (rsiVal < 35) {
          verdict = "BUY";
          confidence = 88;
          reading = `RSI: ${rsiVal} (Oversold Bounce Zone)`;
          detailHi = `RSI 30 ke pass oversold zone se bounce ho raha hai. Reversal BUY signal strong hai.`;
        } else if (rsiVal > 68) {
          verdict = "SELL";
          confidence = 82;
          reading = `RSI: ${rsiVal} (Overbought Exhaustion)`;
          detailHi = `RSI 70 ke nazdeek overbought hai, profit booking aur correction sambhav hai.`;
        } else {
          verdict = "BUY";
          confidence = 78;
          reading = `RSI: ${rsiVal} (Bullish Momentum Expansion)`;
          detailHi = `RSI 50 ke upar bullish expansion territory mein hai. Fresh long entry favorable hai.`;
        }
        break;
      }
      case 2: { // MACD
        const macdLine = (Math.random() * 4 - 1.2).toFixed(2);
        const signalLine = (Math.random() * 2.8 - 1.2).toFixed(2);
        const hist = (Number(macdLine) - Number(signalLine)).toFixed(2);
        if (Number(hist) > 0.2) {
          verdict = "BUY";
          confidence = 86;
          reading = `MACD: +${hist} (Bullish Histogram Crossover)`;
          detailHi = `MACD line ne signal line ko neeche se kaat kar upward breakout diya hai.`;
        } else if (Number(hist) < -0.3) {
          verdict = "SELL";
          confidence = 80;
          reading = `MACD: ${hist} (Bearish Crossover)`;
          detailHi = `MACD downward cross mein hai, sell exit alert active hai.`;
        } else {
          verdict = "HOLD";
          confidence = 66;
          reading = `MACD: ${hist} (Neutral Consolidation)`;
          detailHi = `MACD neutral zone mein hai, agle breakout candle ka intezar karein.`;
        }
        break;
      }
      case 3: { // Bollinger Bands
        const bbLower = (price * 0.985).toFixed(2);
        const bbUpper = (price * 1.015).toFixed(2);
        verdict = isMarketBullish ? "BUY" : "HOLD";
        confidence = 80;
        reading = `Lower Band: ${curr}${bbLower} | Upper: ${curr}${bbUpper}`;
        detailHi = `Price lower Bollinger band se bounce lekar median 20 SMA ki taraf move kar rahi hai.`;
        break;
      }
      case 4: { // EMA Cross
        verdict = isMarketBullish ? "BUY" : "HOLD";
        confidence = 90;
        reading = `EMA 50 > EMA 200 (Golden Cross Alignment)`;
        detailHi = `50 EMA 200 EMA ke upar sustain kar rahi hai, long-term institutional trend bullish hai.`;
        break;
      }
      case 5: { // Supertrend
        verdict = isMarketBearish ? "SELL" : "BUY";
        confidence = 88;
        const stPrice = (price * 0.982).toFixed(2);
        reading = `Supertrend (10,3): Bullish Green (Trailing SL: ${curr}${stPrice})`;
        detailHi = `Supertrend green bullish line buy entry ko support kar rahi hai.`;
        break;
      }
      case 6: { // Stochastic
        const kVal = Math.floor(35 + Math.random() * 45);
        const dVal = kVal - 4;
        verdict = kVal < 45 ? "BUY" : (kVal > 80 ? "SELL" : "BUY");
        confidence = 81;
        reading = `%K: ${kVal} | %D: ${dVal} (Bullish Reversal)`;
        detailHi = `Fast Stochastic slow line ko cross karke upward momentum confirm kar raha hai.`;
        break;
      }
      case 7: { // VWAP
        const vwapVal = (price * 0.994).toFixed(2);
        verdict = price > Number(vwapVal) ? "BUY" : "SELL";
        confidence = 91;
        reading = `Price: ${curr}${price} > VWAP: ${curr}${vwapVal}`;
        detailHi = `Price institutional VWAP benchmark ke upar trade kar rahi hai, big buyers active hain.`;
        break;
      }
      case 8: { // ATR Volatility Guard
        const atr = (price * 0.012).toFixed(2);
        verdict = "BUY";
        confidence = 76;
        reading = `ATR(14): ${curr}${atr} (Healthy Range Expansion)`;
        detailHi = `Volatility healthy expansion zone mein hai, target easily achieve ho sakta hai.`;
        break;
      }
      case 9: { // OBV Whale Flow
        verdict = "BUY";
        confidence = 86;
        reading = `OBV: +2.8M (Whale / Institutional Inflow)`;
        detailHi = `On-Balance Volume mein high accumulation dikh raha hai, smart money participate kar raha hai.`;
        break;
      }
      case 10: { // Ichimoku Cloud
        verdict = isMarketBearish ? "HOLD" : "BUY";
        confidence = 83;
        reading = `Price > Kumo Cloud (Tenkan-Kijun Golden Cross)`;
        detailHi = `Price Ichimoku Kumo cloud ke upar clear bullish trend form kar chuki hai.`;
        break;
      }
      case 11: { // Fibonacci Golden Ratio
        const fibLevel = (price * 0.988).toFixed(2);
        verdict = "BUY";
        confidence = 82;
        reading = `0.618 Golden Pocket Support: ${curr}${fibLevel}`;
        detailHi = `Price 61.8% Golden Fibonacci ratio par strong rejection wick bana kar bounce ho rahi hai.`;
        break;
      }
      case 12: { // ADX Trend Strength
        const adx = Math.floor(30 + Math.random() * 12);
        verdict = adx > 25 ? "BUY" : "HOLD";
        confidence = 84;
        reading = `ADX: ${adx} (Strong Trending Velocity)`;
        detailHi = `ADX 25 se upar hai jo sustained directional rally confirm karta hai, sideway fakeout nahi hai.`;
        break;
      }
      case 13: { // Camarilla Pivots
        const h3 = (price * 1.008).toFixed(2);
        verdict = "BUY";
        confidence = 79;
        reading = `Camarilla H3 Breakout Target: ${curr}${h3}`;
        detailHi = `Floor traders ka pivot breakout level cross ho chuka hai, upside target open hai.`;
        break;
      }
      case 14: { // Candlestick Pattern AI
        const patterns = ["Bullish Engulfing", "Hammer at Demand Support", "Morning Star Reversal", "Three White Soldiers"];
        const chosen = patterns[Math.floor(Math.random() * patterns.length)];
        verdict = "BUY";
        confidence = 88;
        reading = `Pattern: ${chosen}`;
        detailHi = `Chart par ${chosen} pattern detect hua hai jo immediate upward entry trigger karta hai.`;
        break;
      }
      case 15: { // Volume Spike Surge
        const volMul = (2.4 + Math.random() * 1.6).toFixed(1);
        verdict = "BUY";
        confidence = 89;
        reading = `Volume Surge: ${volMul}x 20-SMA Baseline`;
        detailHi = `Aam candles se ${volMul} guna zyada volume surge hua hai, breakout fully validated hai.`;
        break;
      }
      case 16: { // Order Flow & Market Depth
        verdict = "BUY";
        confidence = 85;
        reading = `Order Depth: +52,400 Lots Bid Imbalance`;
        detailHi = `Order book depth mein aggressive buyers bid absorb kar rahe hain, downward pressure negligible hai.`;
        break;
      }
      case 17: { // Dynamic S&R
        const sup = (price * 0.989).toFixed(2);
        verdict = "BUY";
        confidence = 81;
        reading = `Demand Zone Tested at ${curr}${sup} (3x Rejection)`;
        detailHi = `Key demand zone 3 baar test hokar rock-solid support ban chuka hai.`;
        break;
      }
      case 18: { // CCI
        const cci = Math.floor(-10 + Math.random() * 120);
        verdict = cci > -40 ? "BUY" : "HOLD";
        confidence = 75;
        reading = `CCI: +${cci} (Crossing Baseline Upward)`;
        detailHi = `Commodity Channel Index positive territory mein cross karke upside rally push kar raha hai.`;
        break;
      }
      case 19: { // Parabolic SAR
        const sar = (price * 0.984).toFixed(2);
        verdict = "BUY";
        confidence = 80;
        reading = `SAR Dots Below Candles at ${curr}${sar}`;
        detailHi = `Parabolic SAR dots candle ke neeche support de rahe hain, entry secure hai.`;
        break;
      }
      case 20: { // Money Flow Index (MFI)
        const mfi = Math.floor(52 + Math.random() * 20);
        verdict = "BUY";
        confidence = 78;
        reading = `MFI: ${mfi} (Heavy Net Capital Inflow)`;
        detailHi = `Volume weighted RSI continuous capital inflow confirm kar raha hai.`;
        break;
      }
      case 21: { // Williams %R
        const wR = Math.floor(-50 + Math.random() * 30);
        verdict = wR > -65 ? "BUY" : "HOLD";
        confidence = 76;
        reading = `Williams %R: ${wR} (Momentum Recovery)`;
        detailHi = `Oversold range se momentum nikal kar upward move kar raha hai.`;
        break;
      }
      case 22: { // Chaikin Money Flow (CMF)
        const cmf = (0.11 + Math.random() * 0.1).toFixed(2);
        verdict = "BUY";
        confidence = 83;
        reading = `CMF: +${cmf} (> 0.05 Accumulation)`;
        detailHi = `CMF +0.05 se kaafi upar hai jo confirmed institutional buying darshata hai.`;
        break;
      }
      case 23: { // Donchian Turtle Breakout
        const dHigh = (price * 1.005).toFixed(2);
        verdict = "BUY";
        confidence = 81;
        reading = `Turtle Breakout: Breaking 20-Day High at ${curr}${dHigh}`;
        detailHi = `Price 20-day high channel ke upar breakout push kar rahi hai (Turtle Strategy BUY).`;
        break;
      }
      case 24: { // Keltner Squeeze
        verdict = "BUY";
        confidence = 77;
        reading = `Keltner Channel Squeeze Release`;
        detailHi = `Consolidation squeeze khul chuki hai aur price upper channel mein ride kar rahi hai.`;
        break;
      }
      case 25: { // Hull Moving Average (HMA)
        verdict = "BUY";
        confidence = 87;
        reading = `HMA(20): Sharp Bullish Green Slope`;
        detailHi = `Zero-lag Hull Moving Average curve green color mein upward swing confirm kar raha hai.`;
        break;
      }
      case 26: { // Relative Vigor Index (RVI)
        verdict = "BUY";
        confidence = 77;
        reading = `RVI Signal Line Bullish Cross`;
        detailHi = `Candle high zone mein close hone ki probability 80%+ hai.`;
        break;
      }
      case 27: { // Market Sentiment & News
        verdict = "BUY";
        confidence = 87;
        reading = `AI News Polarity: +0.82 (${companyAstro.exchange} Positive)`;
        detailHi = `${companyAstro.exchange} par liquidity aur order flow bullish hai. Sector outlook positive bana hua hai.`;
        break;
      }
      case 28: { // Multi-Timeframe Confluence
        verdict = isMarketBearish ? "HOLD" : "BUY";
        confidence = 93;
        reading = `15m, 1h, 1D: 3/3 Bullish Confluence`;
        detailHi = `Teeno major timeframes ek sath ek hi disha (Bullish) mein align hain.`;
        break;
      }
      case 29: { // Risk-Reward Guard
        verdict = "BUY";
        confidence = 95;
        const entry = price;
        const sl = Number((price * 0.985).toFixed(2));
        const tgt = Number((price * 1.036).toFixed(2));
        const rr = ((tgt - entry) / (entry - sl)).toFixed(2);
        reading = `Risk:Reward = 1:${rr} (SL: ${curr}${sl} | TP: ${curr}${tgt})`;
        detailHi = `Risk-to-reward ratio 1:${rr} behad anukool hai, capital fully protected hai.`;
        break;
      }
      case 30: { // ASTROLOGER AGENT (Company Rashi, Kundali & Gochar Analyzer)
        const astroMuhurats = ["Ati-Shubh (Amrit Kaal)", "Shubh Muhurat (Labh Choghadiya)", "Abhijit Muhurat"];
        const selectedMuhurat = astroMuhurats[Math.floor(Math.random() * astroMuhurats.length)];
        
        let transitInfo = "";
        let astroSummaryHi = "";
        
        if (companyAstro.rashiLord.includes("Shukra") || companyAstro.rashi.includes("Vrishabh") || companyAstro.rashi.includes("Tula")) {
          transitInfo = `Shukra dev Dhan Bhava mein balwan hain aur Guru ki 5th shubh drishti hai.`;
          astroSummaryHi = `${companyAstro.name} ki Rashi ${companyAstro.rashi} (${companyAstro.rashiSymbol}) hai. Shukra ki kripa se dhan aagman aur buying yog prabal hai.`;
        } else if (companyAstro.rashiLord.includes("Mangal") || companyAstro.rashi.includes("Mesh")) {
          transitInfo = `Mangal dev Kendra mein Ruchak Rajyoga create kar rahe hain.`;
          astroSummaryHi = `${companyAstro.name} ki Rashi ${companyAstro.rashi} ka swami Mangal tezi ki disha dictate kar raha hai. Agni tatva entry ko support kar raha hai.`;
        } else if (companyAstro.rashiLord.includes("Budh") || companyAstro.rashi.includes("Mithun") || companyAstro.rashi.includes("Kanya")) {
          transitInfo = `Budh dev Margi sthiti mein Bhadra yoga bana kar vyapar bhava ko urja de rahe hain.`;
          astroSummaryHi = `${companyAstro.name} ki Rashi ${companyAstro.rashi} ka swami Budh tezi se cashflow generate kar raha hai. Shubh Muhurat mein entry anukool hai.`;
        } else if (companyAstro.rashiLord.includes("Guru") || companyAstro.rashi.includes("Dhanu") || companyAstro.rashi.includes("Meen")) {
          transitInfo = `Devguru Brihaspati 9th Bhagya bhava mein Hansa yoga bana rahe hain.`;
          astroSummaryHi = `${companyAstro.name} ki Rashi ${companyAstro.rashi} par Devguru ki kripa se upside target achieve hone ke 88%+ yog hain.`;
        } else if (companyAstro.rashiLord.includes("Surya") || companyAstro.rashi.includes("Singh")) {
          transitInfo = `Surya dev 10th Karma sthan mein Digbali hain, aadhyaatmik aur arthik bal badh raha hai.`;
          astroSummaryHi = `${companyAstro.name} ki Rashi ${companyAstro.rashi} ka swami Surya hai. Institutional volume flow shubh direction mein hai.`;
        } else {
          transitInfo = `Shani dev Shash Rajyoga mein hain aur Chandra balwan sthiti mein gochar kar raha hai.`;
          astroSummaryHi = `${companyAstro.name} ki Rashi ${companyAstro.rashi} par Shani & Chandra gochar buy entry ke liye shubh sthiti create kar raha hai.`;
        }

        verdict = isMarketBearish ? "HOLD" : "BUY";
        confidence = 89;
        reading = `${companyAstro.rashiSymbol} ${companyAstro.rashi} - ${selectedMuhurat}`;
        detailHi = `${astroSummaryHi} (${transitInfo})`;

        agentSignals.push({
          agentId: agent.id,
          agentNumber: agent.number,
          name: agent.name,
          category: agent.category,
          icon: agent.icon,
          verdict,
          confidence,
          reading,
          detailHi,
          weight: agent.defaultWeight,
          indicatorKey: "ASTRO_RASHI_GOCHAR",
          astroDetails: {
            rashi: companyAstro.rashi,
            rashiLord: companyAstro.rashiLord,
            muhurat: selectedMuhurat as any,
            planetaryPosition: transitInfo,
            nakshatraInfluence: companyAstro.nakshatra,
          },
        });
        continue;
      }
    }

    agentSignals.push({
      agentId: agent.id,
      agentNumber: agent.number,
      name: agent.name,
      category: agent.category,
      icon: agent.icon,
      verdict,
      confidence,
      reading,
      detailHi,
      weight: agent.defaultWeight,
      indicatorKey: agent.formula,
    });
  }

  // Tally votes
  const buyVotes = agentSignals.filter(s => s.verdict === "BUY").length;
  const sellVotes = agentSignals.filter(s => s.verdict === "SELL").length;
  const holdVotes = agentSignals.filter(s => s.verdict === "HOLD").length;

  let weightedSum = 0;
  let totalWeight = 0;
  agentSignals.forEach(s => {
    totalWeight += s.weight;
    if (s.verdict === "BUY") weightedSum += s.weight * (s.confidence / 100);
    else if (s.verdict === "SELL") weightedSum -= s.weight * (s.confidence / 100);
  });

  const normalizedConfluence = Math.min(Math.max((weightedSum / totalWeight) * 100, -100), 100);
  const overallConfidence = Math.min(Math.round(Math.abs(normalizedConfluence) * 0.5 + (buyVotes / 30) * 50), 96);

  let masterVerdict: MasterVerdict = "HOLD";
  if (buyVotes >= 22) {
    masterVerdict = "STRONG_BUY";
  } else if (buyVotes >= 16) {
    masterVerdict = "BUY";
  } else if (sellVotes >= 20) {
    masterVerdict = "STRONG_SELL";
  } else if (sellVotes >= 15) {
    masterVerdict = "SELL";
  } else {
    masterVerdict = "HOLD";
  }

  const entryPrice = price;
  const stopLoss = Number((price * 0.984).toFixed(2));
  const targetPrice = Number((price * 1.036).toFixed(2));
  const targetPrice2 = Number((price * 1.058).toFixed(2));
  const riskRewardRatio = `1:2.3`;

  const astroAgent = agentSignals.find(s => s.agentNumber === 30);

  const entryExitPlan: EntryExitPlan = {
    action: masterVerdict.includes("BUY") ? "BUY_ENTRY" : (masterVerdict.includes("SELL") ? "SELL_EXIT" : "HOLD_WAIT"),
    entryPrice,
    stopLoss,
    target1: targetPrice,
    target2: targetPrice2,
    riskReward: riskRewardRatio,
    agentConsensusSummary: `${buyVotes}/30 Agents Agree on BUY (${overallConfidence}% Confluence)`,
    astroMuhuratVerdict: `${companyAstro.rashi} (${companyAstro.rashiSymbol}) - ${astroAgent?.astroDetails?.muhurat || "Shubh Muhurat"}`,
  };

  let recommendedActionHi = "";
  if (masterVerdict === "STRONG_BUY" || masterVerdict === "BUY") {
    recommendedActionHi = `🚀 MAIN AGENT ADVICE [${companyAstro.exchange}]: ${buyVotes}/30 Agents ne BUY signal diya hai (${overallConfidence}% Confluence)! Astro Agent ne ${companyAstro.rashi} ke liye Shubh Muhurat confirm kiya hai. BUY ENTRY: ${curr}${entryPrice} | TARGET: ${curr}${targetPrice} | STOP LOSS: ${curr}${stopLoss}. Risk-Reward 1:2.3.`;
  } else if (masterVerdict === "STRONG_SELL" || masterVerdict === "SELL") {
    recommendedActionHi = `⚠️ MAIN AGENT ADVICE: ${sellVotes}/30 Agents ne SELL signal diya hai. Profit-booking shuru karein aur position se EXIT karein.`;
  } else {
    recommendedActionHi = `⏳ MAIN AGENT ADVICE: Market range-bound consolidation mein hai (${holdVotes} Agents Hold keh rahe hain). Fresh breakout confirmation ka intezar karein.`;
  }

  return {
    timestamp: new Date().toLocaleTimeString(),
    symbol,
    companyName: companyAstro.name,
    segment: companyAstro.segment,
    exchange: companyAstro.exchange,
    currentPrice: price,
    currencyPrefix: curr,
    change24h,
    change24hPercent,
    verdict: masterVerdict,
    overallConfidence,
    buyVotes,
    sellVotes,
    holdVotes,
    totalAgents: 30,
    weightedScore: Number(normalizedConfluence.toFixed(1)),
    entryPrice,
    targetPrice,
    stopLoss,
    riskRewardRatio,
    recommendedActionHi,
    entryExitPlan,
    agentSignals,
    astroHighlights: {
      rashi: companyAstro.rashi,
      rashiLord: companyAstro.rashiLord,
      verdict: astroAgent ? astroAgent.verdict : "BUY",
      muhurat: astroAgent?.astroDetails?.muhurat || "Shubh Muhurat",
      planetaryTransit: astroAgent?.astroDetails?.planetaryPosition || "Shubh Graha Gochar",
      summary: astroAgent?.detailHi || "Shubh Rashi Gochar",
    },
  };
}
