import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DASHBOARD_THEME_SETTINGS_KEY,
  DEFAULT_DASHBOARD_THEME,
  parseDashboardTheme,
  type DashboardThemeId,
} from "@/lib/settings/dashboard-theme";

export async function fetchDashboardTheme(
  supabase: SupabaseClient,
): Promise<DashboardThemeId> {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", DASHBOARD_THEME_SETTINGS_KEY)
    .maybeSingle();

  if (error || data?.value === undefined || data?.value === null) {
    return DEFAULT_DASHBOARD_THEME;
  }

  return parseDashboardTheme(data.value);
}

export async function saveDashboardTheme(
  supabase: SupabaseClient,
  theme: DashboardThemeId,
): Promise<{ error?: string }> {
  const { error } = await supabase.from("settings").upsert(
    {
      key: DASHBOARD_THEME_SETTINGS_KEY,
      value: theme,
    },
    { onConflict: "key" },
  );

  if (error) return { error: error.message };
  return {};
}

async function fetchDashboardThemeFromDb() {
  const admin = await createAdminClient();
  return fetchDashboardTheme(admin);
}

export const getCachedDashboardTheme = unstable_cache(
  fetchDashboardThemeFromDb,
  ["dashboard-theme"],
  { tags: ["dashboard-theme"] },
);

export function revalidateDashboardTheme() {
  revalidateTag("dashboard-theme", { expire: 0 });
}
