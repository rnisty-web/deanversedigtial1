import type { CalendarEvent, CalendarEventType } from "./types";

export const WEEKDAY_HEADERS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
export const WEEKDAY_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function endOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

export function addDays(d: Date, days: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function addMonths(d: Date, months: number) {
  const copy = new Date(d);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

export function startOfWeek(d: Date) {
  const copy = startOfDay(d);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
}

export function endOfWeek(d: Date) {
  const copy = startOfWeek(d);
  copy.setDate(copy.getDate() + 6);
  return endOfDay(copy);
}

export type MonthCell = {
  date: Date;
  inMonth: boolean;
};

export function buildMonthCells(year: number, month: number): MonthCell[] {
  const first = new Date(year, month, 1);
  const start = startOfWeek(first);
  const cells: MonthCell[] = [];

  for (let i = 0; i < 42; i++) {
    const date = addDays(start, i);
    cells.push({
      date,
      inMonth: date.getMonth() === month,
    });
  }

  return cells;
}

export function eventStartsOnDay(event: CalendarEvent, day: Date) {
  const start = new Date(event.starts_at);
  return isSameDay(start, day);
}

export function eventsForDay(events: CalendarEvent[], day: Date) {
  return events
    .filter((e) => eventStartsOnDay(e, day))
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
}

export function eventsInRange(events: CalendarEvent[], start: Date, end: Date) {
  const s = start.getTime();
  const e = end.getTime();
  return events
    .filter((ev) => {
      const t = new Date(ev.starts_at).getTime();
      return t >= s && t <= e;
    })
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
}

export function formatEventTime(event: CalendarEvent) {
  if (event.all_day) return "All day";
  return new Date(event.starts_at).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatAgendaDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatUpcomingBlock(date: Date) {
  return {
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: date.getDate().toString().padStart(2, "0"),
  };
}

export function monthYearLabel(d: Date) {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export const EVENT_TYPE_STYLES: Record<
  CalendarEventType,
  { dot: string; bg: string; text: string; border: string }
> = {
  meeting: {
    dot: "bg-emerald-400",
    bg: "bg-emerald-500/10",
    text: "text-emerald-300/90",
    border: "border-emerald-500/20",
  },
  call: {
    dot: "bg-sky-400",
    bg: "bg-sky-500/10",
    text: "text-sky-300/90",
    border: "border-sky-500/20",
  },
  deadline: {
    dot: "bg-violet-400",
    bg: "bg-violet-500/10",
    text: "text-violet-300/90",
    border: "border-violet-500/20",
  },
  internal: {
    dot: "bg-amber-400",
    bg: "bg-amber-500/10",
    text: "text-amber-300/90",
    border: "border-amber-500/20",
  },
};

export function filterEventsByType(
  events: CalendarEvent[],
  types: CalendarEventType[] | "all",
) {
  if (types === "all") return events;
  return events.filter((e) => types.includes(e.event_type));
}
