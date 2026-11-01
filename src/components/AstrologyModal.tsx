"use client";

import React from "react";
import { Sparkles, Moon, Sun, X, Star, Compass, ShieldCheck } from "lucide-react";
import { ASTRO_COMPANIES } from "@/lib/agents/agentCatalog";

interface AstrologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSymbol: string;
  astroHighlights?: any;
}

export function AstrologyModal({ isOpen, onClose, selectedSymbol, astroHighlights }: AstrologyModalProps) {
  if (!isOpen) return null;

  const companyAstro = ASTRO_COMPANIES[selectedSymbol] || ASTRO_COMPANIES["RELIANCE"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-900 border border-purple-500/40 rounded-3xl w-full max-w-xl overflow-hidden text-white shadow-2xl relative">
        {/* Glow effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-5 border-b border-purple-500/20 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-yellow-300 shadow-lg shadow-purple-600/30">
              <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: "12s" }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Agent #30: Astrologer Agent</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 font-semibold">
                  Company Rashi & Muhurat
                </span>
              </div>
              <p className="text-xs text-purple-200/70">
                Company Sthapana Kundali & Graha Gochar Analyzer reporting to Main Agent
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-purple-900/40 text-purple-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 relative z-10 max-h-[80vh] overflow-y-auto">
          {/* Main Card with Zodiac Symbol */}
          <div className="p-4 rounded-2xl bg-purple-900/20 border border-purple-500/30 flex items-center justify-between">
            <div>
              <div className="text-xs text-purple-300 font-medium">Company Profile & Sthapana Diwas</div>
              <div className="text-lg font-bold text-white mt-0.5">{companyAstro.name} ({companyAstro.symbol})</div>
              <div className="text-xs text-slate-300 font-mono mt-0.5">Founded: {companyAstro.foundedDate}</div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-extrabold text-yellow-300">
                {companyAstro.rashiSymbol}
              </div>
              <div className="text-xs font-bold text-purple-200 mt-1">
                {companyAstro.rashi}
              </div>
            </div>
          </div>

          {/* Kundali Breakdown Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/20">
              <span className="text-[10px] text-purple-300 uppercase tracking-wide">Rashi Lord</span>
              <div className="text-sm font-bold text-white mt-1">{companyAstro.rashiLord}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/20">
              <span className="text-[10px] text-purple-300 uppercase tracking-wide">Element</span>
              <div className="text-sm font-bold text-emerald-400 mt-1">{companyAstro.element}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/20">
              <span className="text-[10px] text-purple-300 uppercase tracking-wide">Nakshatra</span>
              <div className="text-sm font-bold text-yellow-300 mt-1">{companyAstro.nakshatra}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/20">
              <span className="text-[10px] text-purple-300 uppercase tracking-wide">Lucky Color</span>
              <div className="text-sm font-bold text-blue-300 mt-1">{companyAstro.luckyColor}</div>
            </div>
          </div>

          {/* Muhurat & Astrological Verdict */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 to-slate-900 border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-bold text-yellow-300">Active Planetary Transit (Graha Gochar)</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                {astroHighlights?.verdict || "BUY"} SIGNAL
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              {astroHighlights?.summary || "Surya dev 10th Karma house mein Digbali hain aur Shukra Lagna par kripadrishti de rahe hain. Yeh entry ke liye Shubh Muhurat hai."}
            </p>

            <div className="mt-3 pt-3 border-t border-purple-500/20 flex items-center justify-between text-xs">
              <span className="text-purple-300">
                Muhurat: <strong className="text-yellow-300">{astroHighlights?.muhurat || "Abhijit Muhurat"}</strong>
              </span>
              <span className="text-slate-400 font-mono">
                Weight in Master Agent: <strong>1.25x</strong>
              </span>
            </div>
          </div>

          {/* Hindi Explanation of How Astrologer Agent Works with Main Agent */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
            <strong className="text-yellow-300 block mb-1">Yeh Agent Kaise Kaam Karta Hai?</strong>
            Astrologer Agent company ke incorporation date ke aadhar par uski Kundali aur Rashi nirdharit karta hai. Jab live chart mein technical indicators buy signal dete hain, tab yeh agent Graha Gochar (Surya, Guru, Mangal, Budh) aur Shubh Choghadiya/Muhurat check karta hai. Dono ke match hone par Main Agent ko highest confidence signal transmit hota hai!
          </div>
        </div>
      </div>
    </div>
  );
}
