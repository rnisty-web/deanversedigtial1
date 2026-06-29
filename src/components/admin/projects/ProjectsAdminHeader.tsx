"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { statusStyle } from "@/lib/projects/utils";

type ProjectsAdminHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
  layoutMode: "list" | "kanban";
  onLayoutModeChange: (mode: "list" | "kanban") => void;
  onNewProject: () => void;
  newProjectDisabled?: boolean;
  tab: string;
  onTabChange: (tab: string) => void;
  counts: Record<string, number> & { all: number };
};

const PROJECT_TABS = ["all", "planning", "in_progress", "completed", "on_hold"] as const;

export function ProjectsAdminHeader({
  search,
  onSearchChange,
  layoutMode,
  onLayoutModeChange,
  onNewProject,
  newProjectDisabled,
  tab,
  onTabChange,
  counts,
}: ProjectsAdminHeaderProps) {
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
          <div className="flex flex-wrap items-start gap-3 pt-0.5">
            <h1 className="admin-heading-serif admin-content-title text-2xl text-[var(--admin-text)] md:text-3xl">
              Projects <span aria-hidden>✨</span>
            </h1>
            <Link href="/admin/clients" className="admin-btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs">
              View Clients
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </Link>
          </div>
          <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
            Manage all client projects from start to finish.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 lg:w-auto">
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <div className="admin-projects-view-switch">
              <button
                type="button"
                onClick={() => onLayoutModeChange("kanban")}
                className={cn("admin-projects-view-switch-btn", layoutMode === "kanban" && "admin-projects-view-switch-btn-active")}
              >
                Kanban
              </button>
              <button
                type="button"
                onClick={() => onLayoutModeChange("list")}
                className={cn("admin-projects-view-switch-btn", layoutMode === "list" && "admin-projects-view-switch-btn-active")}
              >
                List
              </button>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:min-w-[520px]">
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
                placeholder="Search projects…"
                className="admin-input admin-input-with-icon w-full py-2.5 pr-16"
              />
              <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] px-1.5 py-0.5 text-[10px] text-[var(--admin-text-muted)] sm:inline">
                ⌘ K
              </kbd>
            </div>
            <button
              type="button"
              onClick={onNewProject}
              disabled={newProjectDisabled}
              className="admin-btn-gold whitespace-nowrap px-4 py-2 text-sm disabled:opacity-50"
            >
              + New Project
            </button>
          </div>
        </div>
      </div>

      <div className="admin-projects-tabs mt-4">
        {PROJECT_TABS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            className={cn("admin-projects-tab", tab === id && "admin-projects-tab-active")}
          >
            {id === "all" ? "All" : statusStyle(id).label}
            <span className="admin-projects-tab-badge">{counts[id] ?? 0}</span>
          </button>
        ))}
      </div>
    </header>
  );
}

export function ProjectsStatCard({
  label,
  value,
  hint,
  icon,
  hintTone = "neutral",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ReactNode;
  hintTone?: "up" | "down" | "neutral";
}) {
  return (
    <div className="admin-projects-stat-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--admin-gold-light)]">{value}</p>
          {hint ? (
            <p
              className={cn(
                "mt-1.5 text-xs",
                hintTone === "down" ? "text-red-300/90" : "text-[var(--admin-text-muted)]",
              )}
            >
              {hint}
            </p>
          ) : null}
        </div>
        <div className="admin-stat-icon-glow !h-10 !w-10 [&>svg]:h-[18px] [&>svg]:w-[18px]">{icon}</div>
      </div>
    </div>
  );
}

export function ProjectsSelect({
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
    <select value={value} onChange={(e) => onChange(e.target.value)} className={cn("admin-projects-select", className)}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[var(--admin-bg)] text-[var(--admin-text)]">
          {opt.label}
        </option>
      ))}
    </select>
  );
}
