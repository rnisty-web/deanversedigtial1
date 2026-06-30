"use client";

import { useEffect, useState } from "react";
import { AdminAlert } from "@/components/admin/AdminAlert";
import {
  applyDashboardThemeToDocument,
  type DashboardThemeDefinition,
  type DashboardThemeId,
} from "@/lib/settings/dashboard-theme";
import { cn } from "@/lib/utils";

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
      aria-pressed={active}
    >
      <div
        className="admin-dashboard-theme-preview"
        data-theme-preview={theme.id}
        style={{ backgroundColor: theme.background }}
      >
        <div className="admin-dashboard-theme-preview-sidebar" />
        <div className="admin-dashboard-theme-preview-main">
          <div className="admin-dashboard-theme-preview-header" />
          <div className="admin-dashboard-theme-preview-grid">
            <div className="admin-dashboard-theme-preview-stat" />
            <div className="admin-dashboard-theme-preview-stat" />
            <div className="admin-dashboard-theme-preview-chart" />
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--admin-text)]">{theme.name}</p>
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
      {active ? (
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--admin-gold-light)]">
          Active theme
        </p>
      ) : null}
    </button>
  );
}

export function DashboardThemePicker({ initialTheme }: { initialTheme: DashboardThemeId }) {
  const [themes, setThemes] = useState<DashboardThemeDefinition[]>([]);
  const [activeTheme, setActiveTheme] = useState<DashboardThemeId>(initialTheme);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings/dashboard-theme", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((data) => {
        if (data.themes) setThemes(data.themes);
        if (data.theme) {
          setActiveTheme(data.theme);
          applyDashboardThemeToDocument(data.theme);
        }
      })
      .catch(() => undefined);
  }, []);

  async function handleSelect(theme: DashboardThemeId) {
    if (theme === activeTheme || saving) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    const res = await fetch("/api/admin/settings/dashboard-theme", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ theme }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to update dashboard theme");
      return;
    }

    const data = await res.json();
    setActiveTheme(data.theme);
    applyDashboardThemeToDocument(data.theme);
    setMessage(`${themes.find((item) => item.id === data.theme)?.name ?? "Theme"} applied across admin and client portals.`);
  }

  const options = themes.length > 0 ? themes : [];

  return (
    <div className="admin-dashboard-theme-picker">
      <div className="admin-dashboard-theme-picker-header">
        <div>
          <h2 className="admin-heading-serif text-xl text-[var(--admin-text)]">Dashboard appearance</h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--admin-text-muted)]">
            Choose a color mood for the admin and client portals. Each option keeps the same luxury layout — only the accent palette changes.
          </p>
        </div>
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

      <div className="admin-dashboard-theme-grid mt-6">
        {options.map((theme) => (
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
