"use client";

import Link from "next/link";
import type { Profile } from "@/lib/auth";
import { AdminNavGroups } from "@/components/admin/AdminNavGroups";
import { AdminProfileCard } from "@/components/admin/AdminProfileCard";
import { useAdminShell } from "@/components/admin/AdminShellProvider";
import { AdminSidebarBrand } from "@/components/admin/AdminSidebarBrand";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  profile: Profile;
  unreadMessagesCount?: number;
};

export function AdminSidebar({ profile, unreadMessagesCount = 0 }: AdminSidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = useAdminShell();

  return (
    <aside
      className={cn(
        "admin-sidebar relative z-20 hidden h-screen shrink-0 flex-col transition-[width] duration-300 ease-out lg:sticky lg:top-0 lg:flex",
        sidebarCollapsed && "admin-sidebar-collapsed",
      )}
    >
      <div className="flex items-center justify-end px-3 pt-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="admin-btn-ghost hidden !min-h-0 !px-2 !py-2 lg:inline-flex"
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

      <div className={cn("flex flex-col items-center px-4 pb-4 pt-2", sidebarCollapsed && "px-2")}>
        <AdminSidebarBrand compact={sidebarCollapsed} />
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
        <AdminNavGroups unreadMessagesCount={unreadMessagesCount} collapsed={sidebarCollapsed} />
      </div>

      <div className="shrink-0 space-y-2 px-3 pb-4 pt-2">
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
        <AdminProfileCard profile={profile} compact={sidebarCollapsed} />
      </div>
    </aside>
  );
}
