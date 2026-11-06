import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  auditLogs,
  footerLinks,
  footerSections,
  footerSettings,
  socialLinks,
} from "@/db/schema";
import {
  DEFAULT_FOOTER_CONFIG,
  type FooterConfig,
  type FooterLinkConfig,
  type FooterSectionConfig,
  type FooterSectionType,
  type FooterSettingsConfig,
  type SocialLinkConfig,
  cloneFooterConfig,
  sanitizeFooterConfig,
} from "@/lib/footer";

type SettingsRow = typeof footerSettings.$inferSelect;
type SectionRow = typeof footerSections.$inferSelect;
type LinkRow = typeof footerLinks.$inferSelect;
type SocialRow = typeof socialLinks.$inferSelect;

function settingsFromRow(row: SettingsRow): FooterSettingsConfig {
  return {
    brandName: row.brandName,
    brandTagline: row.brandTagline,
    brandDescription: row.brandDescription,
    brandLogoUrl: row.brandLogoUrl,
    marketStatusText: row.marketStatusText,
    systemStatusText: row.systemStatusText,
    newsletterTitle: row.newsletterTitle,
    newsletterDescription: row.newsletterDescription,
    copyrightText: row.copyrightText,
    riskDisclaimer: row.riskDisclaimer,
    version: row.version,
    backgroundColor: row.backgroundColor,
    textColor: row.textColor,
    borderColor: row.borderColor,
    glowEnabled: row.glowEnabled,
    footerVisible: row.footerVisible,
    liveDataLabel: row.liveDataLabel,
    connectedLabel: row.connectedLabel,
  };
}

function configFromRows(
  settings: SettingsRow,
  sections: SectionRow[],
  links: LinkRow[],
  socials: SocialRow[],
): FooterConfig {
  const linksBySection = new Map<number, FooterLinkConfig[]>();
  for (const link of links) {
    const list = linksBySection.get(link.sectionId) ?? [];
    list.push({
      id: link.id,
      label: link.label,
      href: link.href,
      navKey: link.navKey,
      isExternal: link.isExternal,
      enabled: link.enabled,
      sortOrder: link.sortOrder,
    });
    linksBySection.set(link.sectionId, list);
  }

  const sectionConfigs: FooterSectionConfig[] = sections.map((section) => ({
    id: section.id,
    key: section.sectionKey,
    title: section.title,
    type: section.sectionType as FooterSectionType,
    enabled: section.enabled,
    sortOrder: section.sortOrder,
    links: (linksBySection.get(section.id) ?? []).sort((a, b) => a.sortOrder - b.sortOrder),
  }));

  const socialConfigs: SocialLinkConfig[] = socials.map((social) => ({
    id: social.id,
    platform: social.platform,
    label: social.label,
    url: social.url,
    iconKey: social.iconKey,
    color: social.color,
    enabled: social.enabled,
    sortOrder: social.sortOrder,
  }));

  return {
    settings: settingsFromRow(settings),
    sections: sectionConfigs.sort((a, b) => a.sortOrder - b.sortOrder),
    socials: socialConfigs.sort((a, b) => a.sortOrder - b.sortOrder),
    source: "database",
    updatedAt: settings.updatedAt ? settings.updatedAt.toISOString() : null,
  };
}

/**
 * Reads the public footer configuration.
 *
 * Falls back to the built-in defaults when the database tables do not exist
 * yet (fresh checkout / build environment) or the connection is unavailable.
 */
export async function getFooterConfig(): Promise<FooterConfig> {
  try {
    let [settingsRow] = await db.select().from(footerSettings).limit(1);

    if (!settingsRow) {
      const seeded = await seedFooterDefaults("system@aitrademaster.ai", false);
      if (!seeded) return { ...cloneFooterConfig(DEFAULT_FOOTER_CONFIG), source: "fallback" };
      [settingsRow] = await db.select().from(footerSettings).limit(1);
      if (!settingsRow) return { ...cloneFooterConfig(DEFAULT_FOOTER_CONFIG), source: "fallback" };
    }

    const [sections, links, socials] = await Promise.all([
      db.select().from(footerSections).orderBy(asc(footerSections.sortOrder)),
      db.select().from(footerLinks).orderBy(asc(footerLinks.sortOrder)),
      db.select().from(socialLinks).orderBy(asc(socialLinks.sortOrder)),
    ]);

    return configFromRows(settingsRow, sections, links, socials);
  } catch (error) {
    console.warn("[footer] Falling back to default footer config:", error instanceof Error ? error.message : error);
    return { ...cloneFooterConfig(DEFAULT_FOOTER_CONFIG), source: "fallback" };
  }
}

