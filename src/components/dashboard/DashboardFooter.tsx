"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  ChevronRight,
  Mail,
  Radio,
  ShieldCheck,
} from "lucide-react";

import {
  DEFAULT_FOOTER_CONFIG,
  SOCIAL_ICONS,
  type FooterConfig,
  type FooterLinkConfig,
  type FooterSectionConfig,
} from "@/lib/footer";

interface DashboardFooterProps {
  onNavigate?: (id: string) => void;
  /**
   * Optional config used by the Super Admin live preview. When omitted the
   * footer loads its content from `/api/footer` (database-driven).
   */
  config?: FooterConfig;
  preview?: boolean;
}

function splitBrandName(name: string): string[] {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [name];
  return [words.slice(0, -1).join(" "), words[words.length - 1]];
}

function FooterLinkRow({
  link,
  textColor,
  onNavigate,
  preview,
}: {
  link: FooterLinkConfig;
  textColor: string;
  onNavigate?: (id: string) => void;
  preview?: boolean;
}) {
  const className =
    "group flex items-center gap-1.5 text-[12px] leading-relaxed transition hover:text-cyan-300";
  const content = (
    <>
      <span>{link.label}</span>
      <ChevronRight className="h-3 w-3 -translate-x-1 text-cyan-400/0 transition group-hover:translate-x-0 group-hover:text-cyan-400/80" />
    </>
  );

  if (link.navKey) {
    return (
      <button
        type="button"
        onClick={() => {
          if (preview) return;
          onNavigate?.(link.navKey as string);
        }}
        className={`${className} text-left`}
        style={{ color: textColor }}
      >
        {content}
      </button>
    );
  }

  return (
    <a
      href={link.href || "#"}
      className={className}
      style={{ color: textColor }}
      target={link.isExternal ? "_blank" : undefined}
      rel={link.isExternal ? "noreferrer" : undefined}
      onClick={(event) => {
        if (preview) event.preventDefault();
      }}
    >
      {content}
    </a>
  );
}

function LinkColumn({
  section,
  textColor,
  onNavigate,
  preview,
}: {
  section: FooterSectionConfig;
  textColor: string;
  onNavigate?: (id: string) => void;
  preview?: boolean;
}) {
  const links = section.links.filter((link) => link.enabled && link.label.trim());
  if (links.length === 0) return null;

  return (
    <div>
      <h4 className="text-[13px] font-bold text-white">{section.title}</h4>
      <div className="mt-4 space-y-[11px]">
        {links.map((link, index) => (
          <FooterLinkRow
            key={`${section.key}-${link.label}-${index}`}
            link={link}
            textColor={textColor}
            onNavigate={onNavigate}
            preview={preview}
          />
        ))}
      </div>
    </div>
  );
}

