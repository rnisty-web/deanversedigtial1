"use client";

import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/calendar/types";
import {
  EVENT_TYPE_STYLES,
  WEEKDAY_HEADERS,
  addDays,
  eventsForDay,
  formatEventTime,
  isSameDay,
  startOfWeek,
} from "@/lib/calendar/utils";

type CalendarWeekViewProps = {
  cursorDate: Date;
  selectedDate: Date;
  events: CalendarEvent[];
  onSelectDate: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
};

export function CalendarWeekView({
  cursorDate,
  selectedDate,
  events,
  onSelectDate,
  onEventClick,
}: CalendarWeekViewProps) {
  const weekStart = startOfWeek(cursorDate);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  return (
    <div className="admin-calendar-week">
      <div className="admin-calendar-weekdays">
        {days.map((date, i) => (
          <button
            key={date.toISOString()}
            type="button"
            onClick={() => onSelectDate(date)}
            className={cn(
              "admin-calendar-week-header",
              isSameDay(date, today) && "admin-calendar-week-header-today",
              isSameDay(date, selectedDate) && "admin-calendar-week-header-selected",
            )}
          >
            <span className="text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)]">
              {WEEKDAY_HEADERS[i]}
            </span>
            <span className="text-lg font-semibold tabular-nums">{date.getDate()}</span>
          </button>
        ))}
      </div>
      <div className="admin-calendar-week-columns">
        {days.map((date) => {
          const dayEvents = eventsForDay(events, date);
          return (
            <div key={date.toISOString()} className="admin-calendar-week-column">
              {dayEvents.length === 0 ? (
                <p className="p-3 text-xs text-[var(--admin-text-muted)]/60">No events</p>
              ) : (
                dayEvents.map((event) => {
                  const styles = EVENT_TYPE_STYLES[event.event_type];
                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => onEventClick(event)}
                      className={cn(
                        "admin-calendar-week-event",
                        styles.bg,
                        styles.border,
                      )}
                    >
                      <span className={cn("admin-calendar-event-dot", styles.dot)} />
                      <div className="min-w-0 text-left">
                        <p className={cn("truncate text-xs font-medium", styles.text)}>{event.title}</p>
                        <p className="text-[10px] text-[var(--admin-text-muted)]">
                          {formatEventTime(event)}
                          {event.client_name ? ` · ${event.client_name}` : ""}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
