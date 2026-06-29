import { Cormorant_Garamond } from "next/font/google";
import { Suspense } from "react";
import { requireAuth } from "@/lib/auth";
import { AdminFooter } from "@/components/admin/AdminFooter";
import { PortalMobileNav } from "@/components/portal/PortalMobileNav";
import { PortalNotice } from "@/components/portal/PortalNotice";
import { PortalSidebar } from "@/components/portal/PortalSidebar";

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

  return (
    <div className={`portal-theme ${portalSerif.variable} flex h-screen overflow-hidden`}>
      <PortalSidebar profile={profile} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <PortalMobileNav />
        <Suspense fallback={null}>
          <PortalNotice />
        </Suspense>
        <main className="admin-main-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          {children}
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}
