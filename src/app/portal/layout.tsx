import { Cormorant_Garamond } from "next/font/google";
import { Suspense } from "react";
import { requireAuth } from "@/lib/auth";
import { isStaffRole } from "@/lib/roles";
import { getRoleCatalogSafe } from "@/lib/roles/catalog-server";
import { ensurePortalClient } from "@/lib/portal/provision-portal-client";
import { getDashboardThemeSafe } from "@/lib/settings/dashboard-theme-server";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { PortalMobileNav } from "@/components/portal/PortalMobileNav";
import { PortalNotice } from "@/components/portal/PortalNotice";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const portalSerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-admin-serif",
  display: "swap",
});

export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAuth();
  const roleCatalog = await getRoleCatalogSafe();
  const dashboardTheme = await getDashboardThemeSafe();
  const canAccessAdmin = isStaffRole(profile, roleCatalog);

  if (!canAccessAdmin) {
    await ensurePortalClient({
      userId: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      phone: profile.phone,
      company: profile.company,
    });
  }

  return (
    <div
      className={`portal-theme ${portalSerif.variable} flex h-dvh min-h-dvh overflow-hidden`}
      data-dashboard-theme={dashboardTheme}
    >
      <PortalSidebar profile={profile} canAccessAdmin={canAccessAdmin} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <PortalMobileNav profile={profile} canAccessAdmin={canAccessAdmin} />
        <Suspense fallback={null}>
          <PortalNotice />
        </Suspense>
        <main className="admin-main-scroll flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain">
          {children}
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}
