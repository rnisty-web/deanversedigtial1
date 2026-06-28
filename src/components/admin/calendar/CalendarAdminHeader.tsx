"use client";

import { cn } from "@/lib/utils";
import type { CalendarViewMode } from "@/lib/calendar/types";
import { monthYearLabel } from "@/lib/calendar/utils";

type CalendarAdminHeaderProps = {
  cursorDate: Date;
  viewMode: CalendarViewMode;
  showFilters: boolean;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  onMonthChange: (year: number, month: number) => void;
  onToggleFilters: () => void;
  onAddEvent: () => void;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function CalendarAdminHeader({
  cursorDate,
  viewMode,
  showFilters,
  onToday,
  onPrev,
  onNext,
  onMonthChange,
  onToggleFilters,
  onAddEvent,
}: CalendarAdminHeaderProps) {
  const years = Array.from({ length: 5 }, (_, i) => cursorDate.getFullYear() - 2 + i);

  return (
    <header className="admin-content-header shrink-0 border-b border-[var(--admin-border-subtle)] px-6 lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <h1 className="admin-heading-serif admin-content-title text-2xl text-[var(--admin-text)] md:text-3xl">
            Calendar <span aria-hidden>✨</span>
          </h1>
          <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
            Manage your schedule, events, and important dates.
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
            Filter
          </button>
          <button type="button" onClick={onAddEvent} className="admin-btn-gold whitespace-nowrap px-4 py-2 text-sm">
            + Add Event
          </button>
        </div>
      </div>

      <p className="sr-only">{monthYearLabel(cursorDate)} — {viewMode} view</p>
    </header>
  );
}

export function CalendarViewTabs({
  viewMode,
  onChange,
}: {
  viewMode: CalendarViewMode;
  onChange: (mode: CalendarViewMode) => void;
}) {
  const tabs: { id: CalendarViewMode; label: string }[] = [
    { id: "month", label: "Month" },
    { id: "week", label: "Week" },
    { id: "day", label: "Day" },
    { id: "agenda", label: "Agenda" },
  ];

  return (
    <div className="admin-calendar-view-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "admin-calendar-view-tab",
            viewMode === tab.id && "admin-calendar-view-tab-active",
          )}
        >
          {tab.label}
        </button>
      ))}
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
