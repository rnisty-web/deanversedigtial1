import Link from "next/link";
import { Suspense } from "react";
import { requireAuth } from "@/lib/auth";
import { siteConfig } from "@/lib/constants";
import { PortalNav } from "@/components/portal/PortalNav";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalMobileNav } from "@/components/portal/PortalMobileNav";
import { PortalNotice } from "@/components/portal/PortalNotice";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { LiquidBackground } from "@/components/layout/LiquidBackground";

export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAuth();

  return (
    <div className="relative flex min-h-screen bg-[var(--background)]">
      <LiquidBackground />
      <aside className="liquid-glass-strong relative z-10 hidden w-64 shrink-0 flex-col border-r border-white/10 lg:flex">
        <div className="border-b border-white/10 px-4 py-5">
          <Link href="/portal" className="block transition-opacity hover:opacity-90">
            <BrandLogo
              width={200}
              height={260}
              className="mx-auto h-20 w-auto max-w-[210px]"
            />
            <p className="mt-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Client Portal
            </p>
          </Link>
        </div>
        <PortalNav />
        <div className="mt-auto border-t border-white/10 p-4">
          <p className="text-[11px] leading-relaxed text-white/35">
            Questions about your project? Use Messages or contact{" "}
            <span className="text-[var(--accent)]">{siteConfig.email}</span>
          </p>
        </div>
      </aside>
      <main className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        <PortalHeader profile={profile} />
        <PortalMobileNav />
        <Suspense fallback={null}>
          <PortalNotice />
        </Suspense>
        <div className="flex-1 overflow-y-auto overscroll-y-contain pb-[env(safe-area-inset-bottom)]">
          {children}
        </div>
      </main>
    </div>
  );
}