function BrandColumn({
  config,
  textColor,
  borderColor,
}: {
  config: FooterConfig;
  textColor: string;
  borderColor: string;
}) {
  const { settings } = config;
  const brandLines = splitBrandName(settings.brandName);

  return (
    <div className="col-span-2 flex flex-col items-center text-center sm:col-span-2 lg:col-span-3 xl:col-span-1 xl:items-start xl:text-left">
      <div className="flex items-center gap-2.5">
        {settings.brandLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={settings.brandLogoUrl}
            alt={`${settings.brandName} logo`}
            className="h-10 w-10 shrink-0 rounded-xl object-contain"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <Bot className="h-5 w-5" />
          </div>
        )}
        <div className="text-left leading-tight">
          {brandLines.map((line, index) => (
            <p
              key={`${line}-${index}`}
              className="text-[15px] font-extrabold tracking-[0.22em] text-white"
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      <p className="mt-4 bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-400 bg-clip-text text-base font-bold text-transparent">
        {settings.brandTagline}
      </p>
      <p className="mt-2 max-w-[290px] text-[11px] leading-relaxed" style={{ color: textColor }}>
        {settings.brandDescription}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 xl:justify-start">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          {settings.marketStatusText}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[10px] font-semibold text-cyan-300">
          <Radio className="h-3 w-3" />
          {settings.systemStatusText}
        </span>
      </div>

      <span className="mt-4 hidden h-px w-full xl:block" style={{ backgroundColor: borderColor }} />
    </div>
  );
}

export function DashboardFooter({ onNavigate, config, preview = false }: DashboardFooterProps) {
  const [remoteConfig, setRemoteConfig] = useState<FooterConfig | null>(null);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [newsletterState, setNewsletterState] = useState<"idle" | "success" | "error">("idle");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [connectedAt, setConnectedAt] = useState("");

  useEffect(() => {
    if (config) return;
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/footer", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.config) setRemoteConfig(data.config as FooterConfig);
      } catch {
        // Keep the built-in defaults when the API is unreachable.
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [config]);

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

  const activeConfig = config ?? remoteConfig ?? DEFAULT_FOOTER_CONFIG;
  const { settings, sections, socials } = activeConfig;
  const visibleSections = useMemo(
    () => sections.filter((section) => section.enabled),
    [sections],
  );
  const visibleSocials = useMemo(
    () => socials.filter((social) => social.enabled && social.label.trim()),
    [socials],
  );

  const gridTemplate = useMemo(() => {
    const columns = visibleSections.map((section) => {
      if (section.type === "BRAND") return "1.6fr";
      if (section.type === "CONNECT") return "1.25fr";
      return "1fr";
    });
    return columns.length > 0 ? columns.join(" ") : "1.6fr 1fr 1fr 1.15fr 1fr 1.25fr";
  }, [visibleSections]);

  if (!settings.footerVisible) {
    if (!preview) return null;
    return (
      <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
        <p className="text-sm font-bold text-amber-300">Footer is currently hidden</p>
        <p className="mt-1 text-xs text-amber-200/70">
          Enable “Footer Visibility” in Footer Management to show it on the dashboard.
        </p>
      </div>
    );
  }

  const handleSubscribe = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    if (preview) {
      setNewsletterState("success");
      setNewsletterMessage("Preview mode — newsletter signup is not sent from here.");
      return;
    }

    setSubmitting(true);
    setNewsletterState("idle");
    setNewsletterMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Subscription failed. Please try again.");
      }

      setNewsletterState("success");
      setNewsletterMessage(data.message || "You're on the list. Welcome aboard!");
      setEmail("");
    } catch (error) {
      setNewsletterState("error");
      setNewsletterMessage(
        error instanceof Error ? error.message : "Subscription failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer
      className="relative mt-8 border-t pb-2 pt-8"
      style={{ borderColor: settings.borderColor, backgroundColor: settings.backgroundColor }}
    >
      {settings.glowEnabled && (
        <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
      )}

      <div
        className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:[grid-template-columns:var(--footer-cols)]"
        style={{ "--footer-cols": gridTemplate } as React.CSSProperties}
      >
        {visibleSections.map((section) => {
          if (section.type === "BRAND") {
            return (
              <BrandColumn
                key={section.key}
                config={activeConfig}
                textColor={settings.textColor}
                borderColor={settings.borderColor}
              />
            );
          }

          if (section.type === "CONNECT") {
            return (
              <div key={section.key} className="col-span-2 sm:col-span-2 lg:col-span-1">
                <h4 className="text-[13px] font-bold text-white">{section.title}</h4>

                {visibleSocials.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {visibleSocials.map((social, index) => {
                      const icon = SOCIAL_ICONS[social.iconKey] ?? SOCIAL_ICONS.website;
                      return (
                        <a
                          key={`${social.platform}-${index}`}
                          href={social.url || "#"}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={social.label}
                          title={social.label}
                          onClick={(event) => {
                            if (preview) event.preventDefault();
                          }}
                          className="group flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] transition hover:-translate-y-0.5 hover:border-white/25"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="h-[17px] w-[17px] transition group-hover:scale-110"
                            fill={social.color}
                            aria-hidden="true"
                          >
                            <path d={icon.path} />
                          </svg>
                        </a>
                      );
                    })}
                  </div>
                )}

                <div className="mt-4 border-t" style={{ borderColor: settings.borderColor }} />

                <p className="mt-4 text-sm font-bold text-white">{settings.newsletterTitle}</p>
                <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: settings.textColor }}>
                  {settings.newsletterDescription}
                </p>

                <form className="mt-3 space-y-2" onSubmit={handleSubscribe}>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (newsletterState !== "idle") {
                          setNewsletterState("idle");
                          setNewsletterMessage("");
                        }
                      }}
                      placeholder="Enter your email"
                      aria-label="Email address for newsletter"
                      className="h-9 w-full rounded-lg border bg-[#060d19] pl-9 pr-3 text-[11px] text-slate-200 outline-none transition placeholder:text-slate-500 focus:border-cyan-500/60"
                      style={{ borderColor: settings.borderColor }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-[11px] font-bold text-white shadow-lg shadow-cyan-500/15 transition hover:from-cyan-400 hover:to-blue-500 disabled:opacity-60"
                  >
                    {submitting ? "Subscribing..." : "Subscribe"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  {newsletterState !== "idle" && (
                    <p
                      className={`text-[10px] font-semibold ${
                        newsletterState === "success" ? "text-emerald-400" : "text-rose-400"
                      }`}
                      role="status"
                    >
                      {newsletterMessage}
                    </p>
                  )}
                </form>
              </div>
            );
          }

          return (
            <LinkColumn
              key={section.key}
              section={section}
              textColor={settings.textColor}
              onNavigate={onNavigate}
              preview={preview}
            />
          );
        })}
      </div>

      {/* Bottom bar */}
      <div
        className="mt-8 flex flex-col gap-3 border-t pt-4 text-[10px] lg:flex-row lg:items-center lg:justify-between"
        style={{ borderColor: settings.borderColor, color: settings.textColor }}
      >
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
          <span>{settings.copyrightText}</span>
          <span className="hidden h-7 w-px bg-[#1a2b47] sm:block" />
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400/80" />
            {settings.riskDisclaimer}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 lg:justify-end">
          <span>{settings.version}</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {settings.liveDataLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
            {settings.connectedLabel} {connectedAt ? `@ ${connectedAt}` : ""}
          </span>
        </div>
      </div>
    </footer>
  );
}
