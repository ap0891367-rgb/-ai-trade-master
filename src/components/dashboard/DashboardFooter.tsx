"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Bot,
  ChevronRight,
  Mail,
  Radio,
  ShieldCheck,
} from "lucide-react";

type FooterLink = {
  label: string;
  nav?: string;
  href?: string;
};

const PLATFORM_LINKS: FooterLink[] = [
  { label: "Dashboard", nav: "dashboard" },
  { label: "Live Charts", nav: "charts" },
  { label: "AI Agents", nav: "agents" },
  { label: "28 Indicators", nav: "indicators" },
  { label: "Market Scanner", nav: "scanner" },
  { label: "Backtesting", nav: "backtesting" },
  { label: "Strategies", nav: "strategies" },
];

const COMPANY_LINKS: FooterLink[] = [
  { label: "About Us", href: "mailto:hello@aitrademaster.ai?subject=About%20AI%20Trade%20Master" },
  { label: "Our Team", href: "mailto:hello@aitrademaster.ai?subject=Our%20Team" },
  { label: "Contact Us", href: "mailto:support@aitrademaster.ai?subject=Contact%20Us" },
  { label: "Careers", href: "mailto:careers@aitrademaster.ai?subject=Careers" },
];

const LEGAL_LINKS: FooterLink[] = [
  { label: "Privacy Policy", href: "mailto:legal@aitrademaster.ai?subject=Privacy%20Policy" },
  { label: "Terms & Conditions", href: "mailto:legal@aitrademaster.ai?subject=Terms%20%26%20Conditions" },
  { label: "Disclaimer", href: "mailto:legal@aitrademaster.ai?subject=Disclaimer" },
  { label: "Risk Disclosure", href: "mailto:legal@aitrademaster.ai?subject=Risk%20Disclosure" },
  { label: "Refund & Cancellation", href: "mailto:legal@aitrademaster.ai?subject=Refund%20%26%20Cancellation" },
  { label: "Cookie Policy", href: "mailto:legal@aitrademaster.ai?subject=Cookie%20Policy" },
  { label: "Brokerage Disclosure", href: "mailto:legal@aitrademaster.ai?subject=Brokerage%20Disclosure" },
];

const HELP_LINKS: FooterLink[] = [
  { label: "Help Center", href: "mailto:support@aitrademaster.ai?subject=Help%20Center" },
  { label: "FAQs", href: "mailto:support@aitrademaster.ai?subject=FAQs" },
  { label: "User Guide", href: "mailto:support@aitrademaster.ai?subject=User%20Guide" },
  { label: "Report a Problem", href: "mailto:support@aitrademaster.ai?subject=Report%20a%20Problem" },
];

const SOCIALS = [
  {
    label: "YouTube",
    href: "https://www.youtube.com",
    color: "#ff4d5e",
    path: "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.5 15.6V8.4L15.8 12z",
  },
  {
    label: "Telegram",
    href: "https://telegram.org",
    color: "#38bdf8",
    path: "M23.9 3.1 20.3 20c-.3 1.2-1 1.5-2 .9l-5.5-4-2.7 2.6c-.3.3-.5.5-1.1.5l.4-5.6L19.6 5c.4-.4-.1-.6-.7-.2L6.2 12.9l-5.4-1.7c-1.2-.4-1.2-1.2.2-1.8L22.3 1.9c1-.4 1.9.2 1.6 1.2z",
  },
  {
    label: "X",
    href: "https://x.com",
    color: "#e2e8f0",
    path: "M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L3 2h6.4l4.4 5.9zM17.8 20.1h1.7L8.4 3.8H6.6z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com",
    color: "#e879c7",
    path: "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.4-.5.2-.9.4-1.2.8-.4.4-.6.7-.8 1.2-.2.4-.3 1-.4 2.1-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1.1.2 1.7.4 2.1.2.5.4.9.8 1.2.4.4.7.6 1.2.8.4.2 1 .3 2.1.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.9-.4 1.2-.8.4-.4.6-.7.8-1.2.2-.4.3-1 .4-2.1.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.7-.4-2.1-.2-.5-.4-.9-.8-1.2-.4-.4-.7-.6-1.2-.8-.4-.2-1-.3-2.1-.4-1.2-.1-1.6-.1-4.7-.1zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 1.8a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2zm5.1-2.9a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com",
    color: "#4f8dfd",
    path: "M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z",
  },
];

