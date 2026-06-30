import { AppearanceSettingsClient } from "@/components/admin/settings/AppearanceSettingsClient";
import { getDashboardThemeSafe } from "@/lib/settings/dashboard-theme-server";

export default async function AdminSettingsAppearancePage() {
  const theme = await getDashboardThemeSafe();
  return <AppearanceSettingsClient initialTheme={theme} />;
}
