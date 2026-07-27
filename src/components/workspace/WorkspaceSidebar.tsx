"use client";

import Link from "next/link";
import type { Profile } from "@/lib/auth";
import { AdminProfileCard, type ProfileMenuLink } from "@/components/admin/AdminProfileCard";
import { useAdminShell } from "@/components/admin/AdminShellProvider";
import { AdminSidebarBrand } from "@/components/admin/AdminSidebarBrand";
import { WorkspaceNav, type WorkspaceBadges } from "@/components/workspace/WorkspaceNav";
import type { WorkspaceNavItem } from "@/components/workspace/workspace-nav";
import { cn } from "@/lib/utils";

type WorkspaceSidebarProps = {
  profile: Profile;
  items: WorkspaceNavItem[];
  badges?: WorkspaceBadges;
  menuLinks: ProfileMenuLink[];
};

export function WorkspaceSidebar({ profile, items, badges, menuLinks }: WorkspaceSidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = useAdminShell();

  return (
    <aside
      className={cn(
        "admin-sidebar admin-sidebar--fit relative z-20 hidden h-dvh shrink-0 flex-col overflow-hidden transition-[width] duration-300 ease-out lg:sticky lg:top-0 lg:flex",
        sidebarCollapsed && "admin-sidebar-collapsed",
      )}
    >
      <div className="flex shrink-0 items-center justify-end px-2 pt-2">
        <button
          type="button"
          onClick={toggleSidebar}
          className="admin-btn-ghost hidden !min-h-0 !px-2 !py-1.5 lg:inline-flex"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            className={cn("h-4 w-4 transition-transform duration-300", sidebarCollapsed && "rotate-180")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      </div>

      <div className={cn("flex shrink-0 flex-col items-center px-3 pb-2 pt-0.5", sidebarCollapsed && "px-2")}>
        <AdminSidebarBrand compact={sidebarCollapsed} dense href="/workspace" />
      </div>

      <div className="admin-sidebar-nav-scroll min-h-0 flex-1 px-2.5">
        <WorkspaceNav items={items} badges={badges} collapsed={sidebarCollapsed} />
      </div>

      <div className="shrink-0 space-y-1.5 px-2.5 pb-3 pt-1.5">
        {!sidebarCollapsed ? (
          <Link href="/" className="admin-back-to-site">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            Back to Website
          </Link>
        ) : (
          <Link href="/" className="admin-back-to-site admin-back-to-site-compact" aria-label="Back to website">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        )}
        <AdminProfileCard profile={profile} compact={sidebarCollapsed} menuLinks={menuLinks} />
      </div>
    </aside>
  );
}
