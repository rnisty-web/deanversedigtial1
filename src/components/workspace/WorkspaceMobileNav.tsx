"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Profile } from "@/lib/auth";
import { AdminProfileCard, type ProfileMenuLink } from "@/components/admin/AdminProfileCard";
import type { WorkspaceBadges } from "@/components/workspace/WorkspaceNav";
import type { WorkspaceNavItem } from "@/components/workspace/workspace-nav";
import { workspaceNavIcons } from "@/components/workspace/workspace-nav-icons";
import { getMobileTabItems } from "@/lib/workspace/mobile-nav-priority";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { cn } from "@/lib/utils";

type WorkspaceMobileNavProps = {
  profile: Profile;
  items: WorkspaceNavItem[];
  badges?: WorkspaceBadges;
  menuLinks: ProfileMenuLink[];
};

function isNavActive(pathname: string, href: string) {
  return href === "/workspace" ? pathname === "/workspace" : pathname.startsWith(href);
}

export function WorkspaceMobileNav({
  profile,
  items,
  badges,
  menuLinks,
}: WorkspaceMobileNavProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const tabItems = getMobileTabItems(items);
  const activeItem = items.find((item) => isNavActive(pathname, item.href));

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <div className="workspace-mobile-topbar admin-mobile-topbar relative z-20 flex shrink-0 items-center justify-between gap-2 border-b border-[var(--admin-border-subtle)] bg-[color-mix(in_srgb,var(--admin-bg)_92%,transparent)] px-3 py-2.5 backdrop-blur-xl lg:hidden">
        <Link href="/workspace" className="flex min-w-0 flex-1 items-center gap-2">
          <div className="admin-logo-ring !h-9 !w-9 !p-1">
            <BrandLogo width={80} height={80} className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[8px] font-semibold uppercase tracking-[0.18em] text-[var(--admin-gold)]">
              DeanVerse
            </p>
            <p className="truncate text-sm font-medium text-[var(--admin-text)]">
              {activeItem?.label ?? "Workspace"}
            </p>
          </div>
        </Link>

        <button
          type="button"
          className={cn(
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--admin-border-subtle)] bg-white/[0.04] text-[var(--admin-gold-light)] transition-colors",
            menuOpen && "border-[var(--admin-gold)]/35 bg-[var(--admin-gold-soft)]",
          )}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            {menuOpen ? (
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <>
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </>
            )}
          </svg>
        </button>
      </div>

      <nav
        className="workspace-mobile-tabs relative z-20 shrink-0 border-b border-[var(--admin-border-subtle)] bg-[color-mix(in_srgb,var(--admin-bg)_88%,transparent)] px-1 py-1.5 backdrop-blur-xl lg:hidden"
        aria-label="Quick navigation"
      >
        <div className="workspace-mobile-tabs-inner">
          {tabItems.map((item) => {
            const isActive = isNavActive(pathname, item.href);
            const count = badges?.[item.id] ?? 0;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn("workspace-mobile-tab", isActive && "workspace-mobile-tab-active")}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="workspace-mobile-tab-icon" aria-hidden>
                  {workspaceNavIcons[item.id]}
                </span>
                <span className="workspace-mobile-tab-label">{item.label}</span>
                {count > 0 ? (
                  <span className="workspace-mobile-tab-badge" aria-label={`${count} unread`}>
                    {count > 99 ? "99+" : count}
                  </span>
                ) : null}
              </Link>
            );
          })}

          <button
            type="button"
            className={cn("workspace-mobile-tab", menuOpen && "workspace-mobile-tab-active")}
            aria-expanded={menuOpen}
            aria-label="All sections"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <span className="workspace-mobile-tab-icon" aria-hidden>
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </span>
            <span className="workspace-mobile-tab-label">All</span>
          </button>
        </div>
      </nav>

      <div
        className={cn(
          "workspace-mobile-menu fixed inset-0 z-50 lg:hidden",
          menuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300",
            menuOpen ? "opacity-100" : "opacity-0",
          )}
          aria-label="Close navigation menu"
          onClick={() => setMenuOpen(false)}
        />
        <div
          className={cn(
            "workspace-mobile-menu-panel absolute inset-x-0 bottom-0 flex max-h-[min(88dvh,calc(100dvh-4.5rem))] flex-col rounded-t-[1.35rem] border border-[var(--admin-border-subtle)] bg-[var(--admin-bg-secondary)] shadow-2xl transition-transform duration-300 ease-out",
            menuOpen ? "translate-y-0" : "translate-y-full",
          )}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--admin-border-subtle)] px-4 py-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-gold)]">
                Navigation
              </p>
              <p className="text-sm text-[var(--admin-text-muted)]">All workspace sections</p>
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--admin-border-subtle)] bg-white/[0.04] text-[var(--admin-gold-light)]"
              aria-label="Close navigation menu"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="workspace-mobile-menu-grid min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
            {items.map((item) => {
              const isActive = isNavActive(pathname, item.href);
              const count = badges?.[item.id] ?? 0;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn("workspace-mobile-menu-item", isActive && "workspace-mobile-menu-item-active")}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="workspace-mobile-menu-icon" aria-hidden>
                    {workspaceNavIcons[item.id]}
                  </span>
                  <span className="workspace-mobile-menu-label">{item.label}</span>
                  {count > 0 ? (
                    <span className="admin-nav-badge ml-auto">{count > 99 ? "99+" : count}</span>
                  ) : null}
                </Link>
              );
            })}
          </div>

          <div className="workspace-mobile-menu-footer shrink-0 space-y-2 border-t border-[var(--admin-border-subtle)] px-3 py-3">
            <Link href="/" className="admin-back-to-site" onClick={() => setMenuOpen(false)}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
              Back to Website
            </Link>
            <AdminProfileCard profile={profile} compact menuLinks={menuLinks} />
          </div>
        </div>
      </div>
    </>
  );
}
