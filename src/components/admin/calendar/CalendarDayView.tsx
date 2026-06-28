"use client";

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

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7);

export function CalendarDayView({
  selectedDate,
  events,
  onEventClick,
}: CalendarDayViewProps) {
  const dayEvents = eventsForDay(events, selectedDate);

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
      <div className="admin-calendar-day-timeline">
        {HOURS.map((hour) => {
          const slotEvents = dayEvents.filter((e) => {
            if (e.all_day) return hour === 7;
            return new Date(e.starts_at).getHours() === hour;
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
