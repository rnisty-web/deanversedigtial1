"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type MediaAdminHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onUpload: () => void;
  uploading: boolean;
};

export function MediaAdminHeader({
  search,
  onSearchChange,
  showFilters,
  onToggleFilters,
  onUpload,
  uploading,
}: MediaAdminHeaderProps) {
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
    <header className="admin-content-header shrink-0 border-b border-[var(--admin-border-subtle)] px-6 lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-start gap-3 pt-0.5">
            <h1 className="admin-heading-serif admin-content-title text-2xl text-[var(--admin-text)] md:text-3xl">
              Media Library <span aria-hidden>✨</span>
            </h1>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
            >
              View Site
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </Link>
          </div>
          <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
            Manage all your media files in one place.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[520px]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <svg
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                ref={searchRef}
                type="search"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search media…"
                className="admin-input admin-input-with-icon w-full py-2.5 pr-16"
              />
              <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] px-1.5 py-0.5 text-[10px] text-[var(--admin-text-muted)] sm:inline">
                ⌘ K
              </kbd>
            </div>
            <button
              type="button"
              onClick={onToggleFilters}
              className={cn(
                "admin-btn-ghost inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm",
                showFilters && "border-[var(--admin-gold)]/40 text-[var(--admin-gold-light)]",
              )}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
              Filters
            </button>
            <button
              type="button"
              onClick={onUpload}
              disabled={uploading}
              className="admin-btn-gold whitespace-nowrap px-4 py-2 text-sm"
            >
              {uploading ? "Uploading…" : "+ Upload Files"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function MediaStatCard({
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
    <div className="admin-media-stat-card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--admin-text)]">{value}</p>
          {hint ? <p className="admin-trend-up mt-1.5">{hint}</p> : null}
        </div>
        <div className="admin-stat-icon-glow !h-10 !w-10 [&>svg]:h-[18px] [&>svg]:w-[18px]">
          {icon}
        </div>
      </div>
    </div>
  );
}

export function MediaSelect({
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
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn("admin-media-select", className)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function MediaViewTabs({
  activeTab,
  onChange,
}: {
  activeTab: string;
  onChange: (tab: string) => void;
}) {
  const tabs = [
    { id: "all", label: "All Media" },
    { id: "image", label: "Images" },
    { id: "video", label: "Videos" },
    { id: "document", label: "Documents" },
    { id: "other", label: "Other" },
  ];

  return (
    <div className="admin-media-view-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "admin-media-view-tab",
            activeTab === tab.id && "admin-media-view-tab-active",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
