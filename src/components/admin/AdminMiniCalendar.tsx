"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type TodayEvent = {
  id: string;
  title: string;
  starts_at: string;
  event_type: string;
};

function buildMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function formatEventTime(startsAt: string) {
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function AdminMiniCalendar({
  className,
  events = [],
}: {
  className?: string;
  events?: TodayEvent[];
}) {
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
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--admin-gold)]">
            Today&apos;s schedule
          </p>
          <Link href="/admin/calendar" className="admin-dashboard-link text-[10px]">
            + Add Event
          </Link>
        </div>
        {events.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--admin-text-muted)]">
            {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            {" — "}
            <span>No events scheduled</span>
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-center gap-2 rounded-lg border border-[var(--admin-border-subtle)] px-2.5 py-2"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--admin-gold)]" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-[var(--admin-text)]">{event.title}</p>
                  {formatEventTime(event.starts_at) ? (
                    <p className="text-[10px] text-[var(--admin-text-muted)]">{formatEventTime(event.starts_at)}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