function settingsValues(config: FooterConfig, updatedBy: string) {
  const s = config.settings;
  return {
    brandName: s.brandName,
    brandTagline: s.brandTagline,
    brandDescription: s.brandDescription,
    brandLogoUrl: s.brandLogoUrl,
    marketStatusText: s.marketStatusText,
    systemStatusText: s.systemStatusText,
    newsletterTitle: s.newsletterTitle,
    newsletterDescription: s.newsletterDescription,
    copyrightText: s.copyrightText,
    riskDisclaimer: s.riskDisclaimer,
    version: s.version,
    backgroundColor: s.backgroundColor,
    textColor: s.textColor,
    borderColor: s.borderColor,
    glowEnabled: s.glowEnabled,
    footerVisible: s.footerVisible,
    liveDataLabel: s.liveDataLabel,
    connectedLabel: s.connectedLabel,
    updatedBy,
    updatedAt: new Date(),
  };
}

/**
 * Replaces the whole footer configuration in one transaction. Called by the
 * Super Admin Footer Management module (save + restore defaults).
 */
export async function saveFooterConfig(
  input: unknown,
  adminEmail: string,
  options: { audit?: boolean } = {},
): Promise<FooterConfig> {
  const config = sanitizeFooterConfig(input);
  const shouldAudit = options.audit !== false;

  await db.transaction(async (tx) => {
    const [existing] = await tx.select({ id: footerSettings.id }).from(footerSettings).limit(1);
    const values = settingsValues(config, adminEmail);

    if (existing) {
      await tx.update(footerSettings).set(values).where(eq(footerSettings.id, existing.id));
    } else {
      await tx.insert(footerSettings).values(values);
    }

    // Full replace keeps ordering simple and avoids orphaned rows.
    await tx.delete(footerLinks);
    await tx.delete(footerSections);
    await tx.delete(socialLinks);

    for (const section of config.sections) {
      const [inserted] = await tx
        .insert(footerSections)
        .values({
          sectionKey: section.key,
          title: section.title,
          sectionType: section.type,
          enabled: section.enabled,
          sortOrder: section.sortOrder,
          updatedAt: new Date(),
        })
        .returning({ id: footerSections.id });

      if (section.links.length > 0) {
        await tx.insert(footerLinks).values(
          section.links.map((link) => ({
            sectionId: inserted.id,
            label: link.label,
            href: link.href,
            navKey: link.navKey ?? null,
            isExternal: Boolean(link.isExternal),
            enabled: link.enabled,
            sortOrder: link.sortOrder,
            updatedAt: new Date(),
          })),
        );
      }
    }

    if (config.socials.length > 0) {
      await tx.insert(socialLinks).values(
        config.socials.map((social) => ({
          platform: social.platform,
          label: social.label,
          url: social.url,
          iconKey: social.iconKey,
          color: social.color,
          enabled: social.enabled,
          sortOrder: social.sortOrder,
          updatedAt: new Date(),
        })),
      );
    }

    if (shouldAudit) {
      await tx.insert(auditLogs).values({
        action: "FOOTER_UPDATED",
        targetEntity: "FooterConfig",
        targetId: "footer",
        details: {
          sections: config.sections.length,
          links: config.sections.reduce((total, section) => total + section.links.length, 0),
          socials: config.socials.length,
          visible: config.settings.footerVisible,
        },
        adminEmail,
      });
    }
  });

  return getFooterConfig();
}

/** Seeds the footer tables with the factory defaults (idempotent). */
export async function seedFooterDefaults(
  adminEmail = "system@aitrademaster.ai",
  audit = false,
): Promise<boolean> {
  try {
    const [existing] = await db.select({ id: footerSettings.id }).from(footerSettings).limit(1);
    if (existing) return true;
    await saveFooterConfig(DEFAULT_FOOTER_CONFIG, adminEmail, { audit });
    return true;
  } catch (error) {
    console.error("[footer] Failed to seed default footer:", error);
    return false;
  }
}
