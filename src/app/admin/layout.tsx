import { Cormorant_Garamond } from "next/font/google";
import { requireAdmin, isFounder } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getRoleCatalogSafe } from "@/lib/roles/catalog-server";
import { AdminPermissionGuard } from "@/components/admin/AdminPermissionGuard";
import { getActiveRoleCatalog } from "@/lib/roles/catalog";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { AdminPageTransition } from "@/components/admin/AdminPageTransition";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { PresenceHeartbeat } from "@/components/admin/PresenceHeartbeat";
import { CursorGlow } from "@/components/ui/CursorGlow";
import { getDashboardThemeSafe } from "@/lib/settings/dashboard-theme-server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const adminSerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-admin-serif",
  display: "swap",
});

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAdmin();
  const roleCatalog = getActiveRoleCatalog(await getRoleCatalogSafe());
  const viewerIsFounder = isFounder(profile, profile.email);
  const supabase = await createClient();
  const dashboardTheme = await getDashboardThemeSafe();
  const { count: unreadMessagesCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("read", false)
    .eq("recipient_id", profile.id);

  return (
    <AdminShell>
      <div
        className={`admin-theme ${adminSerif.variable} flex h-dvh min-h-dvh overflow-hidden`}
        data-dashboard-theme={dashboardTheme}
      >
        <CursorGlow />
        <AdminSidebar
          profile={profile}
          roleCatalog={roleCatalog}
          isFounder={viewerIsFounder}
          unreadMessagesCount={unreadMessagesCount ?? 0}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <PresenceHeartbeat />
          <AdminMobileNav
            profile={profile}
            roleCatalog={roleCatalog}
            isFounder={viewerIsFounder}
            unreadMessagesCount={unreadMessagesCount ?? 0}
          />
          <div className="flex min-h-0 flex-1 flex-col">
            <main className="admin-main-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
              <AdminPageTransition>
                <AdminPermissionGuard
                  profile={profile}
                  roleCatalog={roleCatalog}
                  isFounder={viewerIsFounder}
                >
                  {children}
                </AdminPermissionGuard>
              </AdminPageTransition>
            </main>
            <AdminFooter />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
