"use client";

import React from "react";

export type AnchorGesture = "buy" | "sell" | "hold";

/** Name shown in the AI panel so the presenter and the copy stay in sync. */
export const ANCHOR_NAME = "ANANYA";

/**
 * Full-body female vector presenter ("AI anchor") for the AI signal panel.
 * The figure is animated entirely with CSS (see anchor.css): idle breathing,
 * weight shift and hair sway, blinks, an open-palm "presenting" gesture for
 * BUY, a palm-down sweep for SELL, and lip movement while the browser speaks
 * the verdict. Drawn flat-vector but with realistic female proportions
 * (7.7 heads), defined waist, long hair, jewellery and business attire.
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
      viewBox="0 -30 120 330"
      preserveAspectRatio="xMidYMax meet"
      role="img"
      aria-label={`${ANCHOR_NAME}, female AI market anchor, announcing the trading signal`}
      className={`anchor-svg anchor-gesture-${gesture} ${speaking ? "anchor-speaking" : ""} ${className}`}
    >
      <defs>
        <linearGradient id="anchorSuit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d4260" />
          <stop offset="1" stopColor="#0a1a2b" />
        </linearGradient>
        <linearGradient id="anchorSuitLight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2b5a7e" />
          <stop offset="1" stopColor="#132b42" />
        </linearGradient>
        <linearGradient id="anchorSkirt" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#16334d" />
          <stop offset="0.5" stopColor="#0e2338" />
          <stop offset="1" stopColor="#09182a" />
        </linearGradient>
        <linearGradient id="anchorSkin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f8d9c0" />
          <stop offset="0.62" stopColor="#efc3a2" />
          <stop offset="1" stopColor="#dfa982" />
        </linearGradient>
        <linearGradient id="anchorHair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a2f20" />
          <stop offset="0.55" stopColor="#2a1911" />
          <stop offset="1" stopColor="#120b07" />
        </linearGradient>
        <linearGradient id="anchorBlouse" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f9fcff" />
          <stop offset="1" stopColor="#c6d8e9" />
        </linearGradient>
        <linearGradient id="anchorLips" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c76d78" />
          <stop offset="1" stopColor="#9c4250" />
        </linearGradient>
        <linearGradient id="anchorGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6d98d" />
          <stop offset="1" stopColor="#b8862f" />
        </linearGradient>
        <radialGradient id="anchorSpot" cx="50%" cy="8%" r="78%">
          <stop offset="0" stopColor="var(--anchor-glow, #22d3ee)" stopOpacity="0.26" />
          <stop offset="70%" stopColor="var(--anchor-glow, #22d3ee)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#03070f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="anchorFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--anchor-glow, #22d3ee)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--anchor-glow, #22d3ee)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* stage light + floor */}
      <rect x="0" y="-30" width="120" height="330" fill="url(#anchorSpot)" />
      <ellipse cx="60" cy="292" rx="34" ry="6" fill="url(#anchorFloor)" />
      <ellipse cx="60" cy="293" rx="20" ry="3.2" fill="#000" opacity="0.5" />

      <g className="anchor-figure">
        {/* long hair behind the body, with a gentle sway of its own */}
        <g className="anchor-hair-back">
          <path
            d="M47 26 C38 34 34 54 35 76 C36 100 39 124 47 138 C50 141 54 140 56 136 C50 116 48 90 49 62 L49 40 C49 30 55 22 60 22 C65 22 71 30 71 40 L71 62 C72 90 70 116 64 136 C66 140 70 141 73 138 C81 124 84 100 85 76 C86 54 82 34 73 26 Z"
            fill="url(#anchorHair)"
          />
          <path d="M45 46 C41 68 41 100 47 124" stroke="#7a5438" strokeWidth="0.9" opacity="0.4" fill="none" />
          <path d="M75 46 C79 68 79 100 73 124" stroke="#7a5438" strokeWidth="0.9" opacity="0.4" fill="none" />
          <path d="M49 34 C46 60 46 96 52 122" stroke="#0c0704" strokeWidth="1.6" opacity="0.6" fill="none" />
          <path d="M71 34 C74 60 74 96 68 122" stroke="#0c0704" strokeWidth="1.6" opacity="0.6" fill="none" />
        </g>

        {/* legs */}
        <path
          d="M50 198 C49.8 220 50 246 50.8 270 L55.2 270 C55.9 246 56.2 220 55.8 198 Z"
          fill="url(#anchorSkin)"
        />
        <path
          d="M64.2 198 C63.8 220 64.1 246 64.8 270 L69.2 270 C70 246 70.2 220 70 198 Z"
          fill="url(#anchorSkin)"
        />
        <path d="M52.2 236 C51.8 250 52 261 52.4 268" stroke="#c98f6d" strokeWidth="0.8" opacity="0.5" fill="none" />
        <path d="M67.8 236 C68.2 250 68 261 67.6 268" stroke="#c98f6d" strokeWidth="0.8" opacity="0.5" fill="none" />
        <ellipse cx="52.8" cy="221" rx="2" ry="1.2" fill="#d9a07a" opacity="0.3" />
        <ellipse cx="67.2" cy="221" rx="2" ry="1.2" fill="#d9a07a" opacity="0.3" />

        {/* pointed pumps */}
        <path
          d="M50.4 268 L55 268 L54.6 276 C54.2 281 50.5 284.5 44.8 284.8 C43.6 284.9 43.2 283.4 44.2 282.2 C46.4 279.6 48.6 275 50.4 268 Z"
          fill="#0a1524"
        />
        <path d="M51.8 284 L54 284 L53.6 290 L52 290 Z" fill="#060d16" />
        <path d="M65 268 L69.6 268 C71.4 275 73.6 279.6 75.8 282.2 C76.8 283.4 76.4 284.9 75.2 284.8 C69.5 284.5 65.8 281 65.4 276 Z" fill="#0a1524" />
        <path d="M66 284 L68.2 284 L68 290 L66.4 290 Z" fill="#060d16" />
        <path d="M45.6 283.4 C47.6 281 49.4 277.4 51 273" stroke="#2b4a68" strokeWidth="0.7" opacity="0.7" fill="none" />
        <path d="M74.4 283.4 C72.4 281 70.6 277.4 69 273" stroke="#2b4a68" strokeWidth="0.7" opacity="0.7" fill="none" />

        {/* pencil skirt */}
        <path
          d="M41 148 C40.5 168 42 192 44.5 214 L75.5 214 C78 192 79.5 168 79 148 C73 144 66.5 142 60 142 C53.5 142 47 144 41 148 Z"
          fill="url(#anchorSkirt)"
        />
        <path d="M43 150 C42.4 170 43.8 193 46 212" stroke="#2f5a7c" strokeWidth="1.1" opacity="0.55" fill="none" />
        <path d="M77 150 C77.6 170 76.2 193 74 212" stroke="#050d18" strokeWidth="1.4" opacity="0.7" fill="none" />
        <path d="M67.4 200 L67.8 214" stroke="#050d18" strokeWidth="0.9" opacity="0.65" />

        {/* back arm (viewer left) */}
        <g className="anchor-arm anchor-arm-left">
          <path
            d="M44 70 C39 72 36.4 78 36 87 L38 121 L43 121 L42.2 90 C42.2 83 44 78.6 47 77 Z"
            fill="url(#anchorSuitLight)"
          />
          <path d="M42.6 118 L38 120 L38.6 147 L43.4 147 Z" fill="url(#anchorSuitLight)" />
          <path d="M39.4 145.4 L42.8 145.4" stroke="#22d3ee" strokeWidth="0.8" opacity="0.4" />
          <rect x="37.4" y="147" width="6.6" height="12.5" rx="3" fill="url(#anchorSkin)" />
          <path d="M39.1 158.5 L39.1 161 M41 158.6 L41 161.3 M42.8 158.4 L42.8 161" stroke="#c68f6a" strokeWidth="0.5" strokeLinecap="round" opacity="0.8" />
        </g>

        {/* torso: neck + tailored blazer over an ivory blouse */}
        <g className="anchor-torso">
          <path d="M56 52 L64 52 L64.6 64 C62 66 58 66 55.4 64 Z" fill="url(#anchorSkin)" />
          <path d="M56.4 62.5 C58 64.2 62 64.2 63.6 62.5 L63.4 58 C61.4 59.4 58.6 59.4 56.6 58 Z" fill="#c98f6d" opacity="0.45" />
          <path
            d="M42.5 71 C42.5 66.4 47.6 63.4 54 62.4 L66 62.4 C72.4 63.4 77.5 66.4 77.5 71 L80 95 C80.5 104 76.5 110 74.5 116 C73.6 128 76.5 140 79.5 152 C72 155.5 66 156.6 60 156.6 C54 156.6 48 155.5 40.5 152 C43.5 140 46.4 128 45.5 116 C43.5 110 39.5 104 40 95 Z"
            fill="url(#anchorSuit)"
          />
          {/* ivory blouse + V neckline */}
          <path d="M54 62.4 L60 81.2 L66 62.4 L62.9 61.4 L60 72.4 L57.1 61.4 Z" fill="url(#anchorBlouse)" />
          <path d="M57.5 62.6 L60 70.6 L60.4 74.6 L59.1 76 L58.2 68.8 Z" fill="#9fb6cd" opacity="0.55" />
          {/* lapels */}
          <path d="M54 62.4 L60 81.2 L56.6 92.2 L45.4 69.6 Z" fill="#17324b" />
          <path d="M66 62.4 L60 81.2 L63.4 92.2 L74.6 69.6 Z" fill="#17324b" />
          <path d="M54.4 62.9 L60 79.8 L57.6 87.4" stroke="#2f5a7c" strokeWidth="0.7" opacity="0.55" fill="none" />
          <path d="M65.6 62.9 L60 79.8 L62.4 87.4" stroke="#2f5a7c" strokeWidth="0.7" opacity="0.55" fill="none" />
          {/* waist shaping + seams */}
          <path d="M46 114 C51.5 117.6 54.6 118.4 60 118.4 C65.4 118.4 68.5 117.6 74 114" stroke="#081624" strokeWidth="0.9" opacity="0.55" fill="none" />
          <path d="M47 121 L46.2 138" stroke="#081624" strokeWidth="0.8" opacity="0.5" fill="none" />
          <path d="M73 121 L73.8 138" stroke="#081624" strokeWidth="0.8" opacity="0.5" fill="none" />
          {/* pocket detail + button */}
          <path d="M47.6 105 L54 106.4" stroke="#2f5a7c" strokeWidth="0.8" opacity="0.55" fill="none" />
          <path d="M72.4 105 L66 106.4" stroke="#2f5a7c" strokeWidth="0.8" opacity="0.55" fill="none" />
          <circle cx="60" cy="121.6" r="0.9" fill="url(#anchorGold)" opacity="0.9" />
          {/* necklace */}
          <path d="M55.6 62.6 Q60 68.6 64.4 62.6" stroke="url(#anchorGold)" strokeWidth="0.55" fill="none" />
          <circle cx="60" cy="84.4" r="1.5" fill="url(#anchorGold)" />
          <circle cx="60" cy="84.4" r="0.65" fill="#22d3ee" />
          {/* feminine silhouette shading + rim light */}
          <path d="M44 116 C43.5 108 46.6 102 47.8 97" stroke="#050f1b" strokeWidth="1.2" opacity="0.45" fill="none" />
          <path d="M76 116 C76.5 108 73.4 102 72.2 97" stroke="#050f1b" strokeWidth="1.2" opacity="0.45" fill="none" />
          <path d="M77.6 84 C78.4 92 78.8 99 77.6 106" stroke="#22d3ee" strokeWidth="0.8" opacity="0.18" fill="none" />
        </g>

        {/* front arm (viewer right) — the gesturing arm */}
        <g className="anchor-arm anchor-arm-right">
          <path
            d="M76 70 C81.6 72 84 78 84.2 87 L82.4 121 L77.6 121 L78.4 90 C78.4 83 76.6 79 73.4 77.4 Z"
            fill="url(#anchorSuitLight)"
          />
          <path d="M80.6 78 C82 84 82.2 90 81.8 96" stroke="#22d3ee" strokeWidth="0.7" opacity="0.18" fill="none" />
          <g className="anchor-forearm anchor-forearm-right">
            <path d="M77.4 118 L82.4 120 L81.8 149 L76.8 149 Z" fill="url(#anchorSuitLight)" />
            <path d="M77 146.6 L82 148.6" stroke="#22d3ee" strokeWidth="0.8" opacity="0.45" />
            <rect x="76.6" y="143.2" width="5.6" height="2.3" rx="0.9" fill="url(#anchorGold)" />
            <circle cx="79.4" cy="144.35" r="0.7" fill="#0b1d30" stroke="#f6d98d" strokeWidth="0.3" />
            <rect x="77" y="147.6" width="7.2" height="13.4" rx="3.2" fill="url(#anchorSkin)" />
            <path d="M77.4 155 C79 156.3 82 156.3 83.7 155" stroke="#d79b76" strokeWidth="0.5" opacity="0.55" fill="none" />
            <path d="M78.6 159.6 L78.6 162.2 M80.6 159.7 L80.6 162.4 M82.4 159.5 L82.4 162" stroke="#c68f6a" strokeWidth="0.5" strokeLinecap="round" opacity="0.85" />
          </g>
        </g>

        {/* head */}
        <g className="anchor-head">
          {/* ears + gold drops */}
          <ellipse cx="48.5" cy="41.8" rx="1.7" ry="2.7" fill="#e8b795" />
          <ellipse cx="71.5" cy="41.8" rx="1.7" ry="2.7" fill="#e8b795" />
          <circle cx="48.2" cy="46.6" r="1.5" fill="none" stroke="url(#anchorGold)" strokeWidth="0.7" />
          <circle cx="71.8" cy="46.6" r="1.5" fill="none" stroke="url(#anchorGold)" strokeWidth="0.7" />
          <circle cx="48.2" cy="49.4" r="0.8" fill="url(#anchorGold)" />
          <circle cx="71.8" cy="49.4" r="0.8" fill="url(#anchorGold)" />

          {/* face */}
          <path
            d="M48.8 38 C48.8 28.5 53.5 23 60 23 C66.5 23 71.2 28.5 71.2 38 C71.2 45.5 67.6 52.5 60 56.5 C52.4 52.5 48.8 45.5 48.8 38 Z"
            fill="url(#anchorSkin)"
          />
          {/* soft contour + cheek light */}
          <path d="M49.6 39 C50.4 46 54 51.6 59.6 55.2 C55.6 54.4 51.8 48.6 50.8 41.4 Z" fill="#d79b76" opacity="0.35" />
          <ellipse cx="53.2" cy="47.2" rx="2.7" ry="1.5" fill="#ef8f8f" opacity="0.22" />
          <ellipse cx="66.8" cy="47.2" rx="2.7" ry="1.5" fill="#ef8f8f" opacity="0.22" />
          <ellipse cx="60" cy="29.4" rx="6.4" ry="3.4" fill="#ffffff" opacity="0.12" />

          {/* hair cap + side-swept fringe */}
          <path
            d="M47.6 38 C46.8 27.6 52.8 21.2 60 21.2 C67.2 21.2 73.2 27.6 72.4 38 C70 31.4 65.6 28.4 60 28.4 C54.4 28.4 50 31.4 47.6 38 Z"
            fill="url(#anchorHair)"
          />
          <path d="M48.4 33.4 C50.8 25.4 57.4 22.2 62.6 23.4 C58.6 25.6 55.4 29.4 54 34.6 C52.2 33.8 50.4 33.6 48.4 33.4 Z" fill="#3a2418" />
          <path d="M47.8 36.4 C50.2 28 57 23.8 63 24.6" stroke="#7a5438" strokeWidth="0.7" opacity="0.55" fill="none" />
          {/* fly-away strands */}
          <path d="M48 31 C45.6 30 44 31.4 43.6 33.6" stroke="#2a1911" strokeWidth="0.7" opacity="0.8" fill="none" />
          <path d="M72 31 C74.4 30 76 31.4 76.4 33.6" stroke="#2a1911" strokeWidth="0.7" opacity="0.8" fill="none" />

          {/* front hair falling over the shoulders */}
          <path d="M48.3 32.8 C45.6 45 44.6 66 45.6 88 C46 92 48.6 94 49.6 90 C48.6 70 49.2 48 51.2 35.6 Z" fill="url(#anchorHair)" />
          <path d="M71.7 32.8 C74.4 45 75.4 66 74.4 88 C74 92 71.4 94 70.4 90 C71.4 70 70.8 48 68.8 35.6 Z" fill="url(#anchorHair)" />

          {/* eyebrows */}
          <path d="M51.8 36.6 Q54.6 34.2 57.4 35.9" stroke="#3a2417" strokeWidth="1.05" strokeLinecap="round" fill="none" />
          <path d="M62.6 35.9 Q65.4 34.2 68.2 36.6" stroke="#3a2417" strokeWidth="1.05" strokeLinecap="round" fill="none" />

          {/* eyes */}
          <path d="M51.9 40.6 Q54.3 38.7 56.9 40.3 Q54.5 42.6 51.9 40.6 Z" fill="#fdfefe" />
          <path d="M63.1 40.3 Q65.7 38.7 68.1 40.6 Q65.5 42.6 63.1 40.3 Z" fill="#fdfefe" />
          <circle cx="54.6" cy="40.5" r="1.15" fill="#4a2c1c" />
          <circle cx="54.6" cy="40.5" r="0.55" fill="#140d08" />
          <circle cx="54.2" cy="40.1" r="0.3" fill="#ffffff" opacity="0.95" />
          <circle cx="65.4" cy="40.5" r="1.15" fill="#4a2c1c" />
          <circle cx="65.4" cy="40.5" r="0.55" fill="#140d08" />
          <circle cx="65" cy="40.1" r="0.3" fill="#ffffff" opacity="0.95" />
          <path d="M51.7 40.1 Q54.3 37.5 57.2 39.4" stroke="#2a1a12" strokeWidth="0.9" strokeLinecap="round" fill="none" />
          <path d="M68.3 40.1 Q65.7 37.5 62.8 39.4" stroke="#2a1a12" strokeWidth="0.9" strokeLinecap="round" fill="none" />
          <path d="M51.9 40.5 L50.9 39.5" stroke="#2a1a12" strokeWidth="0.55" strokeLinecap="round" />
          <path d="M68.1 40.5 L69.1 39.5" stroke="#2a1a12" strokeWidth="0.55" strokeLinecap="round" />

          {/* eyelids (closed while blinking) */}
          <rect className="anchor-lid" x="52.2" y="38.2" width="5" height="4.4" rx="2" fill="url(#anchorSkin)" />
          <rect className="anchor-lid" x="62.8" y="38.2" width="5" height="4.4" rx="2" fill="url(#anchorSkin)" />

          {/* nose */}
          <path d="M60 41.6 C59.6 44.4 59.1 46.2 58.5 47.3 C59.2 48.1 60.6 48.2 61.5 47.5" stroke="#d79b76" strokeWidth="0.7" strokeLinecap="round" fill="none" />
          <path d="M59.4 47.4 C59.9 47.9 60.8 47.9 61.2 47.5" stroke="#b97e5b" strokeWidth="0.5" strokeLinecap="round" />
          <path d="M60.4 42.2 L60.2 45.6" stroke="#ffffff" strokeWidth="0.4" opacity="0.35" strokeLinecap="round" />

          {/* lips: closed while idle, open ellipse while speaking */}
          <g className="anchor-smile">
            <path d="M55.6 51.7 Q57.8 50.2 60 51.4 Q62.2 50.2 64.4 51.7 Q62.2 54.6 60 54.7 Q57.8 54.6 55.6 51.7 Z" fill="url(#anchorLips)" />
            <path d="M56.6 51.8 Q60 53.4 63.4 51.8" stroke="#7d2f3d" strokeWidth="0.35" opacity="0.7" fill="none" />
            <ellipse cx="60" cy="53.4" rx="1.7" ry="0.45" fill="#e79aa1" opacity="0.5" />
          </g>
          <ellipse className="anchor-mouth" cx="60" cy="52.9" rx="3" ry="1.55" fill="#7d2f3d" />

          {/* jaw light + chin */}
          <path d="M57.4 55.3 Q60 57 62.6 55.3" stroke="#ffffff" strokeWidth="0.4" opacity="0.18" strokeLinecap="round" fill="none" />
        </g>
      </g>
    </svg>
  );
}

export default InfluencerAnchor;
