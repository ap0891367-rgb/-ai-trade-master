/**
 * Shared footer configuration model.
 *
 * The dashboard footer is never hardcoded in a component: it is fetched from
 * the database (`/api/footer`) and edited in the Super Admin console
 * (`/api/admin/footer`). This module holds the types, the factory defaults used
 * for a fresh database / "restore defaults" action, and the server-side
 * sanitizer that every write goes through.
 */

export type FooterSectionType = "BRAND" | "LINKS" | "CONNECT";

export interface FooterLinkConfig {
  id?: number;
  label: string;
  href: string;
  navKey?: string | null;
  isExternal?: boolean;
  enabled: boolean;
  sortOrder: number;
}

export interface FooterSectionConfig {
  id?: number;
  key: string;
  title: string;
  type: FooterSectionType;
  enabled: boolean;
  sortOrder: number;
  links: FooterLinkConfig[];
}

export interface SocialLinkConfig {
  id?: number;
  platform: string;
  label: string;
  url: string;
  iconKey: string;
  color: string;
  enabled: boolean;
  sortOrder: number;
}

export interface FooterSettingsConfig {
  brandName: string;
  brandTagline: string;
  brandDescription: string;
  brandLogoUrl: string | null;
  marketStatusText: string;
  systemStatusText: string;
  newsletterTitle: string;
  newsletterDescription: string;
  copyrightText: string;
  riskDisclaimer: string;
  version: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  glowEnabled: boolean;
  footerVisible: boolean;
  liveDataLabel: string;
  connectedLabel: string;
}

export interface FooterConfig {
  settings: FooterSettingsConfig;
  sections: FooterSectionConfig[];
  socials: SocialLinkConfig[];
  source?: "database" | "default" | "fallback";
  updatedAt?: string | null;
}

export const DEFAULT_FOOTER_SETTINGS: FooterSettingsConfig = {
  brandName: "AI TRADE MASTER",
  brandTagline: "Trade Smart • Grow Faster",
  brandDescription:
    "AI-powered trading analysis, market insights and portfolio management for smarter investing.",
  brandLogoUrl: "/logo.svg",
  marketStatusText: "Market Open",
  systemStatusText: "All Systems Online",
  newsletterTitle: "Get Updates",
  newsletterDescription: "Subscribe for latest updates and market insights.",
  copyrightText: "© 2026 AI Trade Master. All Rights Reserved.",
  riskDisclaimer: "Trading involves market risk",
  version: "Version 1.0.0",
  backgroundColor: "#030817",
  textColor: "#94a3b8",
  borderColor: "#13233c",
  glowEnabled: true,
  footerVisible: true,
  liveDataLabel: "Live Data",
  connectedLabel: "Connected",
};

