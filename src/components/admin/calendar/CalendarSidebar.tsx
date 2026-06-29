"use client";

import { useMemo } from "react";
import Link from "next/link";
import { StatsChart } from "@/components/admin/StatsChart";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/lib/calendar/types";
import {
  EVENT_TYPE_STYLES,
  WEEKDAY_SHORT,
  buildMonthCells,
  countByEventType,
  endOfDay,
  eventsForDay,
  formatEventTime,
  formatUpcomingBlock,
  isSameDay,
} from "@/lib/calendar/utils";

const TYPE_COLORS = ["#34d399", "#38bdf8", "#a78bfa", "#fbbf24"];

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

  const typeOverview = useMemo(() => {
    const counts = countByEventType(events);
    return {
      labels: ["Meetings", "Calls", "Deadlines", "Internal"],
      data: [counts.meeting, counts.call, counts.deadline, counts.internal],
      total: events.length,
    };
  }, [events]);

  return (
    <aside className="admin-calendar-sidebar">
      <div className="admin-calendar-sidebar-panel">
        <section className="admin-calendar-sidebar-section">
          <h3 className="admin-calendar-sidebar-title">Events Overview</h3>
          <div className="admin-calendar-overview-chart">
            <StatsChart
              type="doughnut"
              labels={typeOverview.labels}
              datasets={[{ label: "Events", data: typeOverview.data, backgroundColor: TYPE_COLORS }]}
              height={150}
              emptyMessage="No events yet."
              variant="luxury"
              hideLegend
            />
            <p className="admin-calendar-overview-total">
              <span className="text-2xl font-bold text-[var(--admin-text)]">{typeOverview.total}</span>
              <span className="block text-xs text-[var(--admin-text-muted)]">Total Events</span>
            </p>
          </div>
          <ul className="admin-calendar-overview-legend">
            {typeOverview.labels.map((label, i) => (
              <li key={label}>
                <span className="admin-calendar-legend-dot" style={{ backgroundColor: TYPE_COLORS[i] }} />
                {label}
                <span className="ml-auto tabular-nums text-[var(--admin-text-muted)]">{typeOverview.data[i]}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="admin-calendar-sidebar-divider" />

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
