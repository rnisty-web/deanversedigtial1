"use client";

import { cn } from "@/lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function buildMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function AdminMiniCalendar({ className }: { className?: string }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const cells = buildMonthGrid(year, month);

  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <p className="text-sm font-medium text-[var(--admin-text)]">{monthLabel}</p>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((day) => (
            <span
              key={day}
              className="py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]"
            >
              {day}
            </span>
          ))}
          {cells.map((day, i) => (
            <span
              key={i}
              className={cn(
                "flex h-7 items-center justify-center rounded-lg text-xs",
                day === null && "invisible",
                day === today
                  ? "bg-gradient-to-br from-[var(--admin-gold)]/30 to-[var(--admin-emerald)]/25 font-semibold text-[var(--admin-gold-light)] ring-1 ring-[var(--admin-gold)]/40"
                  : day !== null && "text-[var(--admin-text-muted)]",
              )}
            >
              {day}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--admin-border-subtle)] pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--admin-gold)]">
          Today&apos;s schedule
        </p>
        <p className="mt-2 text-sm text-[var(--admin-text-muted)]">
          {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          {" — "}
          <span className="text-[var(--admin-text-muted)]/80">No events scheduled</span>
        </p>
      </div>
    </div>
  );
}
