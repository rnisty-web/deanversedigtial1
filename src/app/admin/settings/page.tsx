"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import { SettingsAdminHeader } from "@/components/admin/settings/SettingsAdminHeader";
import { SettingsCategoryCard } from "@/components/admin/settings/SettingsCategoryCard";
import { SettingsOverviewPanel } from "@/components/admin/settings/SettingsOverviewPanel";
import {
  filterSettingsCategories,
  groupSettingsBySection,
  settingsCategories,
} from "@/lib/settings/config";

type ProfileSummary = {
  full_name: string | null;
  email: string;
};

export default function AdminSettingsPage() {
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOverview() {
      try {
        const accountRes = await fetch("/api/admin/account", { credentials: "same-origin" });

        if (accountRes.ok) {
          const data = await accountRes.json();
          setProfile({
            full_name: data.profile?.full_name ?? null,
            email: data.profile?.email ?? "",
          });
        } else {
          const data = await accountRes.json().catch(() => ({}));
          setProfileError(data.error ?? "Could not load your account overview.");
        }
      } catch {
        setProfileError("Could not load your account overview.");
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
  };

  return (
    <div className="admin-settings-page">
      <SettingsAdminHeader search={search} onSearchChange={setSearch} />

      <AdminPageContent className="admin-settings-content">
        {profileError ? (
          <AdminAlert tone="warning" className="mb-6">
            {profileError}
          </AdminAlert>
        ) : null}
        {filtered.length === 0 ? (
          <AdminEmptyState
            title="No settings match your search"
            description="Try profile, appearance, or integrations."
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
                  Site content, team, billing, and analytics live in their own admin tabs — use the sidebar to open
                  Content, Users, Invoices, or Analytics directly.
                </p>
              </div>
            </div>

            <SettingsOverviewPanel profileName={profileName} profileEmail={profileEmail} />
          </div>
        )}
      </AdminPageContent>
    </div>
  );
}
