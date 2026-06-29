"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CalendarViewMode } from "@/lib/calendar/types";
import { monthYearLabel } from "@/lib/calendar/utils";

type CalendarAdminHeaderProps = {
  cursorDate: Date;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  onMonthChange: (year: number, month: number) => void;
  onAddEvent: () => void;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const VIEW_TABS: { id: CalendarViewMode; label: string }[] = [
  { id: "month", label: "Month" },
  { id: "week", label: "Week" },
  { id: "day", label: "Day" },
  { id: "agenda", label: "Agenda" },
];

export function CalendarAdminHeader({
  cursorDate,
  viewMode,
  onViewModeChange,
  onToday,
  onPrev,
  onNext,
  onMonthChange,
  onAddEvent,
}: CalendarAdminHeaderProps) {
  const years = Array.from({ length: 5 }, (_, i) => cursorDate.getFullYear() - 2 + i);

  return (
    <header className="admin-content-header sticky top-0 z-20 shrink-0 border-b border-[var(--admin-border-subtle)] bg-[color-mix(in_srgb,var(--admin-bg)_90%,transparent)] px-6 backdrop-blur-xl lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-start gap-3 pt-0.5">
            <h1 className="admin-heading-serif admin-content-title text-2xl text-[var(--admin-text)] md:text-3xl">
              Calendar <span aria-hidden>✨</span>
            </h1>
            <Link
              href="/admin/projects"
              className="admin-btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
            >
              Project Deadlines
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </Link>
          </div>
          <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
            Manage your schedule, client meetings, deadlines, and internal events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={onToday} className="admin-btn-ghost px-4 py-2 text-sm">
            Today
          </button>
          <div className="admin-calendar-nav-group inline-flex items-center">
            <button type="button" onClick={onPrev} className="admin-calendar-nav-btn" aria-label="Previous">
              ‹
            </button>
            <button type="button" onClick={onNext} className="admin-calendar-nav-btn" aria-label="Next">
              ›
            </button>
          </div>
          <div className="admin-calendar-month-picker inline-flex items-center gap-1">
            <select
              value={cursorDate.getMonth()}
              onChange={(e) => onMonthChange(cursorDate.getFullYear(), Number(e.target.value))}
              className="admin-calendar-select"
              aria-label="Month"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
            <select
              value={cursorDate.getFullYear()}
              onChange={(e) => onMonthChange(Number(e.target.value), cursorDate.getMonth())}
              className="admin-calendar-select !min-w-[5rem]"
              aria-label="Year"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button type="button" onClick={onAddEvent} className="admin-btn-gold whitespace-nowrap px-4 py-2 text-sm">
            + New Event
          </button>
        </div>
      </div>

      <div className="admin-calendar-tabs mt-4">
        {VIEW_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onViewModeChange(tab.id)}
            className={cn("admin-calendar-tab", viewMode === tab.id && "admin-calendar-tab-active")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="sr-only">{monthYearLabel(cursorDate)} — {viewMode} view</p>
    </header>
  );
}

export function CalendarStatCard({
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
    <div className="admin-calendar-stat-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--admin-gold-light)]">{value}</p>
          {hint ? <p className="mt-1.5 text-xs text-[var(--admin-text-muted)]">{hint}</p> : null}
        </div>
        <div className="admin-stat-icon-glow !h-10 !w-10 [&>svg]:h-[18px] [&>svg]:w-[18px]">
          {icon}
        </div>
      </div>
    </div>
  );
}

export function CalendarLegend() {
  const items = [
    { type: "meeting", label: "Meeting", className: "bg-emerald-400" },
    { type: "call", label: "Call", className: "bg-sky-400" },
    { type: "deadline", label: "Deadline", className: "bg-violet-400" },
    { type: "internal", label: "Internal", className: "bg-amber-400" },
  ] as const;

  return (
    <div className="admin-calendar-legend">
      {items.map((item) => (
        <span key={item.type} className="inline-flex items-center gap-2 text-xs text-[var(--admin-text-muted)]">
          <span className={cn("h-2 w-2 rounded-full", item.className)} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
