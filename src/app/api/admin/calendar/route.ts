import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth";
import { getCalendarSeedRows } from "@/lib/calendar/seed-events";
import type { CalendarEvent, CalendarEventType } from "@/lib/calendar/types";

type ProjectRow = {
  id: string;
  title: string;
  deadline: string | null;
  status: string;
  clients: { name: string } | { name: string }[] | null;
};

function clientName(clients: ProjectRow["clients"]) {
  if (!clients) return null;
  if (Array.isArray(clients)) return clients[0]?.name ?? null;
  return clients.name;
}

function mapProjectDeadline(project: ProjectRow): CalendarEvent | null {
  if (!project.deadline) return null;
  return {
    id: `project-${project.id}`,
    title: project.title,
    description: null,
    event_type: "deadline",
    starts_at: `${project.deadline}T12:00:00`,
    ends_at: null,
    all_day: true,
    location: null,
    meeting_url: null,
    client_name: clientName(project.clients),
    project_id: project.id,
    source: "project",
  };
}

export async function GET() {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const [{ data: events, error: eventsError }, { data: projects }] = await Promise.all([
    auth.supabase!
      .from("calendar_events")
      .select("*")
      .order("starts_at", { ascending: true }),
    auth.supabase!
      .from("projects")
      .select("id, title, deadline, status, clients(name)")
      .not("deadline", "is", null),
  ]);

  if (eventsError) {
    const missingTable =
      eventsError.message.includes("calendar_events") ||
      eventsError.code === "42P01" ||
      eventsError.code === "PGRST205";

    if (missingTable) {
      const projectEvents = (projects ?? [])
        .map(mapProjectDeadline)
        .filter(Boolean) as CalendarEvent[];

      return NextResponse.json({
        events: projectEvents,
        migrationRequired: true,
        migrationHint: "Run supabase/calendar-upgrade.sql in Supabase SQL Editor to enable full calendar features.",
      });
    }

    return NextResponse.json({ error: eventsError.message }, { status: 500 });
  }

  const calendarEvents: CalendarEvent[] = (events ?? []).map((e) => ({
    ...e,
    source: "calendar" as const,
  }));

  const projectEvents = (projects ?? [])
    .map(mapProjectDeadline)
    .filter(Boolean) as CalendarEvent[];

  const merged = [...calendarEvents, ...projectEvents].sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  );

  return NextResponse.json({ events: merged });
}

export async function POST(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();

  if (body.action === "seed") {
    const { count } = await auth.supabase!
      .from("calendar_events")
      .select("*", { count: "exact", head: true });

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: "Calendar events already exist. Delete them first if you want to re-import." },
        { status: 400 },
      );
    }

    const { data: items, error } = await auth.supabase!
      .from("calendar_events")
      .insert(getCalendarSeedRows())
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ events: items, message: "Sample calendar events imported." });
  }

  const {
    title,
    description,
    event_type,
    starts_at,
    ends_at,
    all_day,
    location,
    meeting_url,
    client_name,
    project_id,
  } = body;

  if (!title || !starts_at || !event_type) {
    return NextResponse.json(
      { error: "Title, start time, and event type are required" },
      { status: 400 },
    );
  }

  const { data: event, error } = await auth.supabase!
    .from("calendar_events")
    .insert({
      title,
      description: description ?? null,
      event_type: event_type as CalendarEventType,
      starts_at,
      ends_at: ends_at ?? null,
      all_day: all_day ?? false,
      location: location ?? null,
      meeting_url: meeting_url ?? null,
      client_name: client_name ?? null,
      project_id: project_id ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ event }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id || String(id).startsWith("project-")) {
    return NextResponse.json(
      { error: "Project deadlines must be edited on the Projects page." },
      { status: 400 },
    );
  }

  const { data: event, error } = await auth.supabase!
    .from("calendar_events")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ event });
}

export async function DELETE(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id || id.startsWith("project-")) {
    return NextResponse.json(
      { error: "Project deadlines must be edited on the Projects page." },
      { status: 400 },
    );
  }

  const { error } = await auth.supabase!.from("calendar_events").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
