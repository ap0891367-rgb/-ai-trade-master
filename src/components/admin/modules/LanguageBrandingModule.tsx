"use client";

import React, { useState } from "react";
import {
  Globe,
  Check,
  Edit,
  Plus,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight
} from "lucide-react";
import { SupportedLanguage, SUPPORTED_LANGUAGES } from "@/lib/i18n";

export function LanguageBrandingModule() {
  const [languages, setLanguages] = useState(SUPPORTED_LANGUAGES);
  const [projectName, setProjectName] = useState("AI Trade Master");
  const [tagline, setTagline] = useState("Trade Smarter with AI.");
  const [primaryColor, setPrimaryColor] = useState("#101D35");
  const [secondaryColor, setSecondaryColor] = useState("#287BFF");
  const [accentColor, setAccentColor] = useState("#38D9F5");
  const [successColor, setSuccessColor] = useState("#16C784");

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback("Branding guidelines and color system saved successfully.");
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 text-white">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-[#0d1630] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <span>Multilingual Localization & Enterprise Branding System</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                12_INDIAN_LANGUAGES
              </span>
            </h4>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Governs full native translation strings and brand identity across Web, Android, and iOS clients.
            </p>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 12 Languages Grid */}
      <div className="bg-[#0d1630] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Active Language Localization Matrix ({languages.length} Languages)</span>
          </h4>
          <span className="text-xs text-emerald-400 font-mono font-bold">● All 12 Ready</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {languages.map((lang) => (
            <div
              key={lang.code}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{lang.flag}</span>
                <div>
                  <div className="font-bold text-white">{lang.nameNative}</div>
                  <div className="text-[10px] text-slate-400">{lang.nameEnglish} ({lang.script})</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-300">
                ACTIVE
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Branding Configuration */}
      <div className="bg-[#0d1630] border border-slate-800 rounded-2xl p-5 space-y-4">
        <h4 className="text-sm font-bold text-white pb-3 border-b border-slate-800">
          Enterprise Design System & Theme Colors
        </h4>

        <form onSubmit={handleSaveBranding} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Project Brand Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 mb-1">Primary Deep Navy</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Secondary Electric Blue</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 mb-1">Accent Cyan</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Success Emerald</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={successColor}
                  onChange={(e) => setSuccessColor(e.target.value)}
                  className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={successColor}
                  onChange={(e) => setSuccessColor(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30"
            >
              Update Brand Identity & Colors
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
