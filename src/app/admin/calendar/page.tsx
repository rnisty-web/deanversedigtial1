"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminField } from "@/components/admin/AdminField";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import {
  CalendarAdminHeader,
  CalendarLegend,
  CalendarStatCard,
} from "@/components/admin/calendar/CalendarAdminHeader";
import { CalendarAgendaView } from "@/components/admin/calendar/CalendarAgendaView";
import { CalendarDayView } from "@/components/admin/calendar/CalendarDayView";
import { CalendarFilterBar } from "@/components/admin/calendar/CalendarFilterBar";
import { CalendarMonthGrid } from "@/components/admin/calendar/CalendarMonthGrid";
import { CalendarSidebar } from "@/components/admin/calendar/CalendarSidebar";
import { CalendarWeekView } from "@/components/admin/calendar/CalendarWeekView";
import { Button } from "@/components/ui/Button";
import type { CalendarEvent, CalendarEventType, CalendarViewMode } from "@/lib/calendar/types";
import { CALENDAR_EVENT_TYPES, EVENT_TYPE_LABELS } from "@/lib/calendar/types";
import { addDays, addMonths, computeCalendarStats, filterEventsByType, monthEventsHint, pct } from "@/lib/calendar/utils";

const statIcons = {
  total: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  today: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  week: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  upcoming: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  meetings: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
};

const emptyForm = {
  title: "",
  description: "",
  event_type: "meeting" as CalendarEventType,
  date: "",
  startTime: "09:00",
  endTime: "10:00",
  all_day: false,
  location: "",
  meeting_url: "",
  client_name: "",
};

