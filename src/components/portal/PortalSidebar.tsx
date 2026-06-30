import Link from "next/link";
import type { Profile } from "@/lib/auth";
import { siteConfig } from "@/lib/constants";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { PortalNav } from "@/components/portal/PortalNav";
import { PortalProfileCard } from "@/components/portal/PortalProfileCard";
import { PortalSwitcher } from "@/components/shared/PortalSwitcher";

type PortalSidebarProps = {
  profile: Profile;
  canAccessAdmin: boolean;
};

export function PortalSidebar({ profile, canAccessAdmin }: PortalSidebarProps) {
  return (
    <aside className="admin-sidebar relative z-20 hidden h-screen shrink-0 flex-col lg:sticky lg:top-0 lg:flex">
      <div className="flex flex-col items-center px-4 pb-4 pt-6">
        <Link href="/portal" className="admin-sidebar-brand block transition-opacity hover:opacity-90">
          <BrandLogo width={200} height={260} className="mx-auto h-16 w-auto max-w-[180px]" />
          <p className="mt-3 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--admin-gold)]">
            Client Portal
          </p>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
        <PortalNav />
      </div>

      <div className="shrink-0 space-y-2 px-3 pb-4 pt-2">
        {canAccessAdmin ? <PortalSwitcher canAccessAdmin /> : null}
        <Link href="/" className="admin-back-to-site">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
          Back to Website
        </Link>
        <p className="px-1 text-[10px] leading-relaxed text-[var(--admin-text-muted)]">
          Questions? Use Messages or email{" "}
          <span className="text-[var(--admin-gold-light)]">{siteConfig.email}</span>
        </p>
        <PortalProfileCard profile={profile} canAccessAdmin={canAccessAdmin} />
      </div>
    </aside>
  );
}
