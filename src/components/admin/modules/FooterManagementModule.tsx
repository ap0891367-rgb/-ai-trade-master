"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Eye,
  Image as ImageIcon,
  Link2,
  Loader2,
  Mail,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Share2,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";

import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import {
  DEFAULT_FOOTER_CONFIG,
  SOCIAL_ICONS,
  type FooterConfig,
  type FooterLinkConfig,
  type FooterSectionConfig,
  type FooterSettingsConfig,
  type SocialLinkConfig,
  cloneFooterConfig,
} from "@/lib/footer";

type Tab = "content" | "sections" | "social" | "appearance";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "content", label: "Brand & Content", icon: Eye },
  { id: "sections", label: "Sections & Links", icon: Link2 },
  { id: "social", label: "Social & Newsletter", icon: Share2 },
  { id: "appearance", label: "Appearance", icon: Palette },
];

function signature(config: FooterConfig | null): string {
  if (!config) return "";
  return JSON.stringify({
    settings: config.settings,
    sections: config.sections,
    socials: config.socials,
  });
}

function reindexSections(sections: FooterSectionConfig[]): FooterSectionConfig[] {
  return sections.map((section, index) => ({
    ...section,
    sortOrder: index,
    links: section.links.map((link, linkIndex) => ({
      ...link,
      sortOrder: linkIndex,
    })),
  }));
}

