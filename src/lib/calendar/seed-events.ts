import type { CalendarEventType } from "./types";

type SeedRow = {
  title: string;
  event_type: CalendarEventType;
  dayOffset: number;
  hour: number;
  minute?: number;
  durationMin?: number;
  client_name?: string;
  location?: string;
  meeting_url?: string;
  all_day?: boolean;
};

function atOffset(base: Date, dayOffset: number, hour: number, minute = 0) {
  const d = new Date(base);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function getCalendarSeedRows(base = new Date()) {
  const rows: SeedRow[] = [
    { title: "Project Kickoff", event_type: "meeting", dayOffset: 1, hour: 11, client_name: "Elite Auto Works", location: "Online Meeting", meeting_url: "https://meet.google.com" },
    { title: "Client Call", event_type: "call", dayOffset: 3, hour: 10, client_name: "Luxury Living Co.", meeting_url: "https://zoom.us" },
    { title: "Q2 Review", event_type: "internal", dayOffset: 5, hour: 14, location: "Office" },
    { title: "Sprint Deadline", event_type: "deadline", dayOffset: 7, hour: 17, all_day: true, client_name: "Vellura Watches" },
    { title: "Design Review", event_type: "meeting", dayOffset: 10, hour: 9, client_name: "Bistro Maison" },
    { title: "Follow-up Call", event_type: "call", dayOffset: 12, hour: 15, client_name: "Noir Fashion", meeting_url: "https://zoom.us" },
    { title: "Team Standup", event_type: "internal", dayOffset: 14, hour: 9, location: "Internal" },
    { title: "Launch Deadline", event_type: "deadline", dayOffset: 18, hour: 17, all_day: true, client_name: "FinPay Mobile" },
    { title: "Strategy Session", event_type: "meeting", dayOffset: 20, hour: 11, client_name: "Explore More" },
    { title: "Client Presentation", event_type: "call", dayOffset: 24, hour: 13, client_name: "Analytics Dashboard", meeting_url: "https://meet.google.com" },
    { title: "Monthly Retrospective", event_type: "internal", dayOffset: 27, hour: 16 },
    { title: "Contract Review", event_type: "deadline", dayOffset: 30, hour: 17, all_day: true },
  ];

  return rows.map((row) => {
    const starts = atOffset(base, row.dayOffset, row.hour, row.minute ?? 0);
    let ends: string | null = null;
    if (!row.all_day && row.durationMin) {
      const end = new Date(starts);
      end.setMinutes(end.getMinutes() + row.durationMin);
      ends = end.toISOString();
    } else if (!row.all_day) {
      const end = new Date(starts);
      end.setHours(end.getHours() + 1);
      ends = end.toISOString();
    }

    return {
      title: row.title,
      description: null,
      event_type: row.event_type,
      starts_at: starts,
      ends_at: ends,
      all_day: row.all_day ?? false,
      location: row.location ?? null,
      meeting_url: row.meeting_url ?? null,
      client_name: row.client_name ?? null,
      project_id: null,
    };
  });
}
