"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ACTIVITY_STATUSES,
  getActivityStatusBadgeClass,
  type ActivityStatus,
} from "@/lib/activity-status";
import { cn } from "@/lib/utils";

type ActivityStatusPickerProps = {
  value: ActivityStatus;
  onChange: (status: ActivityStatus) => void;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
};

export function ActivityStatusPicker({
  value,
  onChange,
  disabled = false,
  compact = false,
  className,
}: ActivityStatusPickerProps) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as ActivityStatus)}
        className={cn(
          "admin-input w-full appearance-none font-medium",
          "transition-all duration-200 hover:border-[color-mix(in_srgb,var(--admin-gold)_30%,transparent)]",
          "focus:border-[color-mix(in_srgb,var(--admin-gold)_40%,transparent)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-gold)]/20",
          compact ? "px-3 py-1.5 pr-8 text-xs" : "px-4 py-2.5 pr-10 text-sm",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        {ACTIVITY_STATUSES.map((status) => (
          <option key={status} value={status} className="bg-[var(--admin-bg)]">
            {status}
          </option>
        ))}
      </select>
      <svg
        className={cn(
          "pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]",
          compact ? "h-3.5 w-3.5" : "h-4 w-4",
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

export function ActivityStatusBadge({
  status,
  className,
}: {
  status: ActivityStatus | string;
  className?: string;
}) {
  const label = status || "Available";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        getActivityStatusBadgeClass(label),
        className,
      )}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}

export function ActivityStatusQuickPicker({ className }: { className?: string }) {
  const [status, setStatus] = useState<ActivityStatus>("Available");
  const [canEdit, setCanEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchStatus = useCallback(async () => {
    const res = await fetch("/api/admin/activity-status", { credentials: "same-origin" });
    if (!res.ok) {
      setLoaded(true);
      return;
    }
    const data = await res.json();
    setStatus(data.activityStatus ?? "Available");
    setCanEdit(Boolean(data.canEdit));
    setLoaded(true);
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  async function handleChange(next: ActivityStatus) {
    setStatus(next);
    if (!canEdit) return;

    setSaving(true);
    const res = await fetch("/api/admin/activity-status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ activity_status: next }),
    });
    setSaving(false);

    if (!res.ok) {
      fetchStatus();
    }
  }

  if (!loaded || !canEdit) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="hidden text-xs text-[var(--admin-text-muted)] sm:inline">Status</span>
      <ActivityStatusPicker
        value={status}
        onChange={handleChange}
        disabled={saving}
        compact
      />
    </div>
  );
}

export function useActivityStatus() {
  const [status, setStatus] = useState<ActivityStatus>("Available");
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/activity-status", { credentials: "same-origin" });
    if (res.ok) {
      const data = await res.json();
      setStatus(data.activityStatus ?? "Available");
      setCanEdit(Boolean(data.canEdit));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function save(next: ActivityStatus) {
    setStatus(next);
    if (!canEdit) return false;

    setSaving(true);
    const res = await fetch("/api/admin/activity-status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ activity_status: next }),
    });
    setSaving(false);

    if (!res.ok) {
      await refresh();
      return false;
    }
    return true;
  }

  return { status, canEdit, loading, saving, save, refresh };
}