function toDateInput(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toTimeInput(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function AdminCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [migrationHint, setMigrationHint] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [cursorDate, setCursorDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [typeFilter, setTypeFilter] = useState<CalendarEventType[] | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/calendar", { credentials: "same-origin" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setEvents(data.events ?? []);
      setMigrationHint(data.migrationRequired ? data.migrationHint ?? null : null);
    } else {
      setError(data.error ?? "Failed to load calendar");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = useMemo(
    () => filterEventsByType(events, typeFilter),
    [events, typeFilter],
  );

  const stats = useMemo(() => computeCalendarStats(events), [events]);

  function goToday() {
    const now = new Date();
    setCursorDate(now);
    setSelectedDate(now);
  }

  function goPrev() {
    if (viewMode === "month" || viewMode === "agenda") {
      setCursorDate((d) => addMonths(d, -1));
    } else if (viewMode === "week") {
      setCursorDate((d) => addDays(d, -7));
    } else {
      setCursorDate((d) => addDays(d, -1));
      setSelectedDate((d) => addDays(d, -1));
    }
  }

  function goNext() {
    if (viewMode === "month" || viewMode === "agenda") {
      setCursorDate((d) => addMonths(d, 1));
    } else if (viewMode === "week") {
      setCursorDate((d) => addDays(d, 7));
    } else {
      setCursorDate((d) => addDays(d, 1));
      setSelectedDate((d) => addDays(d, 1));
    }
  }

  function openCreate(date?: Date) {
    const base = date ?? selectedDate;
    setEditEvent(null);
    setForm({
      ...emptyForm,
      date: toDateInput(base),
    });
    setFormError("");
    setShowForm(true);
  }

  function openEdit(event: CalendarEvent) {
    if (event.source === "project") {
      setMessage("Project deadlines are managed on the Projects page.");
      return;
    }
    setEditEvent(event);
    setForm({
      title: event.title,
      description: event.description ?? "",
      event_type: event.event_type,
      date: toDateInput(new Date(event.starts_at)),
      startTime: event.all_day ? "09:00" : toTimeInput(event.starts_at),
      endTime: event.ends_at ? toTimeInput(event.ends_at) : "10:00",
      all_day: event.all_day,
      location: event.location ?? "",
      meeting_url: event.meeting_url ?? "",
      client_name: event.client_name ?? "",
    });
    setFormError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditEvent(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    const starts_at = form.all_day
      ? `${form.date}T00:00:00`
      : `${form.date}T${form.startTime}:00`;
    const ends_at = form.all_day
      ? null
      : form.endTime
        ? `${form.date}T${form.endTime}:00`
        : null;

    const payload = {
      title: form.title,
      description: form.description || null,
      event_type: form.event_type,
      starts_at: new Date(starts_at).toISOString(),
      ends_at: ends_at ? new Date(ends_at).toISOString() : null,
      all_day: form.all_day,
      location: form.location || null,
      meeting_url: form.meeting_url || null,
      client_name: form.client_name || null,
    };

    const res = await fetch("/api/admin/calendar", {
      method: editEvent ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(editEvent ? { id: editEvent.id, ...payload } : payload),
    });

    setSaving(false);

    if (res.ok) {
      closeForm();
      fetchEvents();
      setMessage(editEvent ? "Event updated." : "Event created.");
      return;
    }

    const data = await res.json().catch(() => ({}));
    setFormError(data.error ?? "Failed to save event");
  }

  async function deleteEvent() {
    if (!editEvent) return;
    if (!confirm("Delete this event?")) return;
    const res = await fetch(`/api/admin/calendar?id=${editEvent.id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setFormError(data.error ?? "Failed to delete event");
      return;
    }
    closeForm();
    fetchEvents();
    setMessage("Event deleted.");
  }

  async function importSample() {
    setSeeding(true);
    setMessage(null);
    const res = await fetch("/api/admin/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action: "seed" }),
    });
    setSeeding(false);
    if (res.ok) {
      setMessage("Sample events imported.");
      fetchEvents();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setMessage(data.error ?? "Failed to import sample events");
  }

  return (
    <div className="admin-calendar-page">
      <CalendarAdminHeader
        cursorDate={cursorDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onToday={goToday}
        onPrev={goPrev}
        onNext={goNext}
        onMonthChange={(year, month) => setCursorDate(new Date(year, month, 1))}
        onAddEvent={() => openCreate()}
      />

      <AdminPageContent className="admin-calendar-content">
        <div className="admin-calendar-layout-wrap">
        {error && (
          <AdminAlert tone="error" className="mb-4">
            {error}
          </AdminAlert>
        )}
        {message && (
          <AdminAlert tone="success" className="mb-4">
            {message}
          </AdminAlert>
        )}
        {migrationHint && (
          <AdminAlert tone="warning" className="mb-4">
            {migrationHint}{" "}
            <Link href="/admin/projects" className="underline">
              View project deadlines
            </Link>
          </AdminAlert>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <CalendarStatCard
            label="Total Events"
            value={stats.total}
            hint={monthEventsHint(events)}
            icon={statIcons.total}
          />
          <CalendarStatCard
            label="Today"
            value={stats.today}
            hint="Scheduled for today"
            icon={statIcons.today}
          />
          <CalendarStatCard
            label="This Week"
            value={stats.thisWeek}
            hint={`${pct(stats.thisWeek, stats.total)} of total`}
            icon={statIcons.week}
          />
          <CalendarStatCard
            label="Upcoming"
            value={stats.upcoming}
            hint="After today"
            icon={statIcons.upcoming}
          />
          <CalendarStatCard
            label="Meetings"
            value={stats.meetings}
            hint={`${pct(stats.meetings, stats.total)} of total`}
            icon={statIcons.meetings}
          />
        </div>

        <div className="admin-calendar-layout">
          <div className="admin-calendar-main">
            <CalendarFilterBar activeTypes={typeFilter} onChange={setTypeFilter} />

            {loading ? (
              <div className="admin-calendar-loading">
                <div className="admin-luxury-card h-[420px] animate-pulse rounded-xl" />
              </div>
            ) : (
              <>
                {events.length === 0 && !migrationHint && (
                  <div className="admin-calendar-empty-banner mb-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-[var(--admin-text-muted)]">
                      No events yet — import samples or add your first event.
                    </p>
                    <button
                      type="button"
                      className="admin-btn-ghost text-xs"
                      onClick={importSample}
                      disabled={seeding}
                    >
                      {seeding ? "Importing…" : "Import sample events"}
                    </button>
                  </div>
                )}

                {filteredEvents.length === 0 && events.length > 0 && (
                  <div className="admin-calendar-empty-banner mb-4">
                    <p className="text-sm text-[var(--admin-text-muted)]">
                      No events match your filters.{" "}
                      <button
                        type="button"
                        className="text-[var(--admin-gold-light)] underline"
                        onClick={() => setTypeFilter("all")}
                      >
                        Clear filters
                      </button>
                    </p>
                  </div>
                )}

                {viewMode === "month" && (
                  <CalendarMonthGrid
                    cursorDate={cursorDate}
                    selectedDate={selectedDate}
                    events={filteredEvents}
                    onSelectDate={setSelectedDate}
                    onEventClick={openEdit}
                  />
                )}
                {viewMode === "week" && (
                  <CalendarWeekView
                    cursorDate={cursorDate}
                    selectedDate={selectedDate}
                    events={filteredEvents}
                    onSelectDate={setSelectedDate}
                    onEventClick={openEdit}
                  />
                )}
                {viewMode === "day" && (
                  <CalendarDayView
                    selectedDate={selectedDate}
                    events={filteredEvents}
                    onEventClick={openEdit}
                  />
                )}
                {viewMode === "agenda" && (
                  <CalendarAgendaView
                    cursorDate={cursorDate}
                    events={filteredEvents}
                    onEventClick={openEdit}
                  />
                )}
                {(viewMode === "month" || viewMode === "week") && <CalendarLegend />}
              </>
            )}
          </div>

          <CalendarSidebar
            cursorDate={cursorDate}
            selectedDate={selectedDate}
            events={filteredEvents}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setCursorDate(new Date(date.getFullYear(), date.getMonth(), 1));
            }}
            onAddEvent={() => openCreate()}
            onEventClick={openEdit}
            onViewAgenda={() => {
              setViewMode("day");
              setSelectedDate(new Date());
            }}
            onViewUpcoming={() => setViewMode("agenda")}
          />
        </div>

        <AdminModal
          open={showForm}
          onClose={closeForm}
          title={editEvent ? "Edit event" : "New event"}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <AdminField
              label="Title"
              value={form.title}
              onChange={(v) => setForm({ ...form, title: v })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">
                  Event type
                </label>
                <select
                  value={form.event_type}
                  onChange={(e) =>
                    setForm({ ...form, event_type: e.target.value as CalendarEventType })
                  }
                  className="admin-input w-full"
                >
                  {CALENDAR_EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {EVENT_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="admin-input w-full"
                  required
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-[var(--admin-text-muted)]">
              <input
                type="checkbox"
                checked={form.all_day}
                onChange={(e) => setForm({ ...form, all_day: e.target.checked })}
              />
              All day event
            </label>
            {!form.all_day && (
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField
                  label="Start time"
                  value={form.startTime}
                  onChange={(v) => setForm({ ...form, startTime: v })}
                  hint="HH:MM (24h)"
                />
                <AdminField
                  label="End time"
                  value={form.endTime}
                  onChange={(v) => setForm({ ...form, endTime: v })}
                  hint="HH:MM (24h)"
                />
              </div>
            )}
            <AdminField
              label="Client / Company"
              value={form.client_name}
              onChange={(v) => setForm({ ...form, client_name: v })}
            />
            <AdminField
              label="Location"
              value={form.location}
              onChange={(v) => setForm({ ...form, location: v })}
            />
            <AdminField
              label="Meeting URL"
              value={form.meeting_url}
              onChange={(v) => setForm({ ...form, meeting_url: v })}
              hint="Shows Join button when set"
            />
            <AdminField
              label="Description"
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
              multiline
              rows={3}
            />
            {formError && <AdminAlert tone="error">{formError}</AdminAlert>}
            <div className="flex flex-wrap justify-between gap-2 border-t border-[var(--admin-border-subtle)] pt-4">
              {editEvent ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-300"
                  onClick={deleteEvent}
                >
                  Delete
                </Button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" className="admin-btn-ghost" onClick={closeForm}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="admin-btn-gold" disabled={saving}>
                  {saving ? "Saving…" : editEvent ? "Update Event" : "Create Event"}
                </Button>
              </div>
            </div>
          </form>
        </AdminModal>
        </div>
      </AdminPageContent>
    </div>
  );
}
