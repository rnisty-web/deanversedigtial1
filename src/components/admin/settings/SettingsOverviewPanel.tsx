"use client";

import Link from "next/link";
import { connectedIntegrations } from "@/lib/settings/config";
import { siteConfig } from "@/lib/constants";

type SettingsOverviewPanelProps = {
  profileName: string;
  profileEmail: string;
  teamCount: number | null;
  mediaCount: number | null;
};

export function SettingsOverviewPanel({
  profileName,
  profileEmail,
  teamCount,
  mediaCount,
}: SettingsOverviewPanelProps) {
  return (
    <aside className="admin-settings-overview">
      <div className="admin-settings-overview-panel">
        <p className="admin-settings-overview-title">Workspace</p>
        <div className="admin-settings-org-card">
          <div className="admin-settings-org-avatar" aria-hidden>
            {profileName
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase() ?? "")
              .join("") || "DV"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--admin-text)]">{profileName}</p>
            <p className="truncate text-xs text-[var(--admin-text-muted)]">{profileEmail}</p>
            <p className="mt-1 text-[11px] text-[var(--admin-gold-light)]">{siteConfig.name}</p>
          </div>
        </div>

        <dl className="admin-settings-overview-meta">
          <div>
            <dt>Team</dt>
            <dd>{teamCount ?? "—"}</dd>
          </div>
          <div>
            <dt>Media assets</dt>
            <dd>{mediaCount ?? "—"}</dd>
          </div>
          <div>
            <dt>Domain</dt>
            <dd className="truncate">{siteConfig.url.replace(/^https?:\/\//, "")}</dd>
          </div>
        </dl>

        <div className="admin-settings-quick-grid">
          <Link href="/admin/settings/my-account" className="admin-settings-quick-btn">
            Profile
          </Link>
          <Link href="/admin/users" className="admin-settings-quick-btn">
            Team
          </Link>
          <Link href="/admin/content" className="admin-settings-quick-btn">
            Site CMS
          </Link>
          <Link href="/" className="admin-settings-quick-btn">
            View site
          </Link>
        </div>
      </div>

      <div id="integrations" className="admin-settings-overview-panel">
        <p className="admin-settings-overview-title">Connected apps</p>
        <ul className="admin-settings-integration-list">
          {connectedIntegrations.map((item) => (
            <li key={item.name} className="admin-settings-integration-item">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--admin-text)]">{item.name}</p>
                <p className="text-xs text-[var(--admin-text-muted)]">{item.detail}</p>
              </div>
              <span
                className={
                  item.status === "Optional"
                    ? "admin-settings-integration-badge-muted"
                    : "admin-settings-integration-badge"
                }
              >
                {item.status}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="admin-settings-overview-panel">
        <p className="admin-settings-overview-title">Security snapshot</p>
        <ul className="admin-settings-security-list">
          <li>
            <span className="admin-settings-security-dot" aria-hidden />
            Admin routes protected by role verification
          </li>
          <li>
            <span className="admin-settings-security-dot" aria-hidden />
            Supabase session auth for portal and admin
          </li>
          <li>
            <span className="admin-settings-security-dot" aria-hidden />
            Rate limiting on public lead submissions
          </li>
        </ul>
        <Link href="/admin/settings/my-account" className="admin-settings-security-link">
          Update password →
        </Link>
      </div>
    </aside>
  );
}