function FooterLinkRow({
  link,
  onNavigate,
}: {
  link: FooterLink;
  onNavigate?: (id: string) => void;
}) {
  const className =
    "group flex items-center gap-1.5 text-[12px] leading-relaxed text-slate-400 transition hover:text-cyan-300";
  const content = (
    <>
      <span>{link.label}</span>
      <ChevronRight className="h-3 w-3 -translate-x-1 text-cyan-400/0 transition group-hover:translate-x-0 group-hover:text-cyan-400/80" />
    </>
  );

  if (link.nav) {
    return (
      <button
        type="button"
        onClick={() => onNavigate?.(link.nav!)}
        className={`${className} text-left`}
      >
        {content}
      </button>
    );
  }

  return (
    <a href={link.href || "#"} className={className}>
      {content}
    </a>
  );
}

function LinkColumn({
  title,
  links,
  onNavigate,
}: {
  title: string;
  links: FooterLink[];
  onNavigate?: (id: string) => void;
}) {
  return (
    <div>
      <h4 className="text-[13px] font-bold text-white">{title}</h4>
      <div className="mt-4 space-y-[11px]">
        {links.map((link) => (
          <FooterLinkRow key={link.label} link={link} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}

export function DashboardFooter({ onNavigate }: { onNavigate?: (id: string) => void }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [connectedAt, setConnectedAt] = useState("");

  useEffect(() => {
    const update = () => {
      const text = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
        .format(new Date())
        .replace(/\b(am|pm)\b/gi, (match) => match.toUpperCase());
      setConnectedAt(text);
    };
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <footer className="relative mt-8 border-t border-[#13233c] pb-2 pt-8">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

      <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[1.6fr_1fr_1fr_1.15fr_1fr_1.25fr]">
        {/* Brand */}
        <div className="col-span-2 flex flex-col items-center text-center sm:col-span-2 lg:col-span-3 xl:col-span-1 xl:items-start xl:text-left">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <Bot className="h-5 w-5" />
            </div>
            <div className="text-left leading-tight">
              <p className="text-[15px] font-extrabold tracking-[0.22em] text-white">AI TRADE</p>
              <p className="text-[15px] font-extrabold tracking-[0.22em] text-white">MASTER</p>
            </div>
          </div>

          <p className="mt-4 bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-400 bg-clip-text text-base font-bold text-transparent">
            Trade Smart. Grow Faster
          </p>
          <p className="mt-2 max-w-[290px] text-[11px] leading-relaxed text-slate-400">
            AI-powered trading analysis, market insights and portfolio management for smarter
            investing.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 xl:justify-start">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Market open
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold text-cyan-300">
              <Radio className="h-3 w-3" />
              All Systems online
            </span>
          </div>
        </div>

        <LinkColumn title="Platform" links={PLATFORM_LINKS} onNavigate={onNavigate} />
        <LinkColumn title="Company" links={COMPANY_LINKS} onNavigate={onNavigate} />
        <LinkColumn title="Legal & Policies" links={LEGAL_LINKS} onNavigate={onNavigate} />
        <LinkColumn title="Help & Support" links={HELP_LINKS} onNavigate={onNavigate} />

        {/* Connect */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-1">
          <h4 className="text-[13px] font-bold text-white">Connect With Us</h4>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="group flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] transition hover:-translate-y-0.5 hover:border-white/25"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-[17px] w-[17px] transition group-hover:scale-110"
                  fill={social.color}
                  aria-hidden="true"
                >
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>

          <div className="mt-4 border-t border-[#101c31]" />

          <p className="mt-4 text-sm font-bold text-white">Get Updates</p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
            Subscribe for latest updates and market insights.
          </p>

          <form
            className="mt-3 space-y-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (!email.trim()) return;
              setSubscribed(true);
              setEmail("");
            }}
          >
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (subscribed) setSubscribed(false);
                }}
                placeholder="Enter your email"
                className="h-9 w-full rounded-lg border border-[#1a2b47] bg-[#060d19] pl-9 pr-3 text-[11px] text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-cyan-500/60"
              />
            </div>
            <button
              type="submit"
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-[11px] font-bold text-white shadow-lg shadow-cyan-500/15 transition hover:from-cyan-400 hover:to-blue-500"
            >
              {subscribed ? "Subscribed" : "Subscribe"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            {subscribed && (
              <p className="text-[10px] font-semibold text-emerald-400">
                You&apos;re on the list. Welcome aboard!
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-8 flex flex-col gap-3 border-t border-[#101c31] pt-4 text-[10px] text-slate-500 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
          <span className="text-slate-400">
            © 2026 AI Trade Master. All Rights Reserved.
          </span>
          <span className="hidden h-7 w-px bg-[#1a2b47] sm:block" />
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400/80" />
            Trading involves market risk
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 lg:justify-end">
          <span>Version: 1.0.0</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live Data
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
            Connected {connectedAt ? `@ ${connectedAt}` : ""}
          </span>
        </div>
      </div>
    </footer>
  );
}
