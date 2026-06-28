export type CalendarEventType = "meeting" | "call" | "deadline" | "internal";

export type CalendarViewMode = "month" | "week" | "day" | "agenda";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: CalendarEventType;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  location: string | null;
  meeting_url: string | null;
  client_name: string | null;
  project_id: string | null;
  source?: "calendar" | "project";
  created_at?: string;
  updated_at?: string;
}

export const CALENDAR_EVENT_TYPES: CalendarEventType[] = [
  "meeting",
  "call",
  "deadline",
  "internal",
];

export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  meeting: "Meeting",
  call: "Call",
  deadline: "Deadline",
  internal: "Internal",
};
