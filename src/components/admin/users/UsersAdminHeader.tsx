"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { UserFilterTab } from "@/lib/users/utils";

type UsersAdminHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
  tab: UserFilterTab;
  onTabChange: (tab: UserFilterTab) => void;
  counts: { all: number; staff: number; clients: number; online: number };
  onInviteUser?: () => void;
  canManage?: boolean;
};

export function UsersAdminHeader({
  search,
  onSearchChange,
  tab,
  onTabChange,
  counts,
  onInviteUser,
  canManage,
}: UsersAdminHeaderProps) {
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

  const tabs: { id: UserFilterTab; label: string; count: number }[] = [
    { id: "all", label: "All", count: counts.all },
    { id: "staff", label: "Staff", count: counts.staff },
    { id: "clients", label: "Clients", count: counts.clients },
    { id: "online", label: "Live", count: counts.online },
  ];

  return (
    <header className="admin-content-header sticky top-0 z-20 shrink-0 border-b border-[var(--admin-border-subtle)] bg-[color-mix(in_srgb,var(--admin-bg)_90%,transparent)] px-6 backdrop-blur-xl lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-start gap-3 pt-0.5">
            <h1 className="admin-heading-serif admin-content-title text-2xl text-[var(--admin-text)] md:text-3xl">
              Users <span aria-hidden>👥</span>
            </h1>
            <Link href="/admin/settings" className="admin-btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs">
              Workspace Settings
            </Link>
          </div>
          <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
            Manage accounts, roles, permissions, and live team presence.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto lg:min-w-[520px]">
          <div className="relative min-w-0 flex-1">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              ref={searchRef}
              data-admin-search
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search users…"
              className="admin-input admin-input-with-icon w-full py-2.5 pr-16"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] px-1.5 py-0.5 text-[10px] text-[var(--admin-text-muted)] sm:inline">
              ⌘ K
            </kbd>
          </div>
          {canManage && onInviteUser ? (
            <button type="button" onClick={onInviteUser} className="admin-btn-gold whitespace-nowrap px-4 py-2 text-sm">
              + Invite User
            </button>
          ) : null}
        </div>
      </div>

      <div className="admin-users-tabs mt-4">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={cn("admin-users-tab", tab === item.id && "admin-users-tab-active")}
          >
            {item.label}
            <span className="admin-users-tab-badge">{item.count}</span>
          </button>
        ))}
      </div>
    </header>
  );
}

export function UsersStatCard({
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
    <div className="admin-users-stat-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">{label}</p>
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