export const DEFAULT_FOOTER_SECTIONS: FooterSectionConfig[] = [
  {
    key: "brand",
    title: "Brand",
    type: "BRAND",
    enabled: true,
    sortOrder: 0,
    links: [],
  },
  {
    key: "platform",
    title: "Platform",
    type: "LINKS",
    enabled: true,
    sortOrder: 1,
    links: [
      { label: "Dashboard", href: "#", navKey: "dashboard", enabled: true, sortOrder: 0 },
      { label: "Live Charts", href: "#", navKey: "charts", enabled: true, sortOrder: 1 },
      { label: "AI Agents", href: "#", navKey: "agents", enabled: true, sortOrder: 2 },
      { label: "28 Indicators", href: "#", navKey: "indicators", enabled: true, sortOrder: 3 },
      { label: "Market Scanner", href: "#", navKey: "scanner", enabled: true, sortOrder: 4 },
      { label: "Backtesting", href: "#", navKey: "backtesting", enabled: true, sortOrder: 5 },
      { label: "Strategies", href: "#", navKey: "strategies", enabled: true, sortOrder: 6 },
    ],
  },
  {
    key: "company",
    title: "Company",
    type: "LINKS",
    enabled: true,
    sortOrder: 2,
    links: [
      {
        label: "About Us",
        href: "mailto:hello@aitrademaster.ai?subject=About%20AI%20Trade%20Master",
        enabled: true,
        sortOrder: 0,
      },
      {
        label: "Our Team",
        href: "mailto:hello@aitrademaster.ai?subject=Our%20Team",
        enabled: true,
        sortOrder: 1,
      },
      {
        label: "Contact Us",
        href: "mailto:support@aitrademaster.ai?subject=Contact%20Us",
        enabled: true,
        sortOrder: 2,
      },
      {
        label: "Careers",
        href: "mailto:careers@aitrademaster.ai?subject=Careers",
        enabled: true,
        sortOrder: 3,
      },
    ],
  },
  {
    key: "legal",
    title: "Legal & Policies",
    type: "LINKS",
    enabled: true,
    sortOrder: 3,
    links: [
      {
        label: "Privacy Policy",
        href: "mailto:legal@aitrademaster.ai?subject=Privacy%20Policy",
        enabled: true,
        sortOrder: 0,
      },
      {
        label: "Terms & Conditions",
        href: "mailto:legal@aitrademaster.ai?subject=Terms%20%26%20Conditions",
        enabled: true,
        sortOrder: 1,
      },
      {
        label: "Disclaimer",
        href: "mailto:legal@aitrademaster.ai?subject=Disclaimer",
        enabled: true,
        sortOrder: 2,
      },
      {
        label: "Risk Disclosure",
        href: "mailto:legal@aitrademaster.ai?subject=Risk%20Disclosure",
        enabled: true,
        sortOrder: 3,
      },
      {
        label: "Refund & Cancellation",
        href: "mailto:legal@aitrademaster.ai?subject=Refund%20%26%20Cancellation",
        enabled: true,
        sortOrder: 4,
      },
      {
        label: "Cookie Policy",
        href: "mailto:legal@aitrademaster.ai?subject=Cookie%20Policy",
        enabled: true,
        sortOrder: 5,
      },
      {
        label: "Brokerage Disclosure",
        href: "mailto:legal@aitrademaster.ai?subject=Brokerage%20Disclosure",
        enabled: true,
        sortOrder: 6,
      },
    ],
  },
  {
    key: "help",
    title: "Help & Support",
    type: "LINKS",
    enabled: true,
    sortOrder: 4,
    links: [
      {
        label: "Help Center",
        href: "mailto:support@aitrademaster.ai?subject=Help%20Center",
        enabled: true,
        sortOrder: 0,
      },
      {
        label: "FAQs",
        href: "mailto:support@aitrademaster.ai?subject=FAQs",
        enabled: true,
        sortOrder: 1,
      },
      {
        label: "User Guide",
        href: "mailto:support@aitrademaster.ai?subject=User%20Guide",
        enabled: true,
        sortOrder: 2,
      },
      {
        label: "Report a Problem",
        href: "mailto:support@aitrademaster.ai?subject=Report%20a%20Problem",
        enabled: true,
        sortOrder: 3,
      },
    ],
  },
  {
    key: "connect",
    title: "Connect With Us",
    type: "CONNECT",
    enabled: true,
    sortOrder: 5,
    links: [],
  },
];

