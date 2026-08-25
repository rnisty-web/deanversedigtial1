"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { Profile } from "@/lib/auth";
import type { RoleDefinition } from "@/lib/roles/catalog";
import { canAccessAdminHref } from "@/lib/roles/permissions";
import {
  adminNavGroups,
  adminNavItems,
  type AdminNavItem,
} from "@/components/admin/admin-nav-config";
import { AdminProfileCard } from "@/components/admin/AdminProfileCard";
import { PortalSwitcher } from "@/components/shared/PortalSwitcher";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { cn } from "@/lib/utils";

type AdminMobileNavProps = {
  profile: Profile;
  roleCatalog: RoleDefinition[];
  isFounder: boolean;
  unreadMessagesCount?: number;
};

const TAB_HREFS = ["/admin", "/admin/leads", "/admin/projects", "/admin/messages"] as const;

function isNavActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

function getActiveItem(pathname: string, items: AdminNavItem[]) {
  const matches = items.filter((item) => isNavActive(pathname, item.href));
  return matches.sort((a, b) => b.href.length - a.href.length)[0] ?? null;
}

export function AdminMobileNav({
  profile,
  roleCatalog,
  isFounder,
  unreadMessagesCount = 0,
}: AdminMobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const visibleItems = useMemo(
    () =>
      adminNavItems.filter((item) =>
        canAccessAdminHref(profile, item.href, roleCatalog, { isFounder }),
      ),
    [profile, roleCatalog, isFounder],
  );

  const visibleGroups = useMemo(
    () =>
      adminNavGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) =>
            canAccessAdminHref(profile, item.href, roleCatalog, { isFounder }),
          ),
        }))
        .filter((group) => group.items.length > 0),
    [profile, roleCatalog, isFounder],
  );

  const tabItems = useMemo(() => {
    const picked: AdminNavItem[] = [];
    for (const href of TAB_HREFS) {
      const item = visibleItems.find((entry) => entry.href === href);
      if (item) picked.push(item);
    }
    if (picked.length < 4) {
      for (const item of visibleItems) {
        if (picked.some((entry) => entry.href === item.href)) continue;
        picked.push(item);
        if (picked.length >= 4) break;
      }
    }
    return picked.slice(0, 4);
  }, [visibleItems]);

  const activeItem = getActiveItem(pathname, visibleItems);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <header className="admin-mobile-topbar workspace-mobile-topbar fixed inset-x-0 top-0 z-40 flex shrink-0 items-center justify-between gap-2 border-b border-[var(--admin-border-subtle)] bg-[color-mix(in_srgb,var(--admin-bg)_94%,transparent)] px-3 py-2.5 backdrop-blur-xl lg:hidden">
        <Link href="/admin" className="flex min-w-0 flex-1 items-center gap-2">
          <div className="admin-logo-ring !h-9 !w-9 !p-1">
            <BrandLogo width={80} height={80} className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--admin-gold)]">
              DeanVerse
            </p>
            <p className="truncate text-sm font-medium text-[var(--admin-text)]">
              {activeItem?.label ?? "Dashboard"}
            </p>
          </div>
        </Link>

        <button
          type="button"
          className={cn(
            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--admin-border-subtle)] bg-white/[0.04] text-[var(--admin-gold-light)] transition-colors",
            open && "border-[var(--admin-gold)]/35 bg-[var(--admin-gold-soft)]",
          )}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((prev) => !prev)}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            {open ? (
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </header>

      <nav
        className="admin-mobile-bottomnav workspace-mobile-bottomnav fixed inset-x-0 bottom-0 z-40 border-t border-[var(--admin-border-subtle)] bg-[color-mix(in_srgb,var(--admin-bg)_94%,transparent)] px-1 py-1 backdrop-blur-xl lg:hidden"
        aria-label="Quick navigation"
      >
        <div className="workspace-mobile-tabs-inner">
          {tabItems.map((item) => {
            const isActive = isNavActive(pathname, item.href);
            const showBadge = item.href === "/admin/messages" && unreadMessagesCount > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("workspace-mobile-tab", isActive && "workspace-mobile-tab-active")}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="workspace-mobile-tab-icon" aria-hidden>
                  {item.icon}
                </span>
                <span className="workspace-mobile-tab-label">{item.label}</span>
                {showBadge ? (
                  <span className="workspace-mobile-tab-badge" aria-label={`${unreadMessagesCount} unread`}>
                    {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                  </span>
                ) : null}
              </Link>
            );
          })}

          <button
            type="button"
            className={cn("workspace-mobile-tab", open && "workspace-mobile-tab-active")}
            aria-expanded={open}
            aria-label="All sections"
            onClick={() => setOpen((prev) => !prev)}
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
          "admin-mobile-menu workspace-mobile-menu fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            "workspace-mobile-menu-panel absolute inset-x-0 bottom-0 flex max-h-[min(88dvh,calc(100dvh-var(--workspace-mobile-topbar-height)-var(--workspace-mobile-bottomnav-height)))] flex-col rounded-t-[1.35rem] border border-[var(--admin-border-subtle)] bg-[var(--admin-bg-secondary)] shadow-2xl transition-transform duration-300 ease-out",
            open ? "translate-y-0" : "translate-y-full",
          )}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--admin-border-subtle)] px-4 py-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-gold)]">
                Navigation
              </p>
              <p className="text-sm text-[var(--admin-text-muted)]">All founder dashboard sections</p>
            </div>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--admin-border-subtle)] bg-white/[0.04] text-[var(--admin-gold-light)]"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="workspace-mobile-menu-grid min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
            {visibleGroups.map((group) => (
              <div key={group.label || "dashboard"} className="contents">
                {group.label ? (
                  <p className="col-span-full px-1 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--admin-text-muted)] first:pt-0">
                    {group.label}
                  </p>
                ) : null}
                {group.items.map((item) => {
                  const isActive = isNavActive(pathname, item.href);
                  const showBadge = item.href === "/admin/messages" && unreadMessagesCount > 0;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn("workspace-mobile-menu-item", isActive && "workspace-mobile-menu-item-active")}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className="workspace-mobile-menu-icon" aria-hidden>
                        {item.icon}
                      </span>
                      <span className="workspace-mobile-menu-label">{item.label}</span>
                      {showBadge ? (
                        <span className="admin-nav-badge">{unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}</span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="workspace-mobile-menu-footer shrink-0 space-y-2 border-t border-[var(--admin-border-subtle)] px-3 py-3">
            <Link href="/" className="admin-back-to-site" onClick={() => setOpen(false)}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
              Back to Website
            </Link>
            <PortalSwitcher />
            <AdminProfileCard profile={profile} compact />
          </div>
        </div>
      </div>
    </>
  );
}
