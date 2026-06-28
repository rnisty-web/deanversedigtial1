"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { AdminSearchBar } from "@/components/admin/AdminHeader";
import { cn } from "@/lib/utils";

type AdminDashboardHeroProps = {
  viewerName: string;
  unreadMessagesCount: number;
  className?: string;
};

export function AdminDashboardHero({
  viewerName,
  unreadMessagesCount,
  className,
}: AdminDashboardHeroProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-10 shrink-0 border-b border-[var(--admin-border-subtle)] bg-[var(--admin-bg)]/85 px-4 py-5 backdrop-blur-xl sm:px-6 lg:px-8",
        className,
      )}
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="admin-heading-serif text-2xl text-[var(--admin-gold-light)] sm:text-3xl lg:text-[2rem]">
              Welcome back, {viewerName}{" "}
              <span className="inline-block" aria-hidden>
                ✨
              </span>
            </h1>
            <p className="mt-1.5 text-sm text-[var(--admin-text-muted)]">
              Your studio at a glance — leads, projects, and revenue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div
              className="admin-luxury-card flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[var(--admin-text-muted)]"
              aria-label="Current date"
            >
              <svg
                className="h-4 w-4 shrink-0 text-[var(--admin-gold)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
              <span className="hidden sm:inline">{today}</span>
              <span className="sm:hidden">
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>

            <Link
              href="/admin/messages"
              className="admin-luxury-card relative flex h-10 w-10 items-center justify-center rounded-xl text-[var(--admin-text-muted)] transition-colors hover:text-[var(--admin-gold-light)]"
              aria-label={
                unreadMessagesCount > 0
                  ? `${unreadMessagesCount} unread messages`
                  : "Messages"
              }
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                />
              </svg>
              {unreadMessagesCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-white">
                  {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                </span>
              )}
            </Link>

            <Link
              href="/admin/settings"
              className="admin-luxury-card flex h-10 w-10 items-center justify-center rounded-xl text-[var(--admin-text-muted)] transition-colors hover:text-[var(--admin-gold-light)]"
              aria-label="Settings"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="w-full">
          <AdminSearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search anything..."
            className="max-w-none sm:max-w-none xl:max-w-none"
          />
        </form>
      </div>
    </header>
  );
}
