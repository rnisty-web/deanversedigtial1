"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type ProjectsAdminHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  layoutMode: "list" | "kanban";
  onLayoutModeChange: (mode: "list" | "kanban") => void;
  onNewProject: () => void;
  newProjectDisabled?: boolean;
};

export function ProjectsAdminHeader({
  search,
  onSearchChange,
  showFilters,
  onToggleFilters,
  layoutMode,
  onLayoutModeChange,
  onNewProject,
  newProjectDisabled,
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
    <header className="admin-content-header shrink-0 border-b border-[var(--admin-border-subtle)] px-6 lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <h1 className="admin-heading-serif admin-content-title text-2xl text-[var(--admin-text)] md:text-3xl">
            Projects <span aria-hidden>✨</span>
          </h1>
          <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
            Manage all client projects from start to finish.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 lg:w-auto">
          <div className="flex flex-wrap items-center gap-2">
            <div className="admin-projects-view-switch">
              <button
                type="button"
                onClick={() => onLayoutModeChange("kanban")}
                className={cn("admin-projects-view-switch-btn", layoutMode === "kanban" && "admin-projects-view-switch-btn-active")}
              >
                Kanban View
              </button>
              <button
                type="button"
                onClick={() => onLayoutModeChange("list")}
                className={cn("admin-projects-view-switch-btn", layoutMode === "list" && "admin-projects-view-switch-btn-active")}
              >
                List View
              </button>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:min-w-[520px]">
            <div className="relative min-w-0 flex-1">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                ref={searchRef}
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
              onClick={onToggleFilters}
              className={cn(
                "admin-btn-ghost inline-flex items-center gap-1.5 px-3 py-2 text-sm",
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
              onClick={onNewProject}
              disabled={newProjectDisabled}
              className="admin-btn-gold whitespace-nowrap px-4 py-2 text-sm disabled:opacity-50"
            >
              + New Project
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function ProjectsStatCard({
  label,
  value,
  hint,
  icon,
  hintTone = "up",
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
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--admin-text)]">{value}</p>
          {hint ? (
            <p
              className={cn(
                "mt-1.5 text-xs",
                hintTone === "down" ? "text-red-300" : hintTone === "neutral" ? "text-[var(--admin-text-muted)]" : "admin-trend-up",
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
