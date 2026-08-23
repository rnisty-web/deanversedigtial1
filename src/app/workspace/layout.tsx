import { Cormorant_Garamond } from "next/font/google";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ensurePortalClient } from "@/lib/portal/provision-portal-client";
import { getDashboardThemeSafe } from "@/lib/settings/dashboard-theme-server";
import { requireWorkspaceSession } from "@/lib/workspace/session";
import { toNavItems } from "@/components/workspace/workspace-nav";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { AdminPageTransition } from "@/components/admin/AdminPageTransition";
import { AdminShell } from "@/components/admin/AdminShell";
import { PresenceHeartbeat } from "@/components/admin/PresenceHeartbeat";
import { CursorGlow } from "@/components/ui/CursorGlow";
import { WorkspaceMobileNav } from "@/components/workspace/WorkspaceMobileNav";
import { WorkspaceModuleGuard } from "@/components/workspace/WorkspaceModuleGuard";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import type { ProfileMenuLink } from "@/components/admin/AdminProfileCard";
import type { WorkspaceBadges } from "@/components/workspace/WorkspaceNav";

export const metadata: Metadata = {
  title: "DeanVerse Workspace",
  robots: { index: false, follow: false },
};

const workspaceSerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-admin-serif",
  display: "swap",
});

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const session = await requireWorkspaceSession();
  const dashboardTheme = await getDashboardThemeSafe();
  const supabase = await createClient();

  // Clients need a linked client record before any scoped query can resolve.
  if (session.scope === "own") {
    await ensurePortalClient({
      userId: session.profile.id,
      email: session.profile.email,
      fullName: session.profile.full_name,
      phone: session.profile.phone,
      company: session.profile.company,
    });
  }

  const { count: unreadMessagesCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("read", false)
    .eq("recipient_id", session.profile.id);

  const navItems = toNavItems(session.modules);
  const badges: WorkspaceBadges = { messages: unreadMessagesCount ?? 0 };

  const menuLinks: ProfileMenuLink[] = [
    { label: "My Account", href: "/workspace/account" },
    ...(session.can("settings", "view")
      ? [{ label: "Settings", href: "/workspace/settings" }]
      : []),
  ];

  return (
    <AdminShell>
      <div
        className={`admin-theme ${workspaceSerif.variable} flex h-dvh min-h-dvh overflow-hidden`}
        data-dashboard-theme={dashboardTheme}
      >
        <CursorGlow />
        <WorkspaceSidebar
          profile={session.profile}
          items={navItems}
          badges={badges}
          menuLinks={menuLinks}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {session.isStaff ? <PresenceHeartbeat /> : null}
          <WorkspaceMobileNav
            profile={session.profile}
            items={navItems}
            badges={badges}
            menuLinks={menuLinks}
          />
          <div className="workspace-mobile-shell flex min-h-0 flex-1 flex-col">
            <main className="admin-main-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
              <AdminPageTransition>
                <WorkspaceModuleGuard permissions={session.permissions}>
                  {children}
                </WorkspaceModuleGuard>
              </AdminPageTransition>
            </main>
            <AdminFooter />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
