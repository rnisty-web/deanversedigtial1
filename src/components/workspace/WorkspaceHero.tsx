"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminSearchField } from "@/components/admin/AdminPageHeader";
import type { WorkspaceNavItem } from "@/components/workspace/workspace-nav";
import { cn } from "@/lib/utils";

type WorkspaceHeroProps = {
  viewerName: string;
  unreadMessagesCount: number;
  /** The user's visible modules — powers quick jump and hides links they lack. */
  navItems: WorkspaceNavItem[];
  subtitle: string;
  className?: string;
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function WorkspaceHero({
  viewerName,
  unreadMessagesCount,
  navItems,
  subtitle,
  className,
}: WorkspaceHeroProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const messagesItem = navItems.find((item) => item.id === "messages");
  const settingsItem = navItems.find((item) => item.id === "settings");

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = search.trim().toLowerCase();
    if (!query) return;

    const match = navItems.find(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        item.href.toLowerCase().includes(query.replace(/\s+/g, "")),
    );

    if (match) {
      router.push(match.href);
      setSearch("");
    }
  }

  return (
    <header
      className={cn(
        "admin-content-header admin-dashboard-hero sticky top-0 z-20 shrink-0 px-4 backdrop-blur-xl sm:px-6 lg:px-8",
        className,
      )}
    >
      <div className="admin-dashboard-hero-glow" aria-hidden />
      <div className="admin-dashboard-hero-mesh" aria-hidden />
      <div className="relative mx-auto max-w-[1680px]">
        <div className="flex flex-col gap-7 py-3 sm:py-4">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <p className="admin-dashboard-hero-eyebrow">DeanVerse Workspace</p>
              <h1 className="admin-dashboard-hero-title admin-heading-serif">
                {getGreeting()}, <span className="admin-dashboard-hero-name">{viewerName}</span>
              </h1>
              <p className="admin-dashboard-hero-subtitle">{subtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <div className="admin-dashboard-date-pill" aria-label="Current date">
                <svg className="h-4 w-4 shrink-0 text-[var(--admin-emerald)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <span>{today}</span>
              </div>

              {messagesItem ? (
                <Link
                  href={messagesItem.href}
                  className={cn(
                    "admin-dashboard-icon-btn relative",
                    unreadMessagesCount > 0 && "admin-dashboard-icon-btn--active",
                  )}
                  aria-label={
                    unreadMessagesCount > 0 ? `${unreadMessagesCount} unread messages` : "Messages"
                  }
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  {unreadMessagesCount > 0 ? (
                    <span className="admin-dashboard-notify-badge">
                      {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                    </span>
                  ) : null}
                </Link>
              ) : null}

              {settingsItem ? (
                <Link href={settingsItem.href} className="admin-dashboard-icon-btn" aria-label="Settings">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
              ) : null}
            </div>
          </div>

          {navItems.length > 2 ? (
            <form onSubmit={handleSearchSubmit} className="admin-dashboard-hero-search max-w-xl">
              <AdminSearchField
                value={search}
                onChange={setSearch}
                placeholder="Quick jump to any section…"
              />
            </form>
          ) : null}
        </div>
      </div>
    </header>
  );
}