function compressLogo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === "image/gif") {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Could not read the image"));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = new window.Image();
      image.onload = () => {
        const max = 320;
        const scale = Math.min(1, max / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Canvas is not supported in this browser"));
          return;
        }
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/webp", 0.92));
      };
      image.onerror = () => reject(new Error("Could not decode the image"));
      image.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("Could not read the image"));
    reader.readAsDataURL(file);
  });
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">{children}</label>;
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  mono,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  mono?: boolean;
}) {
  return (
    <input
      type={type}
      required={required}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500 ${
        mono ? "font-mono" : ""
      }`}
    />
  );
}

function TextArea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full resize-y rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500"
    />
  );
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-left transition hover:border-slate-600"
    >
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-slate-200">{label}</span>
        {hint && <span className="mt-0.5 block text-[10px] text-slate-500">{hint}</span>}
      </span>
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${
          checked ? "bg-cyan-500" : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function ColorInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#030817"}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-slate-700 bg-slate-900 p-0.5"
          aria-label={`${label} colour picker`}
        />
        <TextInput value={value} onChange={onChange} mono />
      </div>
    </div>
  );
}

export function FooterManagementModule({ isSuperAdmin = true }: { isSuperAdmin?: boolean }) {
  const [draft, setDraft] = useState<FooterConfig | null>(null);
  const [saved, setSaved] = useState<FooterConfig | null>(null);
  const [subscribers, setSubscribers] = useState(0);
  const [tab, setTab] = useState<Tab>("content");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>("platform");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/footer", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load footer configuration");
      }
      setDraft(data.config);
      setSaved(data.config);
      setSubscribers(Number(data.subscribers || 0));
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to load footer configuration",
      });
      setDraft(cloneFooterConfig(DEFAULT_FOOTER_CONFIG));
      setSaved(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin]);

  const dirty = useMemo(() => signature(draft) !== signature(saved), [draft, saved]);

  const updateSettings = (patch: Partial<FooterSettingsConfig>) => {
    setDraft((previous) =>
      previous ? { ...previous, settings: { ...previous.settings, ...patch } } : previous,
    );
  };

  const updateSections = (updater: (sections: FooterSectionConfig[]) => FooterSectionConfig[]) => {
    setDraft((previous) =>
      previous ? { ...previous, sections: reindexSections(updater(previous.sections)) } : previous,
    );
  };

  const updateSection = (index: number, patch: Partial<FooterSectionConfig>) => {
    updateSections((sections) =>
      sections.map((section, sectionIndex) =>
        sectionIndex === index ? { ...section, ...patch } : section,
      ),
    );
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    updateSections((sections) => {
      const next = [...sections];
      const target = index + direction;
      if (target < 0 || target >= next.length) return sections;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const addSection = () => {
    const key = `section-${Date.now()}`;
    updateSections((sections) => [
      ...sections,
      {
        key,
        title: "New Section",
        type: "LINKS",
        enabled: true,
        sortOrder: sections.length,
        links: [],
      },
    ]);
    setExpandedSection(key);
  };

  const removeSection = (index: number) => {
    updateSections((sections) => sections.filter((_, sectionIndex) => sectionIndex !== index));
  };

  const addLink = (sectionIndex: number) => {
    updateSections((sections) =>
      sections.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              links: [
                ...section.links,
                {
                  label: "New Link",
                  href: "#",
                  navKey: null,
                  enabled: true,
                  sortOrder: section.links.length,
                  isExternal: false,
                },
              ],
            }
          : section,
      ),
    );
  };

  const updateLink = (
    sectionIndex: number,
    linkIndex: number,
    patch: Partial<FooterLinkConfig>,
  ) => {
    updateSections((sections) =>
      sections.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              links: section.links.map((link, currentLinkIndex) =>
                currentLinkIndex === linkIndex ? { ...link, ...patch } : link,
              ),
            }
          : section,
      ),
    );
  };

  const removeLink = (sectionIndex: number, linkIndex: number) => {
    updateSections((sections) =>
      sections.map((section, index) =>
        index === sectionIndex
          ? { ...section, links: section.links.filter((_, i) => i !== linkIndex) }
          : section,
      ),
    );
  };

  const moveLink = (sectionIndex: number, linkIndex: number, direction: -1 | 1) => {
    updateSections((sections) =>
      sections.map((section, index) => {
        if (index !== sectionIndex) return section;
        const next = [...section.links];
        const target = linkIndex + direction;
        if (target < 0 || target >= next.length) return section;
        [next[linkIndex], next[target]] = [next[target], next[linkIndex]];
        return { ...section, links: next };
      }),
    );
  };

  const updateSocial = (index: number, patch: Partial<SocialLinkConfig>) => {
    setDraft((previous) =>
      previous
        ? {
            ...previous,
            socials: previous.socials.map((social, socialIndex) =>
              socialIndex === index ? { ...social, ...patch } : social,
            ),
          }
        : previous,
    );
  };

  const removeSocial = (index: number) => {
    setDraft((previous) =>
      previous
        ? {
            ...previous,
            socials: previous.socials
              .filter((_, socialIndex) => socialIndex !== index)
              .map((social, socialIndex) => ({ ...social, sortOrder: socialIndex })),
          }
        : previous,
    );
  };

  const addSocial = () => {
    setDraft((previous) =>
      previous
        ? {
            ...previous,
            socials: [
              ...previous.socials,
              {
                platform: "website",
                label: "Website",
                url: "https://",
                iconKey: "website",
                color: "#22d3ee",
                enabled: true,
                sortOrder: previous.socials.length,
              },
            ],
          }
        : previous,
    );
  };

  const moveSocial = (index: number, direction: -1 | 1) => {
    setDraft((previous) => {
      if (!previous) return previous;
      const next = [...previous.socials];
      const target = index + direction;
      if (target < 0 || target >= next.length) return previous;
      [next[index], next[target]] = [next[target], next[index]];
      return {
        ...previous,
        socials: next.map((social, socialIndex) => ({ ...social, sortOrder: socialIndex })),
      };
    });
  };

  const handleLogoUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const dataUrl = await compressLogo(file);
      const res = await fetch("/api/admin/footer/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Logo upload failed");
      }
      updateSettings({ brandLogoUrl: data.url });
      setMessage({ type: "success", text: "Logo ready. Click Save Changes to publish it." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Logo upload failed",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/footer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: draft }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save footer configuration");
      }
      setDraft(data.config);
      setSaved(data.config);
      setMessage({
        type: "success",
        text: "Footer saved to the database. The trading dashboard now shows these changes.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save footer configuration",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async () => {
    if (!window.confirm("Restore the factory footer? Current footer content will be replaced.")) {
      return;
    }
    setRestoring(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/footer/restore", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to restore default footer");
      }
      setDraft(data.config);
      setSaved(data.config);
      setMessage({ type: "success", text: "Default footer restored and published." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to restore default footer",
      });
    } finally {
      setRestoring(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
        <div className="flex items-center gap-2 text-amber-300">
          <ShieldCheck className="h-5 w-5" />
          <h3 className="text-sm font-bold">Super Admin access required</h3>
        </div>
        <p className="mt-2 text-xs text-amber-200/70">
          Only a SUPER_ADMIN account can edit the website footer. Sign in with the Super Admin
          account to manage footer content.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-800 bg-[#0d1630]">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading footer configuration…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header / actions */}
      <div className="rounded-2xl border border-slate-800 bg-[#0d1630] p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="flex items-center gap-2 text-base font-extrabold text-white">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                Footer Management
              </h2>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-300">
                Super Admin only
              </span>
              {dirty && (
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                  Unsaved changes
                </span>
              )}
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Edit every footer section, link, logo, social URL and colour. Saved changes appear on
              the trading dashboard immediately after reload.
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-slate-500">
              <span>
                <strong className="text-slate-300">{draft?.sections.length ?? 0}</strong> sections
              </span>
              <span>
                <strong className="text-slate-300">
                  {draft?.sections.reduce((total, section) => total + section.links.length, 0) ?? 0}
                </strong>{" "}
                links
              </span>
              <span>
                <strong className="text-slate-300">{draft?.socials.length ?? 0}</strong> socials
              </span>
              <span>
                <strong className="text-slate-300">{subscribers}</strong> newsletter subscribers
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={load}
              disabled={loading || saving || restoring}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reload
            </button>
            <button
              type="button"
              onClick={handleRestore}
              disabled={saving || restoring}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-50"
            >
              {restoring ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
              {restoring ? "Restoring…" : "Restore Defaults"}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || restoring || !dirty}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-extrabold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`mt-3 flex items-start gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${
              message.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                : "border-rose-500/40 bg-rose-500/15 text-rose-300"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            )}
            <span className="flex-1">{message.text}</span>
            <button type="button" onClick={() => setMessage(null)} className="text-current/70 hover:text-current">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Editor + live preview */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="min-w-0 rounded-2xl border border-slate-800 bg-[#0d1630]">
          <div className="flex flex-wrap gap-1 border-b border-slate-800 p-2">
            {TABS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold transition ${
                    tab === item.id
                      ? "bg-cyan-500/15 text-cyan-300"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-4 p-4">
            {draft && tab === "content" && (
              <>
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
                      {draft.settings.brandLogoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={draft.settings.brandLogoUrl}
                          alt="Footer logo preview"
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-slate-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white">Website Logo</p>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        PNG, JPEG, WEBP or GIF. Automatically resized to 320px.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          className="hidden"
                          onChange={(event) => handleLogoUpload(event.target.files?.[0] ?? null)}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-2.5 py-1.5 text-[10px] font-bold text-white transition hover:bg-cyan-500 disabled:opacity-50"
                        >
                          {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                          {uploading ? "Uploading…" : "Upload Logo"}
                        </button>
                        {draft.settings.brandLogoUrl && (
                          <button
                            type="button"
                            onClick={() => updateSettings({ brandLogoUrl: null })}
                            className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-[10px] font-semibold text-slate-300 hover:text-white"
                          >
                            Use icon fallback
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Brand Name</Label>
                  <TextInput
                    value={draft.settings.brandName}
                    onChange={(value) => updateSettings({ brandName: value })}
                    required
                  />
                </div>
                <div>
                  <Label>Tagline</Label>
                  <TextInput
                    value={draft.settings.brandTagline}
                    onChange={(value) => updateSettings({ brandTagline: value })}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <TextArea
                    value={draft.settings.brandDescription}
                    onChange={(value) => updateSettings({ brandDescription: value })}
                    rows={3}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Market Status</Label>
                    <TextInput
                      value={draft.settings.marketStatusText}
                      onChange={(value) => updateSettings({ marketStatusText: value })}
                    />
                  </div>
                  <div>
                    <Label>System Status</Label>
                    <TextInput
                      value={draft.settings.systemStatusText}
                      onChange={(value) => updateSettings({ systemStatusText: value })}
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Copyright Text</Label>
                    <TextInput
                      value={draft.settings.copyrightText}
                      onChange={(value) => updateSettings({ copyrightText: value })}
                    />
                  </div>
                  <div>
                    <Label>Version</Label>
                    <TextInput
                      value={draft.settings.version}
                      onChange={(value) => updateSettings({ version: value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Trading Risk Disclaimer</Label>
                  <TextInput
                    value={draft.settings.riskDisclaimer}
                    onChange={(value) => updateSettings({ riskDisclaimer: value })}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Live Data Label</Label>
                    <TextInput
                      value={draft.settings.liveDataLabel}
                      onChange={(value) => updateSettings({ liveDataLabel: value })}
                    />
                  </div>
                  <div>
                    <Label>Connected Label</Label>
                    <TextInput
                      value={draft.settings.connectedLabel}
                      onChange={(value) => updateSettings({ connectedLabel: value })}
                    />
                  </div>
                </div>
              </>
            )}

            {draft && tab === "sections" && (
              <>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] text-slate-400">
                    Enable/disable sections, rename them, edit every link and change their order.
                  </p>
                  <button
                    type="button"
                    onClick={addSection}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-cyan-600 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-cyan-500"
                  >
                    <Plus className="h-3 w-3" /> Add Section
                  </button>
                </div>

                <div className="space-y-2">
                  {draft.sections.map((section, sectionIndex) => {
                    const isOpen = expandedSection === section.key;
                    return (
                      <div
                        key={`${section.key}-${sectionIndex}`}
                        className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40"
                      >
                        <div className="flex items-center gap-1.5 p-2">
                          <button
                            type="button"
                            onClick={() => setExpandedSection(isOpen ? null : section.key)}
                            className="flex min-w-0 flex-1 items-center gap-2 text-left"
                          >
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${
                                section.enabled ? "bg-emerald-400" : "bg-slate-600"
                              }`}
                            />
                            <span className="truncate text-xs font-bold text-white">
                              {section.title}
                            </span>
                            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-slate-400">
                              {section.type}
                            </span>
                            <span className="text-[9px] text-slate-500">
                              {section.links.length} links
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => updateSection(sectionIndex, { enabled: !section.enabled })}
                            className={`rounded-md px-2 py-1 text-[9px] font-bold ${
                              section.enabled
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {section.enabled ? "ON" : "OFF"}
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSection(sectionIndex, -1)}
                            disabled={sectionIndex === 0}
                            className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30"
                            aria-label="Move section up"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSection(sectionIndex, 1)}
                            disabled={sectionIndex === draft.sections.length - 1}
                            className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-30"
                            aria-label="Move section down"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSection(sectionIndex)}
                            className="rounded-md p-1 text-rose-400 hover:bg-rose-500/10"
                            aria-label="Delete section"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                        {isOpen && (
                          <div className="space-y-3 border-t border-slate-800 p-3">
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <Label>Section Title</Label>
                                <TextInput
                                  value={section.title}
                                  onChange={(value) =>
                                    updateSection(sectionIndex, { title: value })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Section Type</Label>
                                <select
                                  value={section.type}
                                  onChange={(event) =>
                                    updateSection(sectionIndex, {
                                      type: event.target.value as FooterSectionConfig["type"],
                                    })
                                  }
                                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
                                >
                                  <option value="LINKS">Links column</option>
                                  <option value="CONNECT">Connect / newsletter</option>
                                  <option value="BRAND">Brand column</option>
                                </select>
                              </div>
                            </div>

                            {section.type === "LINKS" ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label>Links</Label>
                                  <button
                                    type="button"
                                    onClick={() => addLink(sectionIndex)}
                                    className="flex items-center gap-1 rounded-md bg-slate-800 px-2 py-1 text-[9px] font-bold text-cyan-300 hover:bg-slate-700"
                                  >
                                    <Plus className="h-2.5 w-2.5" /> Add Link
                                  </button>
                                </div>

                                {section.links.length === 0 ? (
                                  <p className="rounded-lg border border-dashed border-slate-700 p-3 text-center text-[10px] text-slate-500">
                                    No links yet. Add your first link.
                                  </p>
                                ) : (
                                  section.links.map((link, linkIndex) => (
                                    <div
                                      key={`${section.key}-link-${linkIndex}`}
                                      className="rounded-lg border border-slate-800 bg-slate-900/70 p-2"
                                    >
                                      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                                        <div>
                                          <Label>Label</Label>
                                          <TextInput
                                            value={link.label}
                                            onChange={(value) =>
                                              updateLink(sectionIndex, linkIndex, {
                                                label: value,
                                              })
                                            }
                                          />
                                        </div>
                                        <div>
                                          <Label>URL or page</Label>
                                          <TextInput
                                            value={link.href}
                                            onChange={(value) =>
                                              updateLink(sectionIndex, linkIndex, {
                                                href: value,
                                              })
                                            }
                                            placeholder="https://… or mailto:…"
                                            mono
                                          />
                                        </div>
                                        <div className="flex items-end gap-1">
                                          <button
                                            type="button"
                                            onClick={() => moveLink(sectionIndex, linkIndex, -1)}
                                            disabled={linkIndex === 0}
                                            className="rounded-md bg-slate-800 p-1.5 text-slate-300 hover:text-white disabled:opacity-30"
                                            aria-label="Move link up"
                                          >
                                            <ArrowUp className="h-3 w-3" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => moveLink(sectionIndex, linkIndex, 1)}
                                            disabled={linkIndex === section.links.length - 1}
                                            className="rounded-md bg-slate-800 p-1.5 text-slate-300 hover:text-white disabled:opacity-30"
                                            aria-label="Move link down"
                                          >
                                            <ArrowDown className="h-3 w-3" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => removeLink(sectionIndex, linkIndex)}
                                            className="rounded-md bg-rose-500/10 p-1.5 text-rose-400 hover:bg-rose-500/20"
                                            aria-label="Delete link"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </button>
                                        </div>
                                      </div>
                                      <div className="mt-2 flex flex-wrap items-center gap-3">
                                        <label className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                          <input
                                            type="checkbox"
                                            checked={link.enabled}
                                            onChange={(event) =>
                                              updateLink(sectionIndex, linkIndex, {
                                                enabled: event.target.checked,
                                              })
                                            }
                                            className="accent-cyan-500"
                                          />
                                          Visible
                                        </label>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[10px] text-slate-500">
                                            Dashboard section:
                                          </span>
                                          <select
                                            value={link.navKey ?? ""}
                                            onChange={(event) =>
                                              updateLink(sectionIndex, linkIndex, {
                                                navKey: event.target.value || null,
                                              })
                                            }
                                            className="rounded-md border border-slate-700 bg-slate-800 px-1.5 py-1 text-[10px] text-slate-200"
                                          >
                                            <option value="">Use URL</option>
                                            <option value="dashboard">Dashboard</option>
                                            <option value="charts">Live Charts</option>
                                            <option value="agents">AI Agents</option>
                                            <option value="indicators">28 Indicators</option>
                                            <option value="scanner">Market Scanner</option>
                                            <option value="backtesting">Backtesting</option>
                                            <option value="strategies">Strategies</option>
                                            <option value="portfolio">Portfolio</option>
                                            <option value="history">Trade History</option>
                                            <option value="settings">Settings</option>
                                            <option value="support">Help & Support</option>
                                            <option value="astrology">Astrology AI</option>
                                          </select>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            ) : (
                              <p className="rounded-lg border border-dashed border-slate-700 p-3 text-[10px] text-slate-500">
                                {section.type === "BRAND"
                                  ? "Brand details come from Brand & Content. This section controls whether the brand column is visible or hidden."
                                  : "The Connect section renders your social icons and newsletter box. Edit socials in the Social & Newsletter tab."}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {draft && tab === "social" && (
              <>
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white">Social Media Links</p>
                    <button
                      type="button"
                      onClick={addSocial}
                      className="flex items-center gap-1 rounded-lg bg-cyan-600 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-cyan-500"
                    >
                      <Plus className="h-3 w-3" /> Add Social
                    </button>
                  </div>

                  <div className="mt-3 space-y-2">
                    {draft.socials.map((social, index) => (
                      <div
                        key={`${social.platform}-${index}`}
                        className="rounded-lg border border-slate-800 bg-slate-900/70 p-2"
                      >
                        <div className="grid gap-2 sm:grid-cols-[130px_1fr_110px_auto]">
                          <div>
                            <Label>Icon</Label>
                            <select
                              value={social.iconKey}
                              onChange={(event) => {
                                const key = event.target.value;
                                updateSocial(index, {
                                  iconKey: key,
                                  platform: key,
                                  label: SOCIAL_ICONS[key]?.label || social.label,
                                });
                              }}
                              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-white outline-none focus:border-cyan-500"
                            >
                              {Object.entries(SOCIAL_ICONS).map(([key, icon]) => (
                                <option key={key} value={key}>
                                  {icon.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <Label>Profile URL</Label>
                            <TextInput
                              value={social.url}
                              onChange={(value) => updateSocial(index, { url: value })}
                              placeholder="https://…"
                              mono
                            />
                          </div>
                          <div>
                            <Label>Icon Colour</Label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="color"
                                value={/^#[0-9a-f]{6}$/i.test(social.color) ? social.color : "#22d3ee"}
                                onChange={(event) => updateSocial(index, { color: event.target.value })}
                                className="h-9 w-9 cursor-pointer rounded-lg border border-slate-700 bg-slate-900 p-0.5"
                              />
                              <TextInput
                                value={social.color}
                                onChange={(value) => updateSocial(index, { color: value })}
                                mono
                              />
                            </div>
                          </div>
                          <div className="flex items-end gap-1">
                            <button
                              type="button"
                              onClick={() => moveSocial(index, -1)}
                              disabled={index === 0}
                              className="rounded-md bg-slate-800 p-1.5 text-slate-300 hover:text-white disabled:opacity-30"
                              aria-label="Move social up"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveSocial(index, 1)}
                              disabled={index === draft.socials.length - 1}
                              className="rounded-md bg-slate-800 p-1.5 text-slate-300 hover:text-white disabled:opacity-30"
                              aria-label="Move social down"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSocial(index)}
                              className="rounded-md bg-rose-500/10 p-1.5 text-rose-400 hover:bg-rose-500/20"
                              aria-label="Delete social"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          <div className="flex min-w-[160px] flex-1 items-center gap-2">
                            <Label>Label</Label>
                            <TextInput
                              value={social.label}
                              onChange={(value) => updateSocial(index, { label: value })}
                            />
                          </div>
                          <label className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <input
                              type="checkbox"
                              checked={social.enabled}
                              onChange={(event) =>
                                updateSocial(index, { enabled: event.target.checked })
                              }
                              className="accent-cyan-500"
                            />
                            Visible
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Mail className="h-3.5 w-3.5 text-cyan-400" />
                    Newsletter Box
                  </p>
                  <div className="mt-3 space-y-3">
                    <div>
                      <Label>Newsletter Title</Label>
                      <TextInput
                        value={draft.settings.newsletterTitle}
                        onChange={(value) => updateSettings({ newsletterTitle: value })}
                      />
                    </div>
                    <div>
                      <Label>Newsletter Description</Label>
                      <TextArea
                        value={draft.settings.newsletterDescription}
                        onChange={(value) => updateSettings({ newsletterDescription: value })}
                        rows={2}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Email validation, duplicate handling and database storage are handled by{" "}
                      <code className="rounded bg-slate-800 px-1 text-cyan-300">POST /api/newsletter</code>.
                      {" "}
                      <strong className="text-slate-300">{subscribers}</strong> subscribers stored.
                    </p>
                  </div>
                </div>
              </>
            )}

            {draft && tab === "appearance" && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ColorInput
                    label="Background Colour"
                    value={draft.settings.backgroundColor}
                    onChange={(value) => updateSettings({ backgroundColor: value })}
                  />
                  <ColorInput
                    label="Text Colour"
                    value={draft.settings.textColor}
                    onChange={(value) => updateSettings({ textColor: value })}
                  />
                  <ColorInput
                    label="Border Colour"
                    value={draft.settings.borderColor}
                    onChange={(value) => updateSettings({ borderColor: value })}
                  />
                </div>

                <Toggle
                  checked={draft.settings.glowEnabled}
                  onChange={(value) => updateSettings({ glowEnabled: value })}
                  label="Glow Effects"
                  hint="Neon cyan top border and glowing accents."
                />
                <Toggle
                  checked={draft.settings.footerVisible}
                  onChange={(value) => updateSettings({ footerVisible: value })}
                  label="Footer Visibility"
                  hint="Turn off to hide the entire footer on the trading dashboard."
                />

                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-[10px] leading-relaxed text-slate-500">
                  <p className="font-bold text-slate-300">Design tokens</p>
                  <p className="mt-1">
                    Background <span className="font-mono text-cyan-300">{draft.settings.backgroundColor}</span>,
                    text <span className="font-mono text-cyan-300">{draft.settings.textColor}</span>,
                    border <span className="font-mono text-cyan-300">{draft.settings.borderColor}</span>.
                  </p>
                  <p className="mt-1">
                    The footer keeps the dashboard&apos;s premium glassmorphism and neon border
                    language on desktop, tablet and mobile.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Live preview */}
        <div className="min-w-0">
          <div className="xl:sticky xl:top-20">
            <div className="rounded-2xl border border-slate-800 bg-[#0d1630]">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Eye className="h-3.5 w-3.5 text-cyan-400" />
                    Live Footer Preview
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    Updates instantly while you edit. Save to publish on the dashboard.
                  </p>
                </div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                  LIVE
                </span>
              </div>
              <div className="max-h-[calc(100vh-220px)] overflow-y-auto bg-[#020a1f] p-3">
                {draft && <DashboardFooter config={draft} preview />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
