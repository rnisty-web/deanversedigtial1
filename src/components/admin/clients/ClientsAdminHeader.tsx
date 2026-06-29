"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { CLIENT_STATUSES, statusStyle } from "@/lib/clients/utils";

type ClientsAdminHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onAddClient: () => void;
  tab: string;
  onTabChange: (tab: string) => void;
  counts: { all: number; active: number; inactive: number; archived: number };
};

export function ClientsAdminHeader({
  search,
  onSearchChange,
  onAddClient,
  tab,
  onTabChange,
  counts,
}: ClientsAdminHeaderProps) {
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

  const tabs = [
    { id: "all", label: "All", count: counts.all },
    ...CLIENT_STATUSES.map((id) => ({
      id,
      label: statusStyle(id).label,
      count: counts[id],
    })),
  ];

  return (
    <header className="admin-content-header sticky top-0 z-20 shrink-0 border-b border-[var(--admin-border-subtle)] bg-[color-mix(in_srgb,var(--admin-bg)_90%,transparent)] px-6 backdrop-blur-xl lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-start gap-3 pt-0.5">
            <h1 className="admin-heading-serif admin-content-title text-2xl text-[var(--admin-text)] md:text-3xl">
              Clients <span aria-hidden>✨</span>
            </h1>
            <Link href="/admin/projects" className="admin-btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs">
              View All Projects
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </Link>
          </div>
          <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
            Manage your clients, projects, invoices, and communications.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto lg:min-w-[520px]">
          <div className="relative min-w-0 flex-1">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              ref={searchRef}
              data-admin-search
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search clients…"
              className="admin-input admin-input-with-icon w-full py-2.5 pr-16"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] px-1.5 py-0.5 text-[10px] text-[var(--admin-text-muted)] sm:inline">
              ⌘ K
            </kbd>
          </div>
          <button type="button" onClick={onAddClient} className="admin-btn-gold whitespace-nowrap px-4 py-2 text-sm">
            + New Client
          </button>
        </div>
      </div>

      <div className="admin-clients-tabs mt-4">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={cn("admin-clients-tab", tab === item.id && "admin-clients-tab-active")}
          >
            {item.label}
            <span className="admin-clients-tab-badge">{item.count}</span>
          </button>
        ))}
      </div>
    </header>
  );
}

export function ClientsStatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="admin-clients-stat-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--admin-gold-light)]">{value}</p>
          {hint ? <p className="mt-1.5 text-xs text-[var(--admin-text-muted)]">{hint}</p> : null}
        </div>
        <div className="admin-stat-icon-glow !h-10 !w-10 [&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</div>
      </div>
    </div>
  );
}

export function ClientsSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={cn("admin-clients-select", className)}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[var(--admin-bg)] text-[var(--admin-text)]">
          {opt.label}
        </option>
      ))}
    </select>
  );
}
