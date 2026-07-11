"use client";

import { useEffect, useState } from "react";
import { AdminAlert } from "@/components/admin/AdminAlert";
import {
  applyDashboardThemeToDocument,
  DASHBOARD_THEMES,
  getDashboardThemeDefinition,
  type DashboardThemeDefinition,
  type DashboardThemeId,
} from "@/lib/settings/dashboard-theme";
import { cn } from "@/lib/utils";

/** Convert a #rrggbb hex color to rgba() with the given alpha. */
function tint(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const CHART_BAR_HEIGHTS = [42, 68, 55, 88, 62, 100, 74];

function ThemePreviewCard({
  theme,
  active,
  saving,
  onSelect,
}: {
  theme: DashboardThemeDefinition;
  active: boolean;
  saving: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={saving}
      className={cn(
        "admin-dashboard-theme-card text-left",
        active && "admin-dashboard-theme-card-active",
        saving && "opacity-70",
      )}
      style={
        active
          ? { borderColor: tint(theme.accent, 0.55), boxShadow: `0 0 0 1px ${tint(theme.accent, 0.3)}, 0 20px 48px -24px ${tint(theme.accent, 0.4)}` }
          : undefined
      }
      aria-pressed={active}
    >
      {/* Mini dashboard mock, colored entirely from the theme definition */}
      <div
        className="admin-dashboard-theme-preview"
        style={{
          backgroundColor: theme.background,
          borderColor: tint(theme.secondary, 0.3),
        }}
      >
        <div
          className="admin-dashboard-theme-preview-sidebar"
          style={{ backgroundColor: theme.panel }}
        >
          <span
            className="admin-dashboard-theme-preview-logo"
            style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})` }}
          />
          <span
            className="admin-dashboard-theme-preview-nav admin-dashboard-theme-preview-nav-active"
            style={{ backgroundColor: tint(theme.accent, 0.4) }}
          />
          <span className="admin-dashboard-theme-preview-nav" style={{ backgroundColor: tint(theme.accent, 0.14) }} />
          <span className="admin-dashboard-theme-preview-nav" style={{ backgroundColor: tint(theme.accent, 0.14) }} />
          <span className="admin-dashboard-theme-preview-nav" style={{ backgroundColor: tint(theme.accent, 0.14) }} />
        </div>

        <div className="admin-dashboard-theme-preview-main">
          <div className="admin-dashboard-theme-preview-topbar">
            <span
              className="admin-dashboard-theme-preview-title"
              style={{ background: `linear-gradient(90deg, ${tint(theme.accentLight, 0.75)}, ${tint(theme.accentLight, 0.25)})` }}
            />
            <span
              className="admin-dashboard-theme-preview-avatar"
              style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})` }}
            />
          </div>

          <div className="admin-dashboard-theme-preview-stats">
            {[theme.accent, theme.secondary].map((color, index) => (
              <div
                key={index}
                className="admin-dashboard-theme-preview-stat"
                style={{ backgroundColor: theme.panel, borderColor: tint(color, 0.35) }}
              >
                <span className="admin-dashboard-theme-preview-stat-label" style={{ backgroundColor: tint(color, 0.5) }} />
                <span className="admin-dashboard-theme-preview-stat-value" style={{ backgroundColor: tint(color, 0.85) }} />
              </div>
            ))}
          </div>

          <div
            className="admin-dashboard-theme-preview-chart"
            style={{ backgroundColor: theme.panel, borderColor: tint(theme.secondary, 0.25) }}
          >
            {CHART_BAR_HEIGHTS.map((height, index) => {
              const color = index % 2 === 0 ? theme.accent : theme.secondary;
              return (
                <span
                  key={index}
                  className="admin-dashboard-theme-preview-bar"
                  style={{
                    height: `${height}%`,
                    background: `linear-gradient(180deg, ${tint(color, 0.9)}, ${tint(color, 0.35)})`,
                    transitionDelay: `${index * 35}ms`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-[var(--admin-text)]">
            {theme.name}
            {active ? (
              <span
                className="admin-dashboard-theme-active-pill"
                style={{ color: theme.accentLight, backgroundColor: tint(theme.accent, 0.14), borderColor: tint(theme.accent, 0.4) }}
              >
                <svg viewBox="0 0 12 12" fill="none" aria-hidden className="h-2.5 w-2.5">
                  <path d="M2.5 6.5 5 9l4.5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Active
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--admin-text-muted)]">
            {theme.description}
          </p>
        </div>
        <div className="flex shrink-0 gap-1.5 pt-0.5">
          <span
            className="h-4 w-4 rounded-full ring-1 ring-white/10"
            style={{ backgroundColor: theme.accent }}
            aria-hidden
          />
          <span
            className="h-4 w-4 rounded-full ring-1 ring-white/10"
            style={{ backgroundColor: theme.secondary }}
            aria-hidden
          />
        </div>
      </div>
    </button>
  );
}

export function DashboardThemePicker({ initialTheme }: { initialTheme: DashboardThemeId }) {
  // Seed from the local catalog so the grid always renders, even if the
  // settings fetch fails; the API response can refresh it afterwards.
  const [themes, setThemes] = useState<DashboardThemeDefinition[]>(DASHBOARD_THEMES);
  const [activeTheme, setActiveTheme] = useState<DashboardThemeId>(initialTheme);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/settings/dashboard-theme", {
          credentials: "same-origin",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "Could not load your saved theme — showing defaults.");
          return;
        }
        const data = await res.json();
        if (data.themes) setThemes(data.themes);
        if (data.theme) {
          setActiveTheme(data.theme);
          applyDashboardThemeToDocument(data.theme);
        }
      } catch {
        setError("Could not load your saved theme — showing defaults.");
      }
    })();
  }, []);

  async function handleSelect(theme: DashboardThemeId) {
    if (theme === activeTheme || saving) return;

    const previous = activeTheme;
    // Apply instantly so the whole dashboard transforms while the save runs.
    setActiveTheme(theme);
    applyDashboardThemeToDocument(theme);
    setSaving(true);
    setError(null);
    setMessage(null);

    let res: Response;
    try {
      res = await fetch("/api/admin/settings/dashboard-theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ theme }),
      });
    } catch {
      setSaving(false);
      setActiveTheme(previous);
      applyDashboardThemeToDocument(previous);
      setError("Failed to update dashboard theme");
      return;
    }

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setActiveTheme(previous);
      applyDashboardThemeToDocument(previous);
      setError(data.error ?? "Failed to update dashboard theme");
      return;
    }

    const data = await res.json();
    setActiveTheme(data.theme);
    applyDashboardThemeToDocument(data.theme);
    setMessage(`${themes.find((item) => item.id === data.theme)?.name ?? "Theme"} applied across admin and client portals.`);
  }

  const active = getDashboardThemeDefinition(activeTheme);

  return (
    <div className="admin-dashboard-theme-picker">
      {/* Hero banner painted with the active theme's palette */}
      <div
        className="admin-dashboard-theme-hero"
        style={{
          background: `linear-gradient(120deg, ${tint(active.accent, 0.16)} 0%, ${tint(active.secondary, 0.1)} 45%, transparent 80%), linear-gradient(155deg, rgba(255, 255, 255, 0.03), transparent)`,
          borderColor: tint(active.accent, 0.3),
        }}
      >
        <div className="admin-dashboard-theme-hero-glow" style={{ background: `radial-gradient(closest-side, ${tint(active.accent, 0.28)}, transparent)` }} aria-hidden />
        <div className="relative">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: active.accentLight }}
          >
            Now wearing
          </p>
          <h2 className="admin-heading-serif mt-1 text-2xl text-[var(--admin-text)]">{active.name}</h2>
          <p className="mt-1.5 max-w-2xl text-sm text-[var(--admin-text-muted)]">{active.description}</p>
        </div>
        <div className="admin-dashboard-theme-hero-swatches" aria-hidden>
          {[active.accentLight, active.accent, active.secondary].map((color, index) => (
            <span key={index} style={{ backgroundColor: color }} />
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--admin-text)]">Theme gallery</h3>
          <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
            Pick a mood — it applies instantly across the admin and client portals.
          </p>
        </div>
        <p className="text-xs text-[var(--admin-text-muted)]">{themes.length} themes</p>
      </div>

      {error ? (
        <AdminAlert tone="error" className="mt-4">
          {error}
        </AdminAlert>
      ) : null}
      {message ? (
        <AdminAlert tone="success" className="mt-4">
          {message}
        </AdminAlert>
      ) : null}

      <div className="admin-dashboard-theme-grid mt-5">
        {themes.map((theme) => (
          <ThemePreviewCard
            key={theme.id}
            theme={theme}
            active={activeTheme === theme.id}
            saving={saving}
            onSelect={() => handleSelect(theme.id)}
          />
        ))}
      </div>
    </div>
  );
}
