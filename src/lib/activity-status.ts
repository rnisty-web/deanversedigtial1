export const ACTIVITY_STATUSES = [
  "Available",
  "Working on a project",
  "Contacting a client",
  "In a meeting",
  "Away",
] as const;

export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number];

export const DEFAULT_ACTIVITY_STATUS: ActivityStatus = "Available";

export function normalizeActivityStatus(
  value: string | null | undefined,
): ActivityStatus {
  if (!value) return DEFAULT_ACTIVITY_STATUS;
  const match = ACTIVITY_STATUSES.find(
    (s) => s.toLowerCase() === value.trim().toLowerCase(),
  );
  return match ?? DEFAULT_ACTIVITY_STATUS;
}

export function getActivityStatusBadgeClass(status: ActivityStatus | string): string {
  const base = "ring-1 backdrop-blur-sm";
  switch (normalizeActivityStatus(status)) {
    case "Available":
      return `${base} bg-emerald-500/15 text-emerald-300 ring-emerald-400/30`;
    case "Working on a project":
      return `${base} bg-blue-500/15 text-blue-300 ring-blue-400/30`;
    case "Contacting a client":
      return `${base} bg-violet-500/15 text-violet-300 ring-violet-400/30`;
    case "In a meeting":
      return `${base} bg-amber-500/15 text-amber-300 ring-amber-400/30`;
    case "Away":
      return `${base} bg-white/10 text-white/50 ring-white/15`;
    default:
      return `${base} bg-white/10 text-white/50 ring-white/15`;
  }
}
