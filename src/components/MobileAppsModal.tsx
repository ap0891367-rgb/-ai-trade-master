"use client";

import React, { useState } from "react";
import {
  Smartphone,
  Apple,
  Download,
  CheckCircle2,
  Bell,
  Activity,
  Layers,
  ArrowRight,
  Sparkles,
  QrCode,
  ShieldCheck,
  X
} from "lucide-react";

interface MobileAppsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileAppsModal({ isOpen, onClose }: MobileAppsModalProps) {
  const [downloadStep, setDownloadStep] = useState<"SELECT" | "PROGRESS" | "READY">("SELECT");
  const [downloadProgress, setDownloadProgress] = useState(0);

  if (!isOpen) return null;

  const handleSimulateDownload = () => {
    setDownloadStep("PROGRESS");
    setDownloadProgress(10);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloadStep("READY");
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 text-white">
      <div className="bg-[#0b1329] border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#090f20]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">AI Trade Master Mobile Suite</h3>
              <p className="text-xs text-slate-400">Native Android (APK) & iOS (TestFlight / IPA) Mobile Applications</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Mobile Preview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400">GOOGLE PLAY READY</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">v3.2.0</span>
              </div>
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <span>Android App (APK)</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Full-featured Android client with background push notifications for 9:15 AM Open Interest surges and real-time 30-agent buy alerts.
              </p>
              <button
                onClick={handleSimulateDownload}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30"
              >
                <Download className="w-4 h-4" />
                <span>Download Android APK</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-blue-400">APP STORE / TESTFLIGHT</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">iOS 17+</span>
              </div>
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <span>iOS Application</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Optimized for iPhone and iPad with smooth interactive gestures, Dynamic Island alerts, and native biometric FaceID login.
              </p>
              <button
                onClick={handleSimulateDownload}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/30"
              >
                <Apple className="w-4 h-4" />
                <span>Open iOS TestFlight</span>
              </button>
            </div>
          </div>

          {/* Download Simulation Progress */}
          {downloadStep === "PROGRESS" && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between font-mono">
                <span>Packaging Mobile Asset Bundle...</span>
                <span className="text-cyan-400 font-bold">{downloadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div style={{ width: `${downloadProgress}%` }} className="h-full bg-cyan-400 transition-all duration-300" />
              </div>
            </div>
          )}

          {downloadStep === "READY" && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Mobile build bundle generated successfully. Ready for deployment and live testing!</span>
            </div>
          )}

          {/* Architecture Highlights */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs text-slate-300">
            <h5 className="font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Mobile Application Architecture:</span>
            </h5>
            <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-400">
              <li>Framework: React Native + Expo Managed Workflow with TypeScript</li>
              <li>Push Engine: Expo Push Notifications + Real-time WebSockets</li>
              <li>State & Cache: Redux Toolkit + SecureStore encrypted JWT token persistence</li>
              <li>Offline Sync: IndexedDB / SQLite simulated cache for offline chart inspection</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
