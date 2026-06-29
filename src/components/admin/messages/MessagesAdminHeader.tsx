"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type MessagesAdminHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onNewMessage: () => void;
};

export function MessagesAdminHeader({
  search,
  onSearchChange,
  onNewMessage,
}: MessagesAdminHeaderProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="admin-content-header sticky top-0 z-20 shrink-0 border-b border-[var(--admin-border-subtle)] bg-[color-mix(in_srgb,var(--admin-bg)_90%,transparent)] px-6 backdrop-blur-xl lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <h1 className="admin-heading-serif admin-content-title text-2xl text-[var(--admin-text)] md:text-3xl">
            Messages <span aria-hidden>💬</span>
          </h1>
          <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
            Client inbox — read inquiries, reply in thread, and keep every conversation in one place.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto lg:min-w-[480px]">
          <div className="relative min-w-0 flex-1">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              ref={searchRef}
              data-admin-search
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search conversations…"
              className="admin-input admin-input-with-icon w-full py-2.5 pr-16"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] px-1.5 py-0.5 text-[10px] text-[var(--admin-text-muted)] sm:inline">
              ⌘ K
            </kbd>
          </div>
          <button
            type="button"
            onClick={onNewMessage}
            className="admin-btn-gold whitespace-nowrap px-4 py-2 text-sm"
          >
            + New Message
          </button>
        </div>
      </div>
    </header>
  );
}

export function MessagesStatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="admin-messages-stat-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--admin-gold-light)]">{value}</p>
          {hint ? <p className="mt-1.5 text-xs text-[var(--admin-text-muted)]">{hint}</p> : null}
        </div>
        {icon ? (
          <div className="admin-stat-icon-glow !h-10 !w-10 [&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</div>
        ) : null}
      </div>
    </div>
  );
}

export function MessagesTabs({
  tab,
  onTabChange,
  unreadCount,
  starredCount,
}: {
  tab: "all" | "unread" | "starred";
  onTabChange: (tab: "all" | "unread" | "starred") => void;
  unreadCount: number;
  starredCount: number;
}) {
  const tabs = [
    { id: "all" as const, label: "All" },
    { id: "unread" as const, label: "Unread", count: unreadCount },
    { id: "starred" as const, label: "Starred", count: starredCount },
  ];

  return (
    <div className="admin-messages-tabs">
      {tabs.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onTabChange(item.id)}
          className={cn("admin-messages-tab", tab === item.id && "admin-messages-tab-active")}
        >
          {item.label}
          {item.count ? (
            <span className="admin-messages-tab-badge">{item.count}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
