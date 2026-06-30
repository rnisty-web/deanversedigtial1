import { NextResponse } from "next/server";
import { verifyUserManagementApi } from "@/lib/auth";
import {
  DASHBOARD_THEMES,
  parseDashboardTheme,
  type DashboardThemeId,
} from "@/lib/settings/dashboard-theme";
import {
  fetchDashboardTheme,
  revalidateDashboardTheme,
  saveDashboardTheme,
} from "@/lib/settings/dashboard-theme-server";

export async function GET() {
  const auth = await verifyUserManagementApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const theme = await fetchDashboardTheme(auth.supabase!);
  return NextResponse.json({ theme, themes: DASHBOARD_THEMES });
}

export async function PATCH(request: Request) {
  const auth = await verifyUserManagementApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const theme = parseDashboardTheme(body.theme);

  if (!DASHBOARD_THEMES.some((item) => item.id === theme)) {
    return NextResponse.json({ error: "Invalid dashboard theme" }, { status: 400 });
  }

  const result = await saveDashboardTheme(auth.supabase!, theme as DashboardThemeId);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  revalidateDashboardTheme();
  return NextResponse.json({ theme, themes: DASHBOARD_THEMES });
}
