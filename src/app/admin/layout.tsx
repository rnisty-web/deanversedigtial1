import { Cormorant_Garamond } from "next/font/google";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { AdminPageTransition } from "@/components/admin/AdminPageTransition";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { PresenceHeartbeat } from "@/components/admin/PresenceHeartbeat";
import { getDashboardThemeSafe } from "@/lib/settings/dashboard-theme-server";

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
  const supabase = await createClient();
  const dashboardTheme = await getDashboardThemeSafe();
  const { count: unreadMessagesCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("read", false);

  return (
    <AdminShell>
      <div
        className={`admin-theme ${adminSerif.variable} flex h-screen overflow-hidden`}
        data-dashboard-theme={dashboardTheme}
      >
        <AdminSidebar profile={profile} unreadMessagesCount={unreadMessagesCount ?? 0} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <PresenceHeartbeat />
          <AdminMobileNav profile={profile} unreadMessagesCount={unreadMessagesCount ?? 0} />
          <div className="flex min-h-0 flex-1 flex-col">
            <main className="admin-main-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
              <AdminPageTransition>{children}</AdminPageTransition>
            </main>
            <AdminFooter />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
