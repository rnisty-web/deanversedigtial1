"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/calendar/types";
import {
  EVENT_TYPE_STYLES,
  WEEKDAY_SHORT,
  buildMonthCells,
  endOfDay,
  eventsForDay,
  formatEventTime,
  formatUpcomingBlock,
  isSameDay,
  startOfDay,
} from "@/lib/calendar/utils";

type CalendarSidebarProps = {
  cursorDate: Date;
  selectedDate: Date;
  events: CalendarEvent[];
  onSelectDate: (date: Date) => void;
  onAddEvent: () => void;
  onEventClick: (event: CalendarEvent) => void;
  onViewAgenda?: () => void;
  onViewUpcoming?: () => void;
};

export function CalendarSidebar({
  cursorDate,
  selectedDate,
  events,
  onSelectDate,
  onAddEvent,
  onEventClick,
  onViewAgenda,
  onViewUpcoming,
}: CalendarSidebarProps) {
  const today = new Date();
  const cells = buildMonthCells(cursorDate.getFullYear(), cursorDate.getMonth());
  const todayAgenda = eventsForDay(events, today);
  const todayEnd = endOfDay(today);

  const upcoming = events
    .filter((e) => new Date(e.starts_at).getTime() > todayEnd.getTime())
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
    .slice(0, 4);

  return (
    <aside className="admin-calendar-sidebar">
      <div className="admin-calendar-sidebar-panel">
        {/* Mini calendar */}
        <div className="admin-calendar-mini">
          <p className="admin-calendar-mini-title">
            {cursorDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
          <div className="admin-calendar-mini-grid">
            {WEEKDAY_SHORT.map((day) => (
              <span key={day} className="admin-calendar-mini-weekday">
                {day}
              </span>
            ))}
            {cells.map(({ date, inMonth }) => {
              const isToday = isSameDay(date, today);
              const isSelected = isSameDay(date, selectedDate);
              const hasEvents = eventsForDay(events, date).length > 0;

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => onSelectDate(date)}
                  className={cn(
                    "admin-calendar-mini-day",
                    !inMonth && "admin-calendar-mini-day-outside",
                    isToday && "admin-calendar-mini-day-today",
                    isSelected && !isToday && "admin-calendar-mini-day-selected",
                    hasEvents && !isToday && !isSelected && "admin-calendar-mini-day-events",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <div className="admin-calendar-sidebar-divider" />

        {/* Today's Agenda */}
        <section className="admin-calendar-sidebar-section">
          <div className="admin-calendar-sidebar-heading">
            <h3>Today&apos;s Agenda</h3>
            <button type="button" onClick={onViewAgenda}>
              View All
            </button>
          </div>
          {todayAgenda.length === 0 ? (
            <p className="admin-calendar-sidebar-empty">No events scheduled today.</p>
          ) : (
            <ul className="admin-calendar-agenda-list">
              {todayAgenda.map((event) => {
                const styles = EVENT_TYPE_STYLES[event.event_type];
                return (
                  <li key={event.id}>
                    <button
                      type="button"
                      onClick={() => onEventClick(event)}
                      className="admin-calendar-agenda-item"
                    >
                      <span className="admin-calendar-agenda-time">
                        {formatEventTime(event)}
                      </span>
                      <span className={cn("admin-calendar-event-dot", styles.dot)} />
                      <span className="admin-calendar-agenda-body">
                        <span className="admin-calendar-agenda-title">{event.title}</span>
                        {event.client_name && (
                          <span className="admin-calendar-agenda-sub">{event.client_name}</span>
                        )}
                      </span>
                      {event.meeting_url ? (
                        <Link
                          href={event.meeting_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="admin-calendar-join-btn"
                        >
                          Join
                        </Link>
                      ) : (
                        <span className="w-10 shrink-0" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="admin-calendar-sidebar-divider" />

        {/* Upcoming Events */}
        <section className="admin-calendar-sidebar-section">
          <div className="admin-calendar-sidebar-heading">
            <h3>Upcoming Events</h3>
            <button type="button" onClick={onViewUpcoming}>
              View All
            </button>
          </div>
          {upcoming.length === 0 ? (
            <p className="admin-calendar-sidebar-empty">No upcoming events.</p>
          ) : (
            <ul className="admin-calendar-upcoming-list">
              {upcoming.map((event) => {
                const block = formatUpcomingBlock(new Date(event.starts_at));
                const locationLabel =
                  event.location ??
                  (event.meeting_url ? "Zoom Meeting" : event.all_day ? "All day" : "Online Meeting");

                return (
                  <li key={event.id}>
                    <button
                      type="button"
                      onClick={() => onEventClick(event)}
                      className="admin-calendar-upcoming-item"
                    >
                      <div className="admin-calendar-upcoming-date">
                        <span className="admin-calendar-upcoming-month">{block.month}</span>
                        <span className="admin-calendar-upcoming-day">{block.day}</span>
                      </div>
                      <span className="admin-calendar-upcoming-body">
                        <span className="admin-calendar-upcoming-title">{event.title}</span>
                        <span className="admin-calendar-upcoming-meta">
                          {formatEventTime(event)} · {locationLabel}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <button type="button" onClick={onAddEvent} className="admin-calendar-sidebar-add">
          + Add New Event
        </button>
      </div>
    </aside>
  );
}
