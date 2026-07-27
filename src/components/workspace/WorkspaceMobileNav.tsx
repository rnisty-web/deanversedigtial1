"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Profile } from "@/lib/auth";
import { AdminProfileCard, type ProfileMenuLink } from "@/components/admin/AdminProfileCard";
import { AdminSidebarBrand } from "@/components/admin/AdminSidebarBrand";
import { WorkspaceNav, type WorkspaceBadges } from "@/components/workspace/WorkspaceNav";
import type { WorkspaceNavItem } from "@/components/workspace/workspace-nav";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { cn } from "@/lib/utils";

type WorkspaceMobileNavProps = {
  profile: Profile;
  items: WorkspaceNavItem[];
  badges?: WorkspaceBadges;
  menuLinks: ProfileMenuLink[];
};

export function WorkspaceMobileNav({
  profile,
  items,
  badges,
  menuLinks,
}: WorkspaceMobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="admin-mobile-topbar relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-[var(--admin-border-subtle)] bg-[color-mix(in_srgb,var(--admin-bg)_92%,transparent)] px-4 py-3 backdrop-blur-xl lg:hidden">
        <Link href="/workspace" className="flex min-w-0 items-center gap-2.5">
          <div className="admin-logo-ring !h-11 !w-11 !p-1.5">
            <BrandLogo width={80} height={80} className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--admin-gold)]">
              DeanVerse Digital
            </p>
            <p className="text-[8px] tracking-[0.12em] text-[var(--admin-gold)]/50">D + D</p>
          </div>
        </Link>
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--admin-border-subtle)] bg-white/[0.04] text-[var(--admin-gold-light)]"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((prev) => !prev)}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {open ? (
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      <div className={cn("fixed inset-0 z-40 lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")}>
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-black/85 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
        <aside
          className={cn(
            "admin-sidebar admin-sidebar--fit absolute left-0 top-0 flex h-dvh w-[min(100vw-2rem,18.5rem)] flex-col overflow-hidden shadow-2xl transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="shrink-0 px-3 pb-2 pt-4">
            <AdminSidebarBrand dense href="/workspace" />
          </div>
          <div className="admin-sidebar-nav-scroll min-h-0 flex-1 px-2.5">
            <WorkspaceNav items={items} badges={badges} onNavigate={() => setOpen(false)} />
          </div>
          <div className="shrink-0 space-y-1.5 px-2.5 pb-3 pt-1.5">
            <Link href="/" className="admin-back-to-site" onClick={() => setOpen(false)}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
              Back to Website
            </Link>
            <AdminProfileCard profile={profile} compact menuLinks={menuLinks} />
          </div>
        </aside>
      </div>
    </>
  );
}
