"use client";

import { cn } from "@/lib/utils";
import type { CalendarEventType } from "@/lib/calendar/types";
import { EVENT_TYPE_LABELS } from "@/lib/calendar/types";

type CalendarFilterBarProps = {
  activeTypes: CalendarEventType[] | "all";
  onChange: (types: CalendarEventType[] | "all") => void;
};

const ALL_TYPES: CalendarEventType[] = ["meeting", "call", "deadline", "internal"];

export function CalendarFilterBar({ activeTypes, onChange }: CalendarFilterBarProps) {
  function toggle(type: CalendarEventType) {
    if (activeTypes === "all") {
      onChange(ALL_TYPES.filter((t) => t !== type));
      return;
    }
    if (activeTypes.includes(type)) {
      const next = activeTypes.filter((t) => t !== type);
      onChange(next.length === 0 ? "all" : next);
      return;
    }
    const next = [...activeTypes, type];
    onChange(next.length === ALL_TYPES.length ? "all" : next);
  }

  return (
    <div className="admin-calendar-filter-bar">
      <button
        type="button"
        onClick={() => onChange("all")}
        className={cn(
          "admin-calendar-filter-chip",
          activeTypes === "all" && "admin-calendar-filter-chip-active",
        )}
      >
        All types
      </button>
      {ALL_TYPES.map((type) => {
        const active = activeTypes === "all" || activeTypes.includes(type);
        return (
          <button
            key={type}
            type="button"
            onClick={() => toggle(type)}
            className={cn(
              "admin-calendar-filter-chip",
              active && "admin-calendar-filter-chip-active",
              type === "meeting" && active && "admin-calendar-filter-meeting",
              type === "call" && active && "admin-calendar-filter-call",
              type === "deadline" && active && "admin-calendar-filter-deadline",
              type === "internal" && active && "admin-calendar-filter-internal",
            )}
          >
            {EVENT_TYPE_LABELS[type]}
          </button>
        );
      })}
    </div>
  );
}
