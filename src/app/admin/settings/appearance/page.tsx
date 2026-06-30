import { AppearanceSettingsClient } from "@/components/admin/settings/AppearanceSettingsClient";
import { getCachedDashboardTheme } from "@/lib/settings/dashboard-theme-server";

export default async function AdminSettingsAppearancePage() {
  const theme = await getCachedDashboardTheme();
  return <AppearanceSettingsClient initialTheme={theme} />;
}
