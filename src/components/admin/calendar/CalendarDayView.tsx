"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/calendar/types";
import {
  EVENT_TYPE_STYLES,
  eventsForDay,
  formatAgendaDate,
  formatEventTime,
} from "@/lib/calendar/utils";

type CalendarDayViewProps = {
  selectedDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
};

function buildTimelineHours(dayEvents: CalendarEvent[]) {
  const timedHours = dayEvents
    .filter((event) => !event.all_day)
    .map((event) => new Date(event.starts_at).getHours());

  if (timedHours.length === 0) {
    return Array.from({ length: 13 }, (_, index) => index + 7);
  }

  const minHour = Math.min(...timedHours);
  const maxHour = Math.max(...timedHours);
  const start = Math.max(0, Math.min(minHour - 1, 7));
  const end = Math.min(23, Math.max(maxHour + 1, 19));

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function CalendarDayView({
  selectedDate,
  events,
  onEventClick,
}: CalendarDayViewProps) {
  const dayEvents = eventsForDay(events, selectedDate);
  const hours = useMemo(() => buildTimelineHours(dayEvents), [dayEvents]);
  const allDayEvents = dayEvents.filter((event) => event.all_day);

  return (
    <div className="admin-calendar-day">
      <div className="admin-calendar-day-header">
        <h2 className="text-lg font-semibold text-[var(--admin-text)]">
          {formatAgendaDate(selectedDate)}
        </h2>
        <p className="text-sm text-[var(--admin-text-muted)]">
          {dayEvents.length} event{dayEvents.length === 1 ? "" : "s"}
        </p>
      </div>

      {allDayEvents.length > 0 ? (
        <div className="admin-calendar-day-allday mb-4 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
            All day
          </p>
          {allDayEvents.map((event) => {
            const styles = EVENT_TYPE_STYLES[event.event_type];
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onEventClick(event)}
                className={cn("admin-calendar-day-event w-full", styles.bg, styles.border)}
              >
                <span className={cn("admin-calendar-event-dot", styles.dot)} />
                <div className="min-w-0 text-left">
                  <p className={cn("font-medium", styles.text)}>{event.title}</p>
                  {event.client_name ? (
                    <p className="text-xs text-[var(--admin-text-muted)]">{event.client_name}</p>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="admin-calendar-day-timeline">
        {hours.map((hour) => {
          const slotEvents = dayEvents.filter((event) => {
            if (event.all_day) return false;
            return new Date(event.starts_at).getHours() === hour;
          });

          return (
            <div key={hour} className="admin-calendar-day-row">
              <span className="admin-calendar-day-hour">
                {new Date(2000, 0, 1, hour).toLocaleTimeString("en-US", {
                  hour: "numeric",
                })}
              </span>
              <div className="admin-calendar-day-slot">
                {slotEvents.map((event) => {
                  const styles = EVENT_TYPE_STYLES[event.event_type];
                  return (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => onEventClick(event)}
                      className={cn(
                        "admin-calendar-day-event",
                        styles.bg,
                        styles.border,
                      )}
                    >
                      <span className={cn("admin-calendar-event-dot", styles.dot)} />
                      <div className="min-w-0 text-left">
                        <p className={cn("font-medium", styles.text)}>{event.title}</p>
                        <p className="text-xs text-[var(--admin-text-muted)]">
                          {formatEventTime(event)}
                          {event.client_name ? ` · ${event.client_name}` : ""}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
