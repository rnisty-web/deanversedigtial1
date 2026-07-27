"use client";

import { AdminPageContent } from "@/components/admin/AdminPageContent";
import { DashboardThemePicker } from "@/components/admin/settings/DashboardThemePicker";
import { SettingsAdminHeader } from "@/components/admin/settings/SettingsAdminHeader";
import type { DashboardThemeId } from "@/lib/settings/dashboard-theme";

export function AppearanceSettingsClient({ initialTheme }: { initialTheme: DashboardThemeId }) {
  return (
    <div className="admin-settings-page">
      <SettingsAdminHeader
        search=""
        onSearchChange={() => undefined}
        title="Appearance"
        subtitle="Customize workspace colors for every role."
        actionHref="/workspace/settings"
        actionLabel="All settings"
        hideSearch
        breadcrumb={[
          { label: "Settings", href: "/workspace/settings" },
          { label: "Appearance" },
        ]}
      />

      <AdminPageContent className="admin-settings-content">
        <DashboardThemePicker initialTheme={initialTheme} />
      </AdminPageContent>
    </div>
  );
}