export const DEFAULT_SOCIAL_LINKS: SocialLinkConfig[] = [
  {
    platform: "youtube",
    label: "YouTube",
    url: "https://www.youtube.com",
    iconKey: "youtube",
    color: "#ff4d5e",
    enabled: true,
    sortOrder: 0,
  },
  {
    platform: "telegram",
    label: "Telegram",
    url: "https://telegram.org",
    iconKey: "telegram",
    color: "#38bdf8",
    enabled: true,
    sortOrder: 1,
  },
  {
    platform: "x",
    label: "X",
    url: "https://x.com",
    iconKey: "x",
    color: "#e2e8f0",
    enabled: true,
    sortOrder: 2,
  },
  {
    platform: "instagram",
    label: "Instagram",
    url: "https://www.instagram.com",
    iconKey: "instagram",
    color: "#e879c7",
    enabled: true,
    sortOrder: 3,
  },
  {
    platform: "facebook",
    label: "Facebook",
    url: "https://www.facebook.com",
    iconKey: "facebook",
    color: "#4f8dfd",
    enabled: true,
    sortOrder: 4,
  },
];

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  settings: DEFAULT_FOOTER_SETTINGS,
  sections: DEFAULT_FOOTER_SECTIONS,
  socials: DEFAULT_SOCIAL_LINKS,
  source: "default",
  updatedAt: null,
};

/** SVG paths for the social icons the admin can pick from. */
export const SOCIAL_ICONS: Record<string, { label: string; path: string }> = {
  youtube: {
    label: "YouTube",
    path: "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.5 15.6V8.4L15.8 12z",
  },
  telegram: {
    label: "Telegram",
    path: "M23.9 3.1 20.3 20c-.3 1.2-1 1.5-2 .9l-5.5-4-2.7 2.6c-.3.3-.5.5-1.1.5l.4-5.6L19.6 5c.4-.4-.1-.6-.7-.2L6.2 12.9l-5.4-1.7c-1.2-.4-1.2-1.2.2-1.8L22.3 1.9c1-.4 1.9.2 1.6 1.2z",
  },
  x: {
    label: "X",
    path: "M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L3 2h6.4l4.4 5.9zM17.8 20.1h1.7L8.4 3.8H6.6z",
  },
  instagram: {
    label: "Instagram",
    path: "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.4-.5.2-.9.4-1.2.8-.4.4-.6.7-.8 1.2-.2.4-.3 1-.4 2.1-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1.1.2 1.7.4 2.1.2.5.4.9.8 1.2.4.4.7.6 1.2.8.4.2 1 .3 2.1.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.9-.4 1.2-.8.4-.4.6-.7.8-1.2.2-.4.3-1 .4-2.1.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.7-.4-2.1-.2-.5-.4-.9-.8-1.2-.4-.4-.7-.6-1.2-.8-.4-.2-1-.3-2.1-.4-1.2-.1-1.6-.1-4.7-.1zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 1.8a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2zm5.1-2.9a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z",
  },
  facebook: {
    label: "Facebook",
    path: "M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z",
  },
  linkedin: {
    label: "LinkedIn",
    path: "M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z",
  },
  whatsapp: {
    label: "WhatsApp",
    path: "M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12.04 21.8h-.01a9.8 9.8 0 0 1-4.99-1.37l-.36-.21-3.71.97.99-3.62-.23-.37a9.8 9.8 0 0 1-1.5-5.23c0-5.41 4.4-9.81 9.82-9.81 2.62 0 5.08 1.02 6.93 2.88a9.75 9.75 0 0 1 2.87 6.94c0 5.41-4.41 9.82-9.81 9.82zM20.5 3.49A11.74 11.74 0 0 0 12.04 0C5.55 0 .27 5.28.27 11.77c0 2.07.54 4.1 1.57 5.89L.17 24l6.49-1.7a11.72 11.72 0 0 0 5.38 1.37h.01c6.48 0 11.77-5.28 11.77-11.77 0-3.14-1.23-6.1-3.32-8.31z",
  },
  website: {
    label: "Website",
    path: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.93 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14a8.2 8.2 0 0 1 0-4h3.38a16.5 16.5 0 0 0-.13 2c0 .69.05 1.36.13 2H4.26zm.81 2h2.95c.32 1.25.78 2.45 1.38 3.56A8.03 8.03 0 0 1 5.07 16zm2.95-8H5.07a8.03 8.03 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.02 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82A14.9 14.9 0 0 1 12 19.96zM14.34 14H9.66a14.6 14.6 0 0 1 0-4h4.68a14.6 14.6 0 0 1 0 4zm.63 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.08-.64.14-1.31.14-2 0-.69-.06-1.36-.14-2h3.38a8.2 8.2 0 0 1 0 4h-3.38z",
  },
};

