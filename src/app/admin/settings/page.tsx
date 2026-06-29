"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import {
  SettingsAdminHeader,
  SettingsStatCard,
} from "@/components/admin/settings/SettingsAdminHeader";
import { SettingsCategoryCard } from "@/components/admin/settings/SettingsCategoryCard";
import { SettingsOverviewPanel } from "@/components/admin/settings/SettingsOverviewPanel";
import {
  filterSettingsCategories,
  groupSettingsBySection,
  settingsCategories,
} from "@/lib/settings/config";

const statIcons = {
  team: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  media: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M21.75 8.25v5.25c0 .414-.336.75-.75.75h-5.25m5.25 0l-4.5-4.5m0 0l-3-3m3 3l3-3m-3 3l-3 3" />
    </svg>
  ),
  integrations: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  ),
  security: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
};

type ProfileSummary = {
  full_name: string | null;
  email: string;
};

export default function AdminSettingsPage() {
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [teamCount, setTeamCount] = useState<number | null>(null);
  const [mediaCount, setMediaCount] = useState<number | null>(null);

  useEffect(() => {
    async function loadOverview() {
      const [accountRes, usersRes, mediaRes] = await Promise.all([
        fetch("/api/admin/account", { credentials: "same-origin" }),
        fetch("/api/admin/users", { credentials: "same-origin" }),
        fetch("/api/admin/media", { credentials: "same-origin" }),
      ]);

      if (accountRes.ok) {
        const data = await accountRes.json();
        setProfile({
          full_name: data.profile?.full_name ?? null,
          email: data.profile?.email ?? "",
        });
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        setTeamCount(Array.isArray(data.users) ? data.users.length : null);
      }

      if (mediaRes.ok) {
        const data = await mediaRes.json();
        setMediaCount(Array.isArray(data.files) ? data.files.length : null);
      }
    }

    loadOverview();
  }, []);

  const filtered = useMemo(
    () => filterSettingsCategories(settingsCategories, search),
    [search],
  );

  const grouped = useMemo(() => groupSettingsBySection(filtered), [filtered]);

  const profileName = profile?.full_name?.trim() || profile?.email || "Admin";
  const profileEmail = profile?.email || "—";

  const categoryStats: Record<string, string> = {
    profile: profileEmail,
    team: teamCount !== null ? String(teamCount) : "—",
    storage: mediaCount !== null ? String(mediaCount) : "—",
    integrations: "4 services",
  };

  return (
    <div className="admin-settings-page">
      <SettingsAdminHeader search={search} onSearchChange={setSearch} />

      <AdminPageContent className="admin-settings-content">
        <div className="admin-settings-stats">
          <SettingsStatCard
            label="Team members"
            value={teamCount ?? "—"}
            hint="Admin & staff accounts"
            icon={statIcons.team}
          />
          <SettingsStatCard
            label="Media assets"
            value={mediaCount ?? "—"}
            hint="Uploaded library files"
            icon={statIcons.media}
          />
          <SettingsStatCard
            label="Integrations"
            value="4"
            hint="Core platform services"
            icon={statIcons.integrations}
          />
          <SettingsStatCard
            label="Security"
            value="Protected"
            hint="Role-gated admin access"
            icon={statIcons.security}
          />
        </div>

        {filtered.length === 0 ? (
          <AdminEmptyState
            title="No settings match your search"
            description="Try another keyword like profile, billing, or integrations."
          />
        ) : (
          <div className="admin-settings-layout">
            <div className="admin-settings-main">
              {grouped.map((group) => (
                <section key={group.section} className="admin-settings-section">
                  <div className="admin-settings-section-header">
                    <h2 className="admin-settings-section-title">{group.section}</h2>
                    <span className="text-xs text-[var(--admin-text-muted)]">{group.items.length}</span>
                  </div>
                  <div className="admin-settings-grid">
                    {group.items.map((category) => (
                      <SettingsCategoryCard
                        key={category.id}
                        category={category}
                        statValue={categoryStats[category.id]}
                      />
                    ))}
                  </div>
                </section>
              ))}

              <div className="admin-settings-help">
                <p className="text-sm text-[var(--admin-text-muted)]">
                  Need to update your personal profile, email, or password?{" "}
                  <Link href="/admin/settings/my-account" className="text-[var(--admin-gold-light)] hover:text-[var(--admin-text)]">
                    Open My Account →
                  </Link>
                </p>
              </div>
            </div>

            <SettingsOverviewPanel
              profileName={profileName}
              profileEmail={profileEmail}
              teamCount={teamCount}
              mediaCount={mediaCount}
            />
          </div>
        )}
      </AdminPageContent>
    </div>
  );
}
