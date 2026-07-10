"use client";

import { useEffect, useRef } from "react";
import { AdminPortalHeader } from "@/components/admin/AdminPortalHeader";
import { AdminShortcutHint } from "@/components/admin/AdminShortcutHint";
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

  const tabs: { id: UserFilterTab; label: string; count?: number }[] = [
    { id: "all", label: "All", count: counts.all },
    { id: "staff", label: "Staff", count: counts.staff },
    { id: "clients", label: "Portal accounts", count: counts.clients },
    { id: "online", label: "Live", count: counts.online },
    ...(canManage ? [{ id: "roles" as const, label: "Roles" }] : []),
  ];

  return (
    <AdminPortalHeader>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <h1 className="admin-heading-serif admin-content-title text-2xl text-[var(--admin-text)] md:text-3xl">
            Users <span className="admin-section-emoji" aria-hidden>👥</span>
          </h1>
          <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
            Manage login accounts, roles, permissions, and live team presence.
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
            <AdminShortcutHint />
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
            {typeof item.count === "number" ? (
              <span className="admin-users-tab-badge">{item.count}</span>
            ) : null}
          </button>
        ))}
      </div>
    </AdminPortalHeader>
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
    <div className="admin-portal-stat-card admin-users-stat-card">
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
