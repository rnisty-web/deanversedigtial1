"use client";

import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/calendar/types";
import {
  EVENT_TYPE_STYLES,
  WEEKDAY_HEADERS,
  buildMonthCells,
  eventsForDay,
  formatEventTime,
  isSameDay,
} from "@/lib/calendar/utils";

type CalendarMonthGridProps = {
  cursorDate: Date;
  selectedDate: Date;
  events: CalendarEvent[];
  onSelectDate: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
};

const MAX_VISIBLE = 3;

export function CalendarMonthGrid({
  cursorDate,
  selectedDate,
  events,
  onSelectDate,
  onEventClick,
}: CalendarMonthGridProps) {
  const today = new Date();
  const cells = buildMonthCells(cursorDate.getFullYear(), cursorDate.getMonth());

  return (
    <div className="admin-calendar-month">
      <div className="admin-calendar-weekdays">
        {WEEKDAY_HEADERS.map((day) => (
          <div key={day} className="admin-calendar-weekday">
            {day}
          </div>
        ))}
      </div>
      <div className="admin-calendar-grid">
        {cells.map(({ date, inMonth }) => {
          const dayEvents = eventsForDay(events, date);
          const visible = dayEvents.slice(0, MAX_VISIBLE);
          const overflow = dayEvents.length - visible.length;
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, selectedDate);

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onSelectDate(date)}
              className={cn(
                "admin-calendar-cell",
                !inMonth && "admin-calendar-cell-outside",
                isToday && "admin-calendar-cell-today",
                isSelected && "admin-calendar-cell-selected",
              )}
            >
              <span className="admin-calendar-cell-date">{date.getDate()}</span>
              <div className="admin-calendar-cell-events">
                {visible.map((event) => {
                  const styles = EVENT_TYPE_STYLES[event.event_type];
                  return (
                    <span
                      key={event.id}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          onEventClick(event);
                        }
                      }}
                      className={cn(
                        "admin-calendar-event-pill",
                        styles.bg,
                        styles.border,
                        styles.text,
                      )}
                    >
                      <span className={cn("admin-calendar-event-dot", styles.dot)} />
                      <span className="truncate">{event.title}</span>
                      {!event.all_day && (
                        <span className="shrink-0 opacity-70">{formatEventTime(event)}</span>
                      )}
                    </span>
                  );
                })}
                {overflow > 0 && (
                  <span className="admin-calendar-more">+{overflow} more</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
