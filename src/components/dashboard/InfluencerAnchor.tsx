"use client";

import React from "react";

export type AnchorGesture = "buy" | "sell" | "hold";

/**
 * Full-body vector presenter ("AI anchor") used in the AI signal panel.
 * The figure is animated entirely with CSS (see anchor.css) so it stays
 * lightweight and works offline: idle breathing + weight shift + blinks,
 * an open-palm "presenting" gesture for BUY, a palm-down sweep for SELL,
 * and lip movement while the browser speaks the verdict.
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
      aria-label="AI market anchor announcing the trading signal"
      className={`anchor-svg anchor-gesture-${gesture} ${speaking ? "anchor-speaking" : ""} ${className}`}
    >
      <defs>
        <linearGradient id="anchorSuit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#24405f" />
          <stop offset="1" stopColor="#101f33" />
        </linearGradient>
        <linearGradient id="anchorSuitLight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2f5077" />
          <stop offset="1" stopColor="#16283f" />
        </linearGradient>
        <linearGradient id="anchorSkin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2cdac" />
          <stop offset="1" stopColor="#d9a67f" />
        </linearGradient>
        <linearGradient id="anchorShirt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eef5ff" />
          <stop offset="1" stopColor="#b7c9e2" />
        </linearGradient>
        <linearGradient id="anchorHair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#232833" />
          <stop offset="1" stopColor="#0b0e14" />
        </linearGradient>
        <linearGradient id="anchorTie" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#0e7490" />
        </linearGradient>
        <radialGradient id="anchorSpot" cx="50%" cy="8%" r="78%">
          <stop offset="0" stopColor="var(--anchor-glow, #22d3ee)" stopOpacity="0.24" />
          <stop offset="70%" stopColor="var(--anchor-glow, #22d3ee)" stopOpacity="0.05" />
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
        {/* legs */}
        <path d="M43 154 L58 154 L57 283 L45 283 Z" fill="url(#anchorSuit)" />
        <path d="M62 154 L77 154 L75 283 L63 283 Z" fill="url(#anchorSuit)" />
        <path d="M47 160 L47 278" stroke="#0a1626" strokeWidth="0.8" opacity="0.6" />
        <path d="M73 160 L73 278" stroke="#0a1626" strokeWidth="0.8" opacity="0.6" />
        <rect x="42" y="281" width="16" height="9" rx="4" fill="#0a111c" />
        <rect x="62" y="281" width="16" height="9" rx="4" fill="#0a111c" />

        {/* back arm (viewer left) */}
        <g className="anchor-arm anchor-arm-left">
          <path d="M44 68 C36 70 32 77 32 88 L34 124 L40 124 L41 90 C41 82 44 78 48 76 Z" fill="url(#anchorSuitLight)" />
          <path d="M40 122 L34 124 L35 152 L41 152 Z" fill="url(#anchorSuitLight)" />
          <rect x="32.5" y="150" width="9.5" height="12.5" rx="4.6" fill="url(#anchorSkin)" />
        </g>

        {/* torso */}
        <g className="anchor-torso">
          <path
            d="M38 72 C38 66 44 61 52 60 L68 60 C76 61 82 66 82 72 L85 120 L80 157 L40 157 L35 120 Z"
            fill="url(#anchorSuit)"
          />
          {/* shirt */}
          <path d="M52 60 L60 86 L68 60 L64 59 L60 72 L56 59 Z" fill="url(#anchorShirt)" />
          {/* tie */}
          <path d="M57.4 61.5 L62.6 61.5 L61.9 68.5 L58.1 68.5 Z" fill="#0e7490" />
          <path d="M58.3 68.5 L61.7 68.5 L63 110 L60 118 L57 110 Z" fill="url(#anchorTie)" />
          {/* lapels */}
          <path d="M52 60 L60 86 L56 95 L45 68 Z" fill="#1a2c45" />
          <path d="M68 60 L60 86 L64 95 L75 68 Z" fill="#1a2c45" />
          <path d="M52 60 L60 86 L58.6 89 L51 66 Z" fill="#28405f" opacity="0.7" />
          <path d="M68 60 L60 86 L61.4 89 L69 66 Z" fill="#28405f" opacity="0.7" />
          {/* pocket square */}
          <path d="M45.5 88 L50 84.5 L50 88 Z" fill="#cfe4ff" opacity="0.8" />
          {/* jacket shading */}
          <path d="M40 157 L38 120 L35 120 L40 157 Z" fill="#0a1626" opacity="0.45" />
          <path d="M80 157 L82 120 L85 120 L80 157 Z" fill="#0a1626" opacity="0.45" />
        </g>

        {/* front arm (viewer right) — this one gestures */}
        <g className="anchor-arm anchor-arm-right">
          <path d="M76 68 C84 70 88 77 88 88 L86 124 L80 124 L79 90 C79 82 76 78 72 76 Z" fill="url(#anchorSuitLight)" />
          <g className="anchor-forearm anchor-forearm-right">
            <path d="M80 121 L86 123 L85 152 L79 152 Z" fill="url(#anchorSuitLight)" />
            <path d="M79.4 149.4 L85.6 149.4" stroke="#0e7490" strokeWidth="1.2" opacity="0.7" />
            <rect x="78" y="150" width="9.5" height="12.5" rx="4.6" fill="url(#anchorSkin)" />
            {/* open palm hint */}
            <path d="M80 160 L80 163.5 M82.4 160 L82.4 164 M84.8 160 L84.8 163.5" stroke="#c68f6a" strokeWidth="0.6" strokeLinecap="round" opacity="0.85" />
          </g>
        </g>

        {/* head */}
        <g className="anchor-head">
          <rect x="55.4" y="52" width="9.2" height="10" rx="3" fill="#caa07c" />
          <ellipse cx="47.4" cy="45" rx="2.3" ry="3" fill="#e3b48e" />
          <ellipse cx="72.6" cy="45" rx="2.3" ry="3" fill="#e3b48e" />
          <ellipse cx="60" cy="43" rx="12.6" ry="15.4" fill="url(#anchorSkin)" />
          {/* hair */}
          <path
            d="M47.2 40 C46.4 27.4 52.8 23.4 60 23.4 C67.2 23.4 73.6 27.4 72.8 40 C70.2 33.6 66.2 31.2 60 31.2 C53.8 31.2 49.8 33.6 47.2 40 Z"
            fill="url(#anchorHair)"
          />
          <path d="M47.2 37.5 L49.2 37.5 L48.8 44 L47.4 43.4 Z" fill="url(#anchorHair)" />
          <path d="M72.8 37.5 L70.8 37.5 L71.2 44 L72.6 43.4 Z" fill="url(#anchorHair)" />
          {/* brows */}
          <rect x="51.6" y="37.6" width="6.6" height="1.6" rx="0.8" fill="#1d222c" />
          <rect x="61.8" y="37.6" width="6.6" height="1.6" rx="0.8" fill="#1d222c" />
          {/* eyes */}
          <ellipse cx="55.2" cy="43.3" rx="2" ry="2.3" fill="#f8fafc" />
          <circle cx="55.4" cy="43.5" r="1.1" fill="#20252f" />
          <circle cx="55.9" cy="43" r="0.35" fill="#ffffff" opacity="0.9" />
          <ellipse cx="64.8" cy="43.3" rx="2" ry="2.3" fill="#f8fafc" />
          <circle cx="64.6" cy="43.5" r="1.1" fill="#20252f" />
          <circle cx="65.1" cy="43" r="0.35" fill="#ffffff" opacity="0.9" />
          {/* eyelids */}
          <rect className="anchor-lid" x="52.9" y="40.7" width="4.7" height="4.2" rx="1.6" fill="url(#anchorSkin)" />
          <rect className="anchor-lid" x="62.4" y="40.7" width="4.7" height="4.2" rx="1.6" fill="url(#anchorSkin)" />
          {/* nose */}
          <path d="M60 44.6 L58.7 51 Q60 52.3 61.3 51 Z" fill="#c68f6a" opacity="0.8" />
          {/* mouth */}
          <path className="anchor-smile" d="M55.2 55.2 Q60 58.9 64.8 55.2" fill="none" stroke="#8a4a45" strokeWidth="1.3" strokeLinecap="round" />
          <ellipse className="anchor-mouth" cx="60" cy="55.9" rx="3.4" ry="1.9" fill="#5b2530" />
          {/* cheek light */}
          <ellipse cx="60" cy="48" rx="10" ry="7" fill="#ffffff" opacity="0.05" />
        </g>
      </g>
    </svg>
  );
}

export default InfluencerAnchor;
