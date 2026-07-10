"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type PortalDashboardHeroProps = {
  viewerName: string;
  unreadMessagesCount: number;
  className?: string;
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function PortalDashboardHero({
  viewerName,
  unreadMessagesCount,
  className,
}: PortalDashboardHeroProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header
      className={cn(
        "admin-content-header admin-portal-header admin-dashboard-hero sticky top-0 z-20 shrink-0 px-4 backdrop-blur-xl sm:px-6 lg:px-8",
        className,
      )}
    >
      <div className="admin-dashboard-hero-glow" aria-hidden />
      <div className="relative mx-auto max-w-[1680px]">
        <div className="flex flex-col gap-6 py-1">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <p className="admin-dashboard-hero-eyebrow">Client portal</p>
              <h1 className="admin-dashboard-hero-title admin-heading-serif">
                {getGreeting()},{" "}
                <span className="admin-dashboard-hero-name">{viewerName}</span>
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--admin-text-muted)]">
                Your projects, messages, invoices, and account — everything for your work in one place.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="admin-dashboard-date-pill" aria-label="Current date">
                <svg
                  className="h-4 w-4 shrink-0 text-[var(--admin-gold)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
                <span>{today}</span>
              </div>

              <Link
                href="/portal/messages"
                className={cn(
                  "admin-dashboard-icon-btn relative",
                  unreadMessagesCount > 0 && "admin-dashboard-icon-btn--active",
                )}
                aria-label={
                  unreadMessagesCount > 0 ? `${unreadMessagesCount} unread messages` : "Messages"
                }
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                  />
                </svg>
                {unreadMessagesCount > 0 ? (
                  <span className="admin-dashboard-notify-badge">
                    {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
                  </span>
                ) : null}
              </Link>

              <Link href="/portal/account" className="admin-dashboard-icon-btn" aria-label="Account">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
