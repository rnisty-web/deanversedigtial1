"use client";

import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/calendar/types";
import {
  EVENT_TYPE_STYLES,
  addMonths,
  endOfDay,
  eventsInRange,
  formatAgendaDate,
  formatEventTime,
  startOfDay,
} from "@/lib/calendar/utils";

type CalendarAgendaViewProps = {
  cursorDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
};

export function CalendarAgendaView({
  cursorDate,
  events,
  onEventClick,
}: CalendarAgendaViewProps) {
  const rangeStart = startOfDay(cursorDate);
  const rangeEnd = endOfDay(addMonths(cursorDate, 1));
  const agendaEvents = eventsInRange(events, rangeStart, rangeEnd);

  const grouped = agendaEvents.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    const key = new Date(event.starts_at).toDateString();
    acc[key] = acc[key] ?? [];
    acc[key].push(event);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );

  if (dates.length === 0) {
    return (
      <div className="admin-calendar-agenda-empty">
        <p className="text-sm text-[var(--admin-text-muted)]">No upcoming events in this range.</p>
      </div>
    );
  }

  return (
    <div className="admin-calendar-agenda">
      {dates.map((dateKey) => {
        const date = new Date(dateKey);
        return (
          <section key={dateKey} className="admin-calendar-agenda-group">
            <h3 className="admin-calendar-agenda-date">{formatAgendaDate(date)}</h3>
            <ul className="space-y-2">
              {grouped[dateKey].map((event) => {
                const styles = EVENT_TYPE_STYLES[event.event_type];
                return (
                  <li key={event.id}>
                    <button
                      type="button"
                      onClick={() => onEventClick(event)}
                      className={cn(
                        "admin-calendar-agenda-item",
                        styles.bg,
                        styles.border,
                      )}
                    >
                      <span className={cn("admin-calendar-event-dot", styles.dot)} />
                      <div className="min-w-0 flex-1 text-left">
                        <p className={cn("font-medium", styles.text)}>{event.title}</p>
                        <p className="text-xs text-[var(--admin-text-muted)]">
                          {formatEventTime(event)}
                          {event.client_name ? ` · ${event.client_name}` : ""}
                          {event.location ? ` · ${event.location}` : ""}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