const NAV_KEYS = new Set([
  "dashboard",
  "charts",
  "agents",
  "astrology",
  "indicators",
  "auto-trading",
  "portfolio",
  "history",
  "backtesting",
  "strategies",
  "scanner",
  "settings",
  "support",
]);

function text(value: unknown, fallback: string, maxLength = 400): string {
  if (typeof value !== "string") return fallback;
  const clean = value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim();
  if (!clean) return fallback;
  return clean.slice(0, maxLength);
}

function optionalText(value: unknown, maxLength = 80): string | null {
  if (typeof value !== "string") return null;
  const clean = value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim();
  return clean ? clean.slice(0, maxLength) : null;
}

function color(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const clean = value.trim();
  return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(clean) ? clean : fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function integer(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
}

/** Only allow safe link targets (http(s), mailto, tel, anchors and site-relative paths). */
export function safeFooterUrl(value: unknown, fallback = "#"): string {
  if (typeof value !== "string") return fallback;
  const clean = value.trim().slice(0, 2048);
  if (!clean) return fallback;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(clean)) return clean;
  if (clean === "#" || (clean.startsWith("#") && !clean.includes(" "))) return clean;
  if (clean.startsWith("/") && !clean.startsWith("//")) return clean;
  return fallback;
}

/** Logos accept site-relative images, https URLs or a raster base64 data URL. */
function safeLogo(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim();
  if (!clean) return null;
  if (clean.length > 2_400_000) return null;
  if (clean.startsWith("/") && !clean.startsWith("//")) return clean.slice(0, 2048);
  if (/^https:\/\//i.test(clean)) return clean.slice(0, 2048);
  if (/^data:image\/(?:png|jpe?g|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(clean)) return clean;
  return null;
}

function slug(value: string, fallback: string): string {
  const clean = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return clean || fallback;
}

/**
 * Normalizes untrusted admin input into a complete, safe footer config.
 * Keys are made unique, string lengths are capped, URLs/colors validated and
 * ordering is rewritten from array position so the DB rows stay deterministic.
 */
export function sanitizeFooterConfig(input: unknown): FooterConfig {
  const raw = (input ?? {}) as Record<string, any>;
  const rawSettings = (raw.settings ?? {}) as Record<string, any>;
  const settings: FooterSettingsConfig = {
    brandName: text(rawSettings.brandName, DEFAULT_FOOTER_SETTINGS.brandName, 80),
    brandTagline: text(rawSettings.brandTagline, DEFAULT_FOOTER_SETTINGS.brandTagline, 160),
    brandDescription: text(
      rawSettings.brandDescription,
      DEFAULT_FOOTER_SETTINGS.brandDescription,
      500,
    ),
    brandLogoUrl: safeLogo(rawSettings.brandLogoUrl),
    marketStatusText: text(
      rawSettings.marketStatusText,
      DEFAULT_FOOTER_SETTINGS.marketStatusText,
      80,
    ),
    systemStatusText: text(
      rawSettings.systemStatusText,
      DEFAULT_FOOTER_SETTINGS.systemStatusText,
      80,
    ),
    newsletterTitle: text(
      rawSettings.newsletterTitle,
      DEFAULT_FOOTER_SETTINGS.newsletterTitle,
      80,
    ),
    newsletterDescription: text(
      rawSettings.newsletterDescription,
      DEFAULT_FOOTER_SETTINGS.newsletterDescription,
      300,
    ),
    copyrightText: text(
      rawSettings.copyrightText,
      DEFAULT_FOOTER_SETTINGS.copyrightText,
      240,
    ),
    riskDisclaimer: text(
      rawSettings.riskDisclaimer,
      DEFAULT_FOOTER_SETTINGS.riskDisclaimer,
      300,
    ),
    version: text(rawSettings.version, DEFAULT_FOOTER_SETTINGS.version, 60),
    backgroundColor: color(rawSettings.backgroundColor, DEFAULT_FOOTER_SETTINGS.backgroundColor),
    textColor: color(rawSettings.textColor, DEFAULT_FOOTER_SETTINGS.textColor),
    borderColor: color(rawSettings.borderColor, DEFAULT_FOOTER_SETTINGS.borderColor),
    glowEnabled: bool(rawSettings.glowEnabled, DEFAULT_FOOTER_SETTINGS.glowEnabled),
    footerVisible: bool(rawSettings.footerVisible, DEFAULT_FOOTER_SETTINGS.footerVisible),
    liveDataLabel: text(
      rawSettings.liveDataLabel,
      DEFAULT_FOOTER_SETTINGS.liveDataLabel,
      60,
    ),
    connectedLabel: text(
      rawSettings.connectedLabel,
      DEFAULT_FOOTER_SETTINGS.connectedLabel,
      60,
    ),
  };

  const usedKeys = new Set<string>();
  const sectionsRaw: any[] = Array.isArray(raw.sections) ? raw.sections.slice(0, 12) : [];
  const sections: FooterSectionConfig[] = sectionsRaw.map((section, sectionIndex) => {
    const sectionType: FooterSectionType =
      section?.type === "BRAND" || section?.type === "CONNECT" ? section.type : "LINKS";
    const title = text(section?.title, `Section ${sectionIndex + 1}`, 80);
    let key = slug(String(section?.key ?? title), `section-${sectionIndex + 1}`);
    let suffix = 2;
    while (usedKeys.has(key)) {
      key = `${slug(String(section?.key ?? title), `section-${sectionIndex + 1}`)}-${suffix++}`;
    }
    usedKeys.add(key);

    const linksRaw: any[] = Array.isArray(section?.links) ? section.links.slice(0, 40) : [];
    const links: FooterLinkConfig[] = linksRaw.map((link, linkIndex) => {
      const navKey =
        typeof link?.navKey === "string" && NAV_KEYS.has(link.navKey) ? link.navKey : null;
      const href = safeFooterUrl(link?.href, "#");
      return {
        label: text(link?.label, `Link ${linkIndex + 1}`, 80),
        href,
        navKey,
        isExternal: /^https?:\/\//i.test(href),
        enabled: bool(link?.enabled, true),
        sortOrder: linkIndex,
      };
    });

    return {
      key,
      title,
      type: sectionType,
      enabled: bool(section?.enabled, true),
      sortOrder: sectionIndex,
      links,
    };
  });

  const socialsRaw: any[] = Array.isArray(raw.socials) ? raw.socials.slice(0, 20) : [];
  const socials: SocialLinkConfig[] = socialsRaw.map((social, index) => {
    const platform = slug(String(social?.platform ?? social?.label ?? "website"), "website");
    const iconKey = SOCIAL_ICONS[platform]
      ? platform
      : SOCIAL_ICONS[String(social?.iconKey)]
        ? String(social.iconKey)
        : "website";
    return {
      platform,
      label: text(social?.label, SOCIAL_ICONS[iconKey]?.label || "Website", 60),
      url: safeFooterUrl(social?.url, "#"),
      iconKey,
      color: color(social?.color, "#22d3ee"),
      enabled: bool(social?.enabled, true),
      sortOrder: index,
    };
  });

  return { settings, sections, socials, source: "database", updatedAt: new Date().toISOString() };
}

/** Deep copy so React state never mutates the module-level defaults. */
export function cloneFooterConfig(config: FooterConfig = DEFAULT_FOOTER_CONFIG): FooterConfig {
  return JSON.parse(JSON.stringify(config)) as FooterConfig;
}

export function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const clean = value.trim();
  if (clean.length < 6 || clean.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean);
}
