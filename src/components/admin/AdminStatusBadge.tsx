import { cn } from "@/lib/utils";

const palettes: Record<string, string> = {
  new: "bg-[var(--admin-emerald)]/25 text-[var(--admin-gold-light)]",
  contacted: "bg-blue-500/15 text-blue-300",
  qualified: "bg-amber-500/15 text-amber-300",
  converted: "bg-emerald-500/15 text-emerald-300",
  lost: "bg-red-500/15 text-red-300",
  active: "bg-emerald-500/15 text-emerald-300",
  inactive: "bg-[var(--admin-panel-hover)] text-[var(--admin-text-muted)]",
  archived: "bg-[var(--admin-panel-hover)] text-[var(--admin-text-muted)]",
  draft: "bg-[var(--admin-panel-hover)] text-[var(--admin-text-muted)]",
  planning: "bg-blue-500/15 text-blue-300",
  in_progress: "bg-[var(--admin-emerald)]/25 text-[var(--admin-gold-light)]",
  review: "bg-amber-500/15 text-amber-300",
  completed: "bg-emerald-500/15 text-emerald-300",
  on_hold: "bg-orange-500/15 text-orange-300",
  cancelled: "bg-red-500/15 text-red-300",
  sent: "bg-blue-500/15 text-blue-300",
  paid: "bg-emerald-500/15 text-emerald-300",
  overdue: "bg-red-500/15 text-red-300",
};

export function AdminStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const label = status.replace(/_/g, " ");
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        palettes[status] ?? "bg-[var(--admin-panel-hover)] text-[var(--admin-text-muted)]",
        className,
      )}
    >
      {label}
    </span>
  );
}
