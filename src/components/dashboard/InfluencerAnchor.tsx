"use client";

import React from "react";

export type AnchorGesture = "buy" | "sell" | "hold";

/** Name shown in the AI panel so the presenter and the copy stay in sync. */
export const ANCHOR_NAME = "ANANYA";

/**
 * Full-body female vector presenter ("AI anchor") for the AI signal panel.
 * Rendered as a semi-realistic digital illustration rather than a flat
 * cartoon: soft gradient shading, slim natural eyes/brows/lips, layered hair
 * with a side part and fly-aways, tailored blazer with fabric folds, pencil
 * skirt and pumps. Animation is pure CSS (see anchor.css): breathing, weight
 * shift, hair sway, blinks, BUY/SELL arm gestures and lip movement while the
 * browser speaks the verdict.
 */
export function InfluencerAnchor({
  gesture = "hold",
  speaking = false,
  className = "",
}: {
  gesture?: AnchorGesture;
  speaking?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 -6 120 306"
      preserveAspectRatio="xMidYMax meet"
      role="img"
      aria-label={`${ANCHOR_NAME}, female AI market anchor, announcing the trading signal`}
      className={`anchor-svg anchor-gesture-${gesture} ${speaking ? "anchor-speaking" : ""} ${className}`}
    >
      <defs>
        <linearGradient id="anchorSuit" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#24496a" />
          <stop offset="0.55" stopColor="#16334f" />
          <stop offset="1" stopColor="#0a1a2b" />
        </linearGradient>
        <linearGradient id="anchorSuitLight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#315f84" />
          <stop offset="0.6" stopColor="#1b3c58" />
          <stop offset="1" stopColor="#122b41" />
        </linearGradient>
        <linearGradient id="anchorSkirt" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1a3a55" />
          <stop offset="0.35" stopColor="#122c44" />
          <stop offset="0.75" stopColor="#0c2034" />
          <stop offset="1" stopColor="#081726" />
        </linearGradient>
        <linearGradient id="anchorSkin" x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0" stopColor="#f3d1b4" />
          <stop offset="0.5" stopColor="#e7bb98" />
          <stop offset="1" stopColor="#d6a179" />
        </linearGradient>
        <linearGradient id="anchorSkinShade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c98f6d" stopOpacity="0" />
          <stop offset="0.72" stopColor="#c98f6d" stopOpacity="0.55" />
          <stop offset="1" stopColor="#b97e5b" stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id="anchorHair" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#452d1e" />
          <stop offset="0.45" stopColor="#2b1a12" />
          <stop offset="1" stopColor="#120b07" />
        </linearGradient>
        <linearGradient id="anchorHairSheen" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor="#8b6244" stopOpacity="0" />
          <stop offset="0.5" stopColor="#8b6244" stopOpacity="0.65" />
          <stop offset="1" stopColor="#5d3d29" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="anchorBlouse" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7fafd" />
          <stop offset="0.6" stopColor="#dde8f2" />
          <stop offset="1" stopColor="#c3d3e2" />
        </linearGradient>
        <linearGradient id="anchorLips" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b5636c" />
          <stop offset="0.55" stopColor="#a3525c" />
          <stop offset="1" stopColor="#8e3f4b" />
        </linearGradient>
        <linearGradient id="anchorGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e8c877" />
          <stop offset="1" stopColor="#b0812f" />
        </linearGradient>
        <linearGradient id="anchorIris" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b4a34" />
          <stop offset="0.6" stopColor="#4a3021" />
          <stop offset="1" stopColor="#2a1a10" />
        </linearGradient>
        <radialGradient id="anchorSpot" cx="50%" cy="9%" r="76%">
          <stop offset="0" stopColor="var(--anchor-glow, #22d3ee)" stopOpacity="0.24" />
          <stop offset="68%" stopColor="var(--anchor-glow, #22d3ee)" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#03070f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="anchorFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--anchor-glow, #22d3ee)" stopOpacity="0.26" />
          <stop offset="1" stopColor="var(--anchor-glow, #22d3ee)" stopOpacity="0" />
        </linearGradient>
        <filter id="anchorSoft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
        <filter id="anchorSofter" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>

      {/* stage light + floor */}
      <rect x="0" y="-6" width="120" height="306" fill="url(#anchorSpot)" />
      <ellipse cx="60" cy="292" rx="33" ry="5.6" fill="url(#anchorFloor)" />
      <ellipse cx="60" cy="293" rx="18" ry="2.8" fill="#000" opacity="0.45" />

      <g className="anchor-figure">
        {/* long layered hair behind the body */}
        <g className="anchor-hair-back">
          <path
            d="M48 26 C40.5 34 37.5 52 38.5 72 C39.5 94 42.5 116 49 130 C51 133 54 132 55.5 129 C50.5 110 49 88 49.5 64 L49.8 42 C49.8 32 54.5 24.5 60 24.5 C65.5 24.5 70.2 32 70.2 42 L70.5 64 C71 88 69.5 110 64.5 129 C66 132 69 133 71 130 C77.5 116 80.5 94 81.5 72 C82.5 52 79.5 34 72 26 Z"
            fill="url(#anchorHair)"
          />
          <g filter="url(#anchorSoft)">
            <path d="M45.6 40 C42 62 42.2 92 47.4 114" stroke="#7a5438" strokeWidth="1.1" opacity="0.45" fill="none" />
            <path d="M74.4 40 C78 62 77.8 92 72.6 114" stroke="#7a5438" strokeWidth="0.9" opacity="0.3" fill="none" />
            <path d="M47.4 34 C44 58 44 94 50.6 120" stroke="#0c0704" strokeWidth="1.8" opacity="0.55" fill="none" />
            <path d="M72.6 34 C76 58 76 94 69.4 120" stroke="#0c0704" strokeWidth="1.8" opacity="0.55" fill="none" />
            <path d="M55 30 C51 58 51 100 55.6 126" stroke="#0d0805" strokeWidth="1.1" opacity="0.45" fill="none" />
            <path d="M65 30 C69 58 69 100 64.4 126" stroke="#0d0805" strokeWidth="1.1" opacity="0.45" fill="none" />
          </g>
          {/* wavy tips */}
          <path d="M43 112 C45 118 44.6 124 47 128" stroke="#241610" strokeWidth="1.2" opacity="0.7" fill="none" />
          <path d="M77 112 C75 118 75.4 124 73 128" stroke="#241610" strokeWidth="1.2" opacity="0.7" fill="none" />
        </g>

        {/* legs — tapered thigh, knee, calf and slim ankle (not tubes) */}
        <path
          d="M47 198 C45.9 208 45.8 216 46.2 228 C46.6 234 47.2 238 48.2 240 C47 246 46.4 250 46.6 254 C46.9 260 47.8 264 49.2 268 L53.8 268 C53.4 262 54 256 54.4 250 C54.7 246 54.8 243 54.6 240 C55 236 55.8 232 56.2 228 C56.6 218 56.4 208 56 198 Z"
          fill="url(#anchorSkin)"
        />
        <path
          d="M73 198 C74.1 208 74.2 216 73.8 228 C73.4 234 72.8 238 71.8 240 C73 246 73.6 250 73.4 254 C73.1 260 72.2 264 70.8 268 L66.2 268 C66.6 262 66 256 65.6 250 C65.3 246 65.2 243 65.4 240 C65 236 64.2 232 63.8 228 C63.4 218 63.6 208 64 198 Z"
          fill="url(#anchorSkin)"
        />
        <g filter="url(#anchorSoft)">
          {/* outer contour */}
          <path d="M47.6 216 C47 230 47.4 240 48.6 243 C47.4 250 47.2 259 48.6 266" stroke="#b97e5b" strokeWidth="1.2" opacity="0.55" fill="none" />
          <path d="M72.4 216 C73 230 72.6 240 71.4 243 C72.6 250 72.8 259 71.4 266" stroke="#b97e5b" strokeWidth="1.2" opacity="0.5" fill="none" />
          {/* inner contour + knee shading */}
          <path d="M55.4 216 C55.8 230 55.4 240 54.4 243 C55.2 250 54.6 259 53.6 266" stroke="#c98f6d" strokeWidth="1" opacity="0.45" fill="none" />
          <path d="M64.6 216 C64.2 230 64.6 240 65.6 243 C64.8 250 65.4 259 66.4 266" stroke="#c98f6d" strokeWidth="1" opacity="0.4" fill="none" />
          {/* thigh + calf form shading */}
          <path d="M50.6 206 C49.8 218 49.8 228 50.4 236" stroke="#c98f6d" strokeWidth="1.6" opacity="0.3" fill="none" />
          <path d="M69.4 206 C70.2 218 70.2 228 69.6 236" stroke="#c98f6d" strokeWidth="1.6" opacity="0.28" fill="none" />
          <path d="M50 246 C49.8 252 50 258 50.6 262" stroke="#c98f6d" strokeWidth="1.4" opacity="0.28" fill="none" />
          <path d="M70 246 C70.2 252 70 258 69.4 262" stroke="#c98f6d" strokeWidth="1.4" opacity="0.26" fill="none" />
          {/* light down the front of each shin */}
          <path d="M52.6 244 C52.4 252 52.8 260 53.2 266" stroke="#fbe3cd" strokeWidth="0.8" opacity="0.55" fill="none" />
          <path d="M67.4 244 C67.6 252 67.2 260 66.8 266" stroke="#fbe3cd" strokeWidth="0.8" opacity="0.5" fill="none" />
          {/* ankle bones */}
          <ellipse cx="50.6" cy="265.4" rx="1" ry="1.3" fill="#c98f6d" opacity="0.3" />
          <ellipse cx="69.4" cy="265.4" rx="1" ry="1.3" fill="#c98f6d" opacity="0.3" />
        </g>
        <ellipse cx="50.8" cy="239.6" rx="1.9" ry="1.2" fill="#ffffff" opacity="0.14" />
        <ellipse cx="69.2" cy="239.6" rx="1.9" ry="1.2" fill="#ffffff" opacity="0.12" />
        <ellipse cx="51.6" cy="219" rx="2.1" ry="1.4" fill="#c98f6d" opacity="0.22" />
        <ellipse cx="68.4" cy="219" rx="2.1" ry="1.4" fill="#c98f6d" opacity="0.2" />

        {/* slender pointed pumps */}
        <path
          d="M49.6 268 L53.9 268 C54.1 272.6 53.5 276 52.4 278.6 C51 281.9 47.4 283.9 43.9 283.7 C42.8 283.6 42.7 282.3 43.7 281.4 C46.2 279.1 48.3 275.2 49.6 268 Z"
          fill="#0a1524"
        />
        <path d="M52.6 278.4 C52.1 281.8 51.6 285.6 51.3 289.6 L52.7 289.8 C53.1 285.8 53.4 281.8 53.5 278.4 Z" fill="#060d16" />
        <path
          d="M70.4 268 L66.1 268 C65.9 272.6 66.5 276 67.6 278.6 C69 281.9 72.6 283.9 76.1 283.7 C77.2 283.6 77.3 282.3 76.3 281.4 C73.8 279.1 71.7 275.2 70.4 268 Z"
          fill="#0a1524"
        />
        <path d="M67.4 278.4 C67.9 281.8 68.4 285.6 68.7 289.6 L67.3 289.8 C66.9 285.8 66.6 281.8 66.5 278.4 Z" fill="#060d16" />
        <path d="M44.4 282.8 C46.6 280.5 48.5 276.8 49.9 272.4" stroke="#3d5f7e" strokeWidth="0.8" opacity="0.7" fill="none" />
        <path d="M75.6 282.8 C73.4 280.5 71.5 276.8 70.1 272.4" stroke="#3d5f7e" strokeWidth="0.8" opacity="0.7" fill="none" />
        <path d="M44.6 283.2 C47.6 282.6 50.6 280.4 52.2 277" stroke="#7dd3fc" strokeWidth="0.45" opacity="0.25" fill="none" />
        <path d="M75.4 283.2 C72.4 282.6 69.4 280.4 67.8 277" stroke="#7dd3fc" strokeWidth="0.45" opacity="0.25" fill="none" />
        <path d="M52.2 285.2 L53.9 285.2" stroke="#4a6a86" strokeWidth="0.45" opacity="0.65" />
        <path d="M66.1 285.2 L67.8 285.2" stroke="#4a6a86" strokeWidth="0.45" opacity="0.65" />

        {/* pencil skirt */}
        <path
          d="M41 148 C40.5 168 42 192 44.5 214 L75.5 214 C78 192 79.5 168 79 148 C73 144 66.5 142 60 142 C53.5 142 47 144 41 148 Z"
          fill="url(#anchorSkirt)"
        />
        <g filter="url(#anchorSoft)">
          <path d="M43.2 150 C42.6 170 44 193 46.2 212" stroke="#3c6c90" strokeWidth="1.2" opacity="0.5" fill="none" />
          <path d="M76.8 150 C77.4 170 76 193 73.8 212" stroke="#040c16" strokeWidth="1.4" opacity="0.7" fill="none" />
          <path d="M55 150 C53.6 170 53 192 52.6 210" stroke="#081624" strokeWidth="0.9" opacity="0.35" fill="none" />
          <path d="M65 150 C66.4 170 67 192 67.4 210" stroke="#081624" strokeWidth="0.9" opacity="0.3" fill="none" />
        </g>
        <path d="M67.4 198 L67.9 214" stroke="#040c16" strokeWidth="1" opacity="0.7" />
        <path d="M45.4 210.6 C52 212.4 68 212.4 74.6 210.6" stroke="#040c16" strokeWidth="0.9" opacity="0.45" fill="none" />

        {/* back arm (viewer left) */}
        <g className="anchor-arm anchor-arm-left">
          <path
            d="M44 70 C39 72 36.4 78 36 87 L38 121 L43 121 L42.2 90 C42.2 83 44 78.6 47 77 Z"
            fill="url(#anchorSuitLight)"
          />
          <path d="M42.6 118 L38 120 L38.4 147 L43.4 147 Z" fill="url(#anchorSuitLight)" />
          <g filter="url(#anchorSoft)" opacity="0.7">
            <path d="M39.4 82 C38.6 90 38.8 108 39.4 118" stroke="#0a1a2b" strokeWidth="0.8" fill="none" />
            <path d="M41.4 98 C40.8 104 40.8 110 41.2 115" stroke="#3c6c90" strokeWidth="0.6" opacity="0.5" fill="none" />
          </g>
          <path d="M39.4 145.4 L42.8 145.4" stroke="#22d3ee" strokeWidth="0.7" opacity="0.35" />
          <path
            d="M38 147.2 C38 145.9 39 145.1 40.2 145.1 L41.6 145.1 C43.4 145.1 44.6 146.5 44.6 148.3 L44.2 158.8 C44.1 160.8 42.4 161.9 40.8 161.2 L39.2 160.5 C38.4 160.1 38 159.3 38 158.5 Z"
            fill="url(#anchorSkin)"
          />
          <path d="M39.4 157.4 L39.4 160.4 M41.2 157.6 L41.2 160.8 M43 157.4 L43 160.4" stroke="#c68f6a" strokeWidth="0.4" strokeLinecap="round" opacity="0.75" />
        </g>

        {/* torso: neck + tailored blazer over an ivory blouse */}
        <g className="anchor-torso">
          <path d="M56 52 L64 52 L64.6 64 C62 66 58 66 55.4 64 Z" fill="url(#anchorSkin)" />
          <g filter="url(#anchorSoft)">
            <path d="M56.4 62.5 C58 64.4 62 64.4 63.6 62.5 L63.4 57.4 C61.4 59 58.6 59 56.6 57.4 Z" fill="#b97e5b" opacity="0.42" />
            <path d="M53 63.6 C54.4 65.4 55.6 66 57.4 66.2" stroke="#c98f6d" strokeWidth="0.7" opacity="0.6" fill="none" />
            <path d="M67 63.6 C65.6 65.4 64.4 66 62.6 66.2" stroke="#c98f6d" strokeWidth="0.7" opacity="0.6" fill="none" />
          </g>
          <path
            d="M42.5 71 C42.5 66.4 47.6 63.4 54 62.4 L66 62.4 C72.4 63.4 77.5 66.4 77.5 71 L80 95 C80.5 104 76.5 110 74.5 116 C73.6 128 76.5 140 79.5 152 C72 155.5 66 156.6 60 156.6 C54 156.6 48 155.5 40.5 152 C43.5 140 46.4 128 45.5 116 C43.5 110 39.5 104 40 95 Z"
            fill="url(#anchorSuit)"
          />
          {/* ivory blouse filling the V neckline */}
          <path d="M54 62.4 L66 62.4 L60 81.2 Z" fill="url(#anchorBlouse)" />
          <path d="M54.4 62.6 L65.6 62.6 L60 80.2 Z" fill="url(#anchorBlouse)" opacity="0.6" />
          <path d="M56.2 62.9 L60 73.4 L60.2 77.2 L58.6 78 L57.4 68.4 Z" fill="#9fb6cd" opacity="0.35" />
          <path d="M60 73.4 L60 80.6" stroke="#a9bfd2" strokeWidth="0.4" opacity="0.6" />
          <path d="M54.8 63.4 C56.6 63 58 62.8 60 62.8" stroke="#ffffff" strokeWidth="0.4" opacity="0.5" fill="none" />
          {/* lapels with topstitch */}
          <path d="M54 62.4 L60 81.2 L56.6 92.2 L45.4 69.6 Z" fill="#17324b" />
          <path d="M66 62.4 L60 81.2 L63.4 92.2 L74.6 69.6 Z" fill="#17324b" />
          <path d="M54.4 62.9 L60 79.8 L57.6 87.4" stroke="#3c6c90" strokeWidth="0.6" opacity="0.5" fill="none" />
          <path d="M65.6 62.9 L60 79.8 L62.4 87.4" stroke="#3c6c90" strokeWidth="0.6" opacity="0.5" fill="none" />
          <path d="M46.2 70.4 L56 89.8" stroke="#081624" strokeWidth="0.5" opacity="0.5" fill="none" />
          <path d="M73.8 70.4 L64 89.8" stroke="#081624" strokeWidth="0.5" opacity="0.5" fill="none" />
          {/* fabric folds + waist seam */}
          <g filter="url(#anchorSoft)" opacity="0.75">
            <path d="M44.6 78 C47 86 46.4 94 45.2 100" stroke="#081624" strokeWidth="1" fill="none" />
            <path d="M75.4 78 C73 86 73.6 94 74.8 100" stroke="#081624" strokeWidth="1" fill="none" />
            <path d="M46 114 C51.5 117.6 54.6 118.4 60 118.4 C65.4 118.4 68.5 117.6 74 114" stroke="#081624" strokeWidth="1.1" fill="none" />
            <path d="M47 124 L46.4 138" stroke="#081624" strokeWidth="0.9" fill="none" />
            <path d="M73 124 L73.6 138" stroke="#081624" strokeWidth="0.9" fill="none" />
            <path d="M58 132 C58.8 136 58.8 140 58.4 144" stroke="#081624" strokeWidth="0.7" opacity="0.5" fill="none" />
          </g>
          {/* pockets + single button */}
          <path d="M47.6 105 L54 106.4" stroke="#3c6c90" strokeWidth="0.7" opacity="0.5" fill="none" />
          <path d="M72.4 105 L66 106.4" stroke="#3c6c90" strokeWidth="0.7" opacity="0.5" fill="none" />
          <circle cx="60" cy="121.4" r="0.8" fill="url(#anchorGold)" opacity="0.85" />
          {/* necklace */}
          <path d="M55.8 62.8 Q60 68.4 64.2 62.8" stroke="url(#anchorGold)" strokeWidth="0.45" fill="none" />
          <path d="M60 68.8 L60 83.4" stroke="url(#anchorGold)" strokeWidth="0.35" opacity="0.7" />
          <circle cx="60" cy="84.2" r="1.3" fill="url(#anchorGold)" />
          <circle cx="60" cy="84.2" r="0.5" fill="#22d3ee" />
          {/* rim light */}
          <path d="M77.4 82 C78.4 92 78.6 99 77.2 107" stroke="#7dd3fc" strokeWidth="0.7" opacity="0.22" fill="none" />
        </g>

        {/* front arm (viewer right) — gesturing arm */}
        <g className="anchor-arm anchor-arm-right">
          <path
            d="M76 70 C81.6 72 84 78 84.2 87 L82.4 121 L77.6 121 L78.4 90 C78.4 83 76.6 79 73.4 77.4 Z"
            fill="url(#anchorSuitLight)"
          />
          <g filter="url(#anchorSoft)" opacity="0.6">
            <path d="M80.4 80 C81.6 88 81.4 100 80.8 110" stroke="#7dd3fc" strokeWidth="0.6" fill="none" />
            <path d="M78.6 98 C79.4 104 79.4 110 79 116" stroke="#0a1a2b" strokeWidth="0.7" fill="none" />
          </g>
          <g className="anchor-forearm anchor-forearm-right">
            <path d="M77.4 118 L82.4 120 L81.8 149 L76.8 149 Z" fill="url(#anchorSuitLight)" />
            <path d="M77 146.6 L82 148.6" stroke="#22d3ee" strokeWidth="0.7" opacity="0.4" />
            <rect x="76.8" y="143.2" width="5.2" height="2.1" rx="0.8" fill="url(#anchorGold)" />
            <circle cx="79.4" cy="144.25" r="0.6" fill="#0b1d30" stroke="#e8c877" strokeWidth="0.25" />
            <path
              d="M77.2 147.6 C77.2 146.2 78.3 145.4 79.6 145.4 L81.2 145.4 C83 145.4 84.2 146.8 84.2 148.6 L83.8 159.6 C83.7 161.6 82 162.7 80.4 162 78.7 161.3 77.2 160 77.2 158 Z"
              fill="url(#anchorSkin)"
            />
            <path d="M77.6 152.4 C76.7 153.5 76.7 155.2 77.5 156.4" stroke="#d79b76" strokeWidth="0.4" fill="none" opacity="0.7" />
            <path d="M78.5 158.4 L78.5 161.4 M80.4 158.6 L80.4 162 M82.3 158.4 L82.3 161.4" stroke="#c68f6a" strokeWidth="0.4" strokeLinecap="round" opacity="0.8" />
          </g>
        </g>

        {/* head */}
        <g className="anchor-head">
          {/* ears + slim gold drops */}
          <path d="M48.7 40.2 C47.4 39.4 46.6 41 46.8 42.8 C47 44.6 47.8 45.8 48.9 45.4 Z" fill="#e8b795" />
          <path d="M71.3 40.2 C72.6 39.4 73.4 41 73.2 42.8 C73 44.6 72.2 45.8 71.1 45.4 Z" fill="#e8b795" />
          <g opacity="0.9">
            <circle cx="48.1" cy="47.2" r="1" fill="url(#anchorGold)" />
            <path d="M48.1 48.3 L48.1 50.2" stroke="url(#anchorGold)" strokeWidth="0.45" />
            <circle cx="48.1" cy="50.6" r="0.65" fill="url(#anchorGold)" />
            <circle cx="71.9" cy="47.2" r="1" fill="url(#anchorGold)" />
            <path d="M71.9 48.3 L71.9 50.2" stroke="url(#anchorGold)" strokeWidth="0.45" />
            <circle cx="71.9" cy="50.6" r="0.65" fill="url(#anchorGold)" />
          </g>

          {/* face */}
          <path
            d="M49.6 38 C49.6 29 54 23.6 60 23.6 C66 23.6 70.4 29 70.4 38 C70.4 45.2 67 51.8 60 55.6 C53 51.8 49.6 45.2 49.6 38 Z"
            fill="url(#anchorSkin)"
          />
          <path d="M49.6 38 C49.6 29 54 23.6 60 23.6 C66 23.6 70.4 29 70.4 38 C70.4 45.2 67 51.8 60 55.6 C53 51.8 49.6 45.2 49.6 38 Z" fill="url(#anchorSkinShade)" opacity="0.22" />
          <g filter="url(#anchorSoft)">
            {/* hairline + temple shadow */}
            <path d="M50.4 34.6 C51 30 54 26.4 57.6 25.2 L60 25.2 L60 34 Z" fill="#c98f6d" opacity="0.28" />
            <path d="M69.6 34.6 C69 30 66 26.4 62.4 25.2 L60 25.2 L60 34 Z" fill="#c98f6d" opacity="0.16" />
            {/* cheek contour */}
            <path d="M50.2 40.4 C50.8 47 54 52 59.2 55" stroke="#b97e5b" strokeWidth="1.1" opacity="0.35" fill="none" />
            <path d="M69.8 40.4 C69.2 47 66 52 60.8 55" stroke="#b97e5b" strokeWidth="0.9" opacity="0.26" fill="none" />
            {/* under-eye + nasolabial */}
            <path d="M53.6 43.4 C54.6 44 56 43.9 56.9 43.3" stroke="#c98f6d" strokeWidth="0.45" opacity="0.32" fill="none" />
            <path d="M66.4 43.4 C65.4 44 64 43.9 63.1 43.3" stroke="#c98f6d" strokeWidth="0.45" opacity="0.3" fill="none" />
            <path d="M56.6 48.8 C57.2 50.6 57.8 51.4 58.6 51.8" stroke="#c98f6d" strokeWidth="0.4" opacity="0.2" fill="none" />
            <path d="M63.4 48.8 C62.8 50.6 62.2 51.4 61.4 51.8" stroke="#c98f6d" strokeWidth="0.4" opacity="0.18" fill="none" />
            {/* chin + jaw */}
            <ellipse cx="60" cy="55" rx="2.6" ry="0.8" fill="#c98f6d" opacity="0.25" />
          </g>
          {/* forehead + cheek light */}
          <ellipse cx="59" cy="31.2" rx="5.4" ry="2.6" fill="#ffffff" opacity="0.1" />
          <ellipse cx="54" cy="46.6" rx="2.4" ry="1.3" fill="#e88f8f" opacity="0.1" />
          <ellipse cx="66" cy="46.6" rx="2.4" ry="1.3" fill="#e88f8f" opacity="0.1" />

          {/* hair: cap, side part, fringe, sheen */}
          <path
            d="M48.4 38 C47.8 28.4 52.8 21.6 60 21.6 C67.2 21.6 72.2 28.4 71.6 38 C69.4 31.8 65.6 28.6 60 28.6 C54.4 28.6 50.6 31.8 48.4 38 Z"
            fill="url(#anchorHair)"
          />
          <path d="M49.8 32.6 C51.6 27 55.4 23.8 59.8 23.2 C56.6 25.4 54.2 28.8 52.8 33.2 C51.8 32.8 50.8 32.6 49.8 32.6 Z" fill="#3a2418" />
          <path d="M60.1 23.6 C59.2 26.6 58.8 29.6 59 32.6" stroke="#0f0905" strokeWidth="0.6" opacity="0.75" fill="none" />
          <path d="M49.6 30.8 C52.6 24.4 57.6 22.2 62 23.4" stroke="url(#anchorHairSheen)" strokeWidth="1.1" opacity="0.7" fill="none" />
          <path d="M48.4 31.6 C46.6 30.8 45.2 31.8 44.8 33.4" stroke="#2a1911" strokeWidth="0.6" opacity="0.8" fill="none" />
          <path d="M71.6 31.6 C73.4 30.8 74.8 31.8 75.2 33.4" stroke="#2a1911" strokeWidth="0.6" opacity="0.8" fill="none" />
          <path d="M49.2 32.8 C49.8 34.6 50.4 35.6 51.2 36.2" stroke="#1a100a" strokeWidth="0.5" opacity="0.6" fill="none" />
          <path d="M70.8 32.8 C70.2 34.6 69.6 35.6 68.8 36.2" stroke="#1a100a" strokeWidth="0.5" opacity="0.6" fill="none" />
          {/* baby hairs */}
          <path d="M51 28.2 C50.2 27 49.8 26 49.8 25" stroke="#2a1911" strokeWidth="0.45" opacity="0.7" fill="none" />
          <path d="M53.2 25.6 C52.6 24.4 52.2 23.4 52.2 22.4" stroke="#2a1911" strokeWidth="0.4" opacity="0.6" fill="none" />

          {/* shoulder strands (tapered, slightly wavy) */}
          <path d="M48.8 33 C46.6 44 46 64 47 84 C47.3 88 49.4 89.5 50.2 86 C49.2 68 49.8 48 51.6 35.5 Z" fill="url(#anchorHair)" />
          <path d="M71.2 33 C73.4 44 74 64 73 84 C72.7 88 70.6 89.5 69.8 86 C70.8 68 70.2 48 68.4 35.5 Z" fill="url(#anchorHair)" />
          <path d="M49.4 40 C48.2 54 48 70 48.6 84" stroke="#6b4a32" strokeWidth="0.5" opacity="0.45" fill="none" />
          <path d="M70.6 40 C71.8 54 72 70 71.4 84" stroke="#6b4a32" strokeWidth="0.5" opacity="0.35" fill="none" />

          {/* eyebrows */}
          <path d="M52.4 36.7 C54 35.4 56 35.3 57.7 36.4" stroke="#43301f" strokeWidth="0.75" strokeLinecap="round" fill="none" opacity="0.9" />
          <path d="M62.3 36.4 C64 35.3 66 35.4 67.6 36.7" stroke="#43301f" strokeWidth="0.75" strokeLinecap="round" fill="none" opacity="0.9" />

          {/* eyes (natural size) */}
          <path d="M53.9 41 Q55.4 39.2 57.1 40.3 Q55.6 42.2 53.9 41 Z" fill="#f7f4f1" />
          <path d="M66.1 40.3 Q67.8 39.2 69.3 41 Q67.6 42.2 66.1 40.3 Z" fill="#f7f4f1" />
          <circle cx="55.5" cy="40.7" r="0.95" fill="url(#anchorIris)" />
          <circle cx="55.5" cy="40.7" r="0.42" fill="#160e08" />
          <circle cx="55.2" cy="40.4" r="0.2" fill="#ffffff" opacity="0.9" />
          <circle cx="64.5" cy="40.7" r="0.95" fill="url(#anchorIris)" />
          <circle cx="64.5" cy="40.7" r="0.42" fill="#160e08" />
          <circle cx="64.2" cy="40.4" r="0.2" fill="#ffffff" opacity="0.9" />
          <path d="M53.8 40.8 Q55.4 38.9 57.3 40.1" stroke="#2c1c14" strokeWidth="0.55" strokeLinecap="round" fill="none" />
          <path d="M66.2 40.8 Q67.8 38.9 69.4 40.1" stroke="#2c1c14" strokeWidth="0.55" strokeLinecap="round" fill="none" />
          <path d="M53.8 40.9 L53.2 40.2 M69.4 40.9 L70 40.2" stroke="#2c1c14" strokeWidth="0.4" strokeLinecap="round" />
          <path d="M54.4 42 Q55.5 42.5 56.7 41.9" stroke="#b97e5b" strokeWidth="0.35" opacity="0.55" fill="none" />
          {/* eyelid crease, lower lash line, inner corner */}
          <path d="M53.6 39.3 C54.7 37.9 56.3 37.5 57.7 38.4" stroke="#b97e5b" strokeWidth="0.3" opacity="0.5" fill="none" />
          <path d="M66.4 39.3 C65.3 37.9 63.7 37.5 62.3 38.4" stroke="#b97e5b" strokeWidth="0.3" opacity="0.45" fill="none" />
          <path d="M54.1 42.3 C55.2 42.8 56.3 42.7 57.4 42" stroke="#c98f6d" strokeWidth="0.3" opacity="0.48" fill="none" />
          <path d="M65.9 42.3 C64.8 42.8 63.7 42.7 62.6 42" stroke="#c98f6d" strokeWidth="0.3" opacity="0.42" fill="none" />
          <circle cx="57.1" cy="40.8" r="0.26" fill="#d98e96" opacity="0.45" />
          <circle cx="62.9" cy="40.8" r="0.26" fill="#d98e96" opacity="0.45" />
          {/* brow bone + philtrum softness */}
          <path d="M52.8 34.6 C54.4 33.6 56.4 33.5 58 34.2" stroke="#f6ddc6" strokeWidth="0.5" opacity="0.35" fill="none" />
          <path d="M67.2 34.6 C65.6 33.6 63.6 33.5 62 34.2" stroke="#f6ddc6" strokeWidth="0.5" opacity="0.3" fill="none" />
          <path d="M59.7 49.4 C59.9 50.1 60.1 50.4 60.3 50.5" stroke="#c98f6d" strokeWidth="0.35" opacity="0.4" fill="none" />

          {/* eyelids (closed only while blinking) */}
          <rect className="anchor-lid" x="53.3" y="38.5" width="4.4" height="4" rx="1.8" fill="url(#anchorSkin)" />
          <rect className="anchor-lid" x="62.6" y="38.5" width="4.4" height="4" rx="1.8" fill="url(#anchorSkin)" />

          {/* nose */}
          <path d="M59.9 42.2 C59.8 44.2 59.5 45.7 59 46.8" stroke="#c98f6d" strokeWidth="0.55" strokeLinecap="round" fill="none" opacity="0.8" />
          <path d="M60.2 42.4 C60.2 44.4 60.4 45.6 60.8 46.6" stroke="#ffffff" strokeWidth="0.4" strokeLinecap="round" opacity="0.3" />
          <path d="M59 47.1 C59.6 47.6 60.4 47.6 61 47.1" stroke="#b97e5b" strokeWidth="0.5" strokeLinecap="round" fill="none" />
          <ellipse cx="58.9" cy="47.2" rx="0.42" ry="0.22" fill="#a86c4c" opacity="0.55" />
          <ellipse cx="61.1" cy="47.2" rx="0.42" ry="0.22" fill="#a86c4c" opacity="0.55" />
          <ellipse cx="60" cy="46.6" rx="0.8" ry="0.45" fill="#ffffff" opacity="0.22" />

          {/* lips (subtle, natural) */}
          <g className="anchor-smile">
            <path
              d="M56.9 51.8 C58 51.2 59 51.2 60 51.7 C61 51.2 62 51.2 63.1 51.8 C62.2 53.8 61.2 54.6 60 54.7 C58.8 54.6 57.8 53.8 56.9 51.8 Z"
              fill="url(#anchorLips)"
            />
            <path d="M57.4 51.9 Q60 52.9 62.6 51.9" stroke="#6f2a35" strokeWidth="0.3" opacity="0.65" fill="none" />
            <ellipse cx="60" cy="53.5" rx="1.4" ry="0.32" fill="#d98e96" opacity="0.35" />
          </g>
          <ellipse className="anchor-mouth" cx="60" cy="52.7" rx="2.4" ry="1.2" fill="#7d2f3d" />

          {/* chin highlight */}
          <path d="M58 55.3 Q60 56.4 62 55.3" stroke="#ffffff" strokeWidth="0.35" opacity="0.16" strokeLinecap="round" fill="none" />
        </g>
      </g>
    </svg>
  );
}

export default InfluencerAnchor;
