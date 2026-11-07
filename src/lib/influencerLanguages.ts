/**
 * Language packs for the on-dashboard "AI anchor" (the human presenter that
 * announces the verdict). Everything the anchor says is generated here so the
 * dashboard, the subtitle and the speech synthesis stay in sync.
 */

export type InfluencerLangCode =
  | "en"
  | "hi"
  | "hinglish"
  | "mr"
  | "gu"
  | "bn"
  | "pa"
  | "ta"
  | "te"
  | "kn"
  | "ml";

export type VerdictKind = "buy" | "sell" | "hold";
export type TrendKind = "bull" | "bear" | "neutral";
export type RiskKind = "low" | "medium" | "high";

export interface InfluencerLanguage {
  code: InfluencerLangCode;
  label: string;
  /** Name shown inside the selector, in its own script. */
  native: string;
  /** BCP-47 tag handed to the SpeechSynthesis API. */
  bcp47: string;
}

export const INFLUENCER_LANGUAGES: InfluencerLanguage[] = [
  { code: "en", label: "English", native: "English", bcp47: "en-IN" },
  { code: "hi", label: "Hindi", native: "हिन्दी", bcp47: "hi-IN" },
  { code: "hinglish", label: "Hinglish", native: "Hinglish", bcp47: "hi-IN" },
  { code: "mr", label: "Marathi", native: "मराठी", bcp47: "mr-IN" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી", bcp47: "gu-IN" },
  { code: "bn", label: "Bengali", native: "বাংলা", bcp47: "bn-IN" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ", bcp47: "pa-IN" },
  { code: "ta", label: "Tamil", native: "தமிழ்", bcp47: "ta-IN" },
  { code: "te", label: "Telugu", native: "తెలుగు", bcp47: "te-IN" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ", bcp47: "kn-IN" },
  { code: "ml", label: "Malayalam", native: "മലയാളം", bcp47: "ml-IN" },
];

export const DEFAULT_INFLUENCER_LANG: InfluencerLangCode = "hi";

export function isInfluencerLang(value: unknown): value is InfluencerLangCode {
  return INFLUENCER_LANGUAGES.some((language) => language.code === value);
}

export function getInfluencerLanguage(code: InfluencerLangCode): InfluencerLanguage {
  return INFLUENCER_LANGUAGES.find((language) => language.code === code) ?? INFLUENCER_LANGUAGES[0];
}

interface ScriptPack {
  /** Templates receive {symbol} and {confidence}. */
  buy: string;
  sell: string;
  hold: string;
  labels: Record<VerdictKind, string>;
  trend: Record<TrendKind, string>;
  risk: Record<RiskKind, string>;
  ui: {
    listen: string;
    voiceOn: string;
    speaking: string;
    disclaimer: string;
  };
}

const PACKS: Record<InfluencerLangCode, ScriptPack> = {
  en: {
    buy: "{symbol} is showing strong buying interest. Confidence {confidence} percent.",
    sell: "{symbol} is under selling pressure. Confidence {confidence} percent.",
    hold: "{symbol} looks indecisive right now. Waiting is the safer choice. Confidence {confidence} percent.",
    labels: { buy: "BUY", sell: "SELL", hold: "WAIT" },
    trend: { bull: "Bullish", bear: "Bearish", neutral: "Sideways" },
    risk: { low: "Low", medium: "Medium", high: "High" },
    ui: {
      listen: "Listen",
      voiceOn: "Voice On",
      speaking: "Speaking…",
      disclaimer: "Paper trading demo. Not investment advice.",
    },
  },
  hi: {
    buy: "{symbol} में तेज़ खरीदारी दिख रही है। भरोसा {confidence} प्रतिशत है।",
    sell: "{symbol} में बिकवाली का दबाव है। भरोसा {confidence} प्रतिशत है।",
    hold: "{symbol} में अभी इंतज़ार करना बेहतर है। भरोसा {confidence} प्रतिशत है।",
    labels: { buy: "खरीदें", sell: "बेचें", hold: "रुकें" },
    trend: { bull: "तेज़ी", bear: "मंदी", neutral: "साइडवेज़" },
    risk: { low: "कम", medium: "मध्यम", high: "ज़्यादा" },
    ui: {
      listen: "सुनें",
      voiceOn: "आवाज़ चालू",
      speaking: "बोल रही हूँ…",
      disclaimer: "पेपर ट्रेडिंग डेमो। निवेश सलाह नहीं।",
    },
  },
  hinglish: {
    buy: "{symbol} me tez kharidari dikh rahi hai. Bharosa {confidence} percent hai.",
    sell: "{symbol} me bikwali ka dabav hai. Bharosa {confidence} percent hai.",
    hold: "{symbol} me abhi intezaar karna behtar hai. Bharosa {confidence} percent hai.",
    labels: { buy: "BUY KARO", sell: "SELL KARO", hold: "RUKO" },
    trend: { bull: "Tezi", bear: "Mandi", neutral: "Sideways" },
    risk: { low: "Kam", medium: "Medium", high: "Zyada" },
    ui: {
      listen: "Suno",
      voiceOn: "Voice On",
      speaking: "Bol rahi hoon…",
      disclaimer: "Paper trading demo. Investment advice nahi.",
    },
  },
  mr: {
    buy: "{symbol} मध्ये जोरदार खरेदी दिसत आहे. विश्वास {confidence} टक्के आहे.",
    sell: "{symbol} मध्ये विक्रीचा दबाव आहे. विश्वास {confidence} टक्के आहे.",
    hold: "{symbol} मध्ये आत्ता थांबणे बरे आहे. विश्वास {confidence} टक्के आहे.",
    labels: { buy: "खरेदी", sell: "विक्री", hold: "थांबा" },
    trend: { bull: "तेजी", bear: "मंदी", neutral: "स्थिर" },
    risk: { low: "कमी", medium: "मध्यम", high: "जास्त" },
    ui: {
      listen: "ऐका",
      voiceOn: "आवाज चालू",
      speaking: "बोलत आहे…",
      disclaimer: "पेपर ट्रेडिंग डेमो. गुंतवणूक सल्ला नाही.",
    },
  },
  gu: {
    buy: "{symbol} માં જોરદાર ખરીદી દેખાઈ રહી છે. ભરોસો {confidence} ટકા છે.",
    sell: "{symbol} માં વેચાણનું દબાણ છે. ભરોસો {confidence} ટકા છે.",
    hold: "{symbol} માં અત્યારે થોભવું સારું છે. ભરોસો {confidence} ટકા છે.",
    labels: { buy: "ખરીદો", sell: "વેચો", hold: "થોભો" },
    trend: { bull: "તેજી", bear: "મંદી", neutral: "સ્થિર" },
    risk: { low: "ઓછું", medium: "મધ્યમ", high: "વધુ" },
    ui: {
      listen: "સાંભળો",
      voiceOn: "અવાજ ચાલુ",
      speaking: "બોલી રહી છું…",
      disclaimer: "પેપર ટ્રેડિંગ ડેમો. રોકાણ સલાહ નથી.",
    },
  },
  bn: {
    buy: "{symbol} এ জোরালো কেনাকাটা দেখা যাচ্ছে। আত্মবিশ্বাস {confidence} শতাংশ।",
    sell: "{symbol} এ বিক্রির চাপ আছে। আত্মবিশ্বাস {confidence} শতাংশ।",
    hold: "{symbol} এ এখন অপেক্ষা করা ভালো। আত্মবিশ্বাস {confidence} শতাংশ।",
    labels: { buy: "কিনুন", sell: "বেচুন", hold: "অপেক্ষা" },
    trend: { bull: "তেজি", bear: "মন্দা", neutral: "স্থির" },
    risk: { low: "কম", medium: "মাঝারি", high: "বেশি" },
    ui: {
      listen: "শুনুন",
      voiceOn: "ভয়েস চালু",
      speaking: "বলছি…",
      disclaimer: "পেপার ট্রেডিং ডেমো। বিনিয়োগ পরামর্শ নয়।",
    },
  },
  pa: {
    buy: "{symbol} ਵਿੱਚ ਤੇਜ਼ ਖਰੀਦਦਾਰੀ ਦਿਖ ਰਹੀ ਹੈ। ਭਰੋਸਾ {confidence} ਫੀਸਦੀ ਹੈ।",
    sell: "{symbol} ਵਿੱਚ ਵਿਕਰੀ ਦਾ ਦਬਾਅ ਹੈ। ਭਰੋਸਾ {confidence} ਫੀਸਦੀ ਹੈ।",
    hold: "{symbol} ਵਿੱਚ ਹੁਣ ਇੰਤਜ਼ਾਰ ਕਰਨਾ ਠੀਕ ਹੈ। ਭਰੋਸਾ {confidence} ਫੀਸਦੀ ਹੈ।",
    labels: { buy: "ਖਰੀਦੋ", sell: "ਵੇਚੋ", hold: "ਰੁਕੋ" },
    trend: { bull: "ਤੇਜ਼ੀ", bear: "ਮੰਦੀ", neutral: "ਸਥਿਰ" },
    risk: { low: "ਘੱਟ", medium: "ਦਰਮਿਆਨਾ", high: "ਵੱਧ" },
    ui: {
      listen: "ਸੁਣੋ",
      voiceOn: "ਆਵਾਜ਼ ਚਾਲੂ",
      speaking: "ਬੋਲ ਰਹੀ ਹਾਂ…",
      disclaimer: "ਪੇਪਰ ਟ੍ਰੇਡਿੰਗ ਡੈਮੋ। ਨਿਵੇਸ਼ ਸਲਾਹ ਨਹੀਂ।",
    },
  },
  ta: {
    buy: "{symbol} இல் வலுவான வாங்குதல் உள்ளது. நம்பிக்கை {confidence} சதவீதம்.",
    sell: "{symbol} இல் விற்பனை அழுத்தம் உள்ளது. நம்பிக்கை {confidence} சதவீதம்.",
    hold: "{symbol} இல் இப்போது காத்திருப்பது நல்லது. நம்பிக்கை {confidence} சதவீதம்.",
    labels: { buy: "வாங்கு", sell: "விற்க", hold: "காத்திரு" },
    trend: { bull: "ஏற்றம்", bear: "இறக்கம்", neutral: "நிலை" },
    risk: { low: "குறைவு", medium: "நடுத்தரம்", high: "அதிகம்" },
    ui: {
      listen: "கேள்",
      voiceOn: "குரல் இயக்கத்தில்",
      speaking: "பேசுகிறேன்…",
      disclaimer: "பேப்பர் டிரேடிங் டெமோ. முதலீட்டு ஆலோசனை அல்ல.",
    },
  },
  te: {
    buy: "{symbol} లో బలమైన కొనుగోలు కనిపిస్తోంది. నమ్మకం {confidence} శాతం.",
    sell: "{symbol} లో అమ్మకాల ఒత్తిడి ఉంది. నమ్మకం {confidence} శాతం.",
    hold: "{symbol} లో ఇప్పుడు వేచి ఉండటం మంచిది. నమ్మకం {confidence} శాతం.",
    labels: { buy: "కొనండి", sell: "అమ్మండి", hold: "ఆగండి" },
    trend: { bull: "పెరుగుదల", bear: "తగ్గుదల", neutral: "స్థిరం" },
    risk: { low: "తక్కువ", medium: "మధ్యస్థం", high: "ఎక్కువ" },
    ui: {
      listen: "వినండి",
      voiceOn: "వాయిస్ ఆన్",
      speaking: "మాట్లాడుతున్నాను…",
      disclaimer: "పేపర్ ట్రేడింగ్ డెమో. పెట్టుబడి సలహా కాదు.",
    },
  },
  kn: {
    buy: "{symbol} ನಲ್ಲಿ ಬಲವಾದ ಖರೀದಿ ಕಾಣುತ್ತಿದೆ. ವಿಶ್ವಾಸ {confidence} ಪ್ರತಿಶತ.",
    sell: "{symbol} ನಲ್ಲಿ ಮಾರಾಟದ ಒತ್ತಡ ಇದೆ. ವಿಶ್ವಾಸ {confidence} ಪ್ರತಿಶತ.",
    hold: "{symbol} ನಲ್ಲಿ ಈಗ ಕಾಯುವುದು ಒಳ್ಳೆಯದು. ವಿಶ್ವಾಸ {confidence} ಪ್ರತಿಶತ.",
    labels: { buy: "ಖರೀದಿಸಿ", sell: "ಮಾರಿ", hold: "ನಿಲ್ಲಿಸಿ" },
    trend: { bull: "ಏರಿಕೆ", bear: "ಇಳಿಕೆ", neutral: "ಸ್ಥಿರ" },
    risk: { low: "ಕಡಿಮೆ", medium: "ಮಧ್ಯಮ", high: "ಹೆಚ್ಚು" },
    ui: {
      listen: "ಕೇಳಿ",
      voiceOn: "ಧ್ವನಿ ಆನ್",
      speaking: "ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ…",
      disclaimer: "ಪೇಪರ್ ಟ್ರೇಡಿಂಗ್ ಡೆಮೊ. ಹೂಡಿಕೆ ಸಲಹೆ ಅಲ್ಲ.",
    },
  },
  ml: {
    buy: "{symbol} ൽ ശക്തമായ വാങ്ങൽ കാണുന്നു. വിശ്വാസം {confidence} ശതമാനം.",
    sell: "{symbol} ൽ വിൽപ്പന സമ്മർദ്ദമുണ്ട്. വിശ്വാസം {confidence} ശതമാനം.",
    hold: "{symbol} ൽ ഇപ്പോൾ കാത്തിരിക്കുന്നതാണ് നല്ലത്. വിശ്വാസം {confidence} ശതമാനം.",
    labels: { buy: "വാങ്ങുക", sell: "വിൽക്കുക", hold: "കാത്തിരിക്കുക" },
    trend: { bull: "കയറ്റം", bear: "ഇറക്കം", neutral: "സ്ഥിരം" },
    risk: { low: "കുറവ്", medium: "ഇടത്തരം", high: "കൂടുതൽ" },
    ui: {
      listen: "കേൾക്കുക",
      voiceOn: "ശബ്ദം ഓൺ",
      speaking: "സംസാരിക്കുന്നു…",
      disclaimer: "പേപ്പർ ട്രേഡിംഗ് ഡെമോ. നിക്ഷേപ ഉപദേശമല്ല.",
    },
  },
};

export interface InfluencerScript {
  language: InfluencerLanguage;
  verdict: VerdictKind;
  headline: string;
  caption: string;
  spoken: string;
  trendWord: string;
  riskWord: string;
  ui: ScriptPack["ui"];
}

function fill(template: string, symbol: string, confidence: number): string {
  return template
    .replace(/\{symbol\}/g, symbol)
    .replace(/\{confidence\}/g, String(Math.round(confidence)));
}

export function buildInfluencerScript(options: {
  lang: InfluencerLangCode;
  verdict: VerdictKind;
  symbol: string;
  confidence: number;
  trend: TrendKind;
  risk: RiskKind;
}): InfluencerScript {
  const pack = PACKS[options.lang] ?? PACKS.hi;
  const language = getInfluencerLanguage(options.lang);
  const caption = fill(pack[options.verdict], options.symbol, options.confidence);
  return {
    language,
    verdict: options.verdict,
    headline: pack.labels[options.verdict],
    caption,
    spoken: caption,
    trendWord: pack.trend[options.trend],
    riskWord: pack.risk[options.risk],
    ui: pack.ui,
  };
}
