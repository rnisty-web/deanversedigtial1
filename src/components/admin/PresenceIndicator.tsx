import { cn } from "@/lib/utils";
import {
  formatLastSeen,
  getPresenceDotClass,
  getPresenceLabel,
  getPresenceStatus,
  type PresenceStatus,
} from "@/lib/presence";

interface PresenceIndicatorProps {
  lastSeenAt: string | null | undefined;
  showLabel?: boolean;
  showLastSeen?: boolean;
  size?: "sm" | "md" | "lg";
  prominent?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
};

export function PresenceIndicator({
  lastSeenAt,
  showLabel = false,
  showLastSeen = false,
  size = "md",
  prominent = false,
  className,
}: PresenceIndicatorProps) {
  const status = getPresenceStatus(lastSeenAt);

  return (
    <span
      className={cn("inline-flex items-center gap-2", className)}
      title={`${getPresenceLabel(status)}${lastSeenAt ? ` · ${formatLastSeen(lastSeenAt)}` : ""}`}
    >
      <span
        className={cn(
          "shrink-0 rounded-full",
          sizeClasses[size],
          getPresenceDotClass(status),
          prominent &&
            status === "online" &&
            "ring-2 ring-[var(--admin-emerald)]/30 ring-offset-1 ring-offset-[var(--admin-bg)]",
        )}
        aria-hidden
      />
      {showLabel && (
        <span
          className={cn(
            "text-xs font-medium",
            status === "online" && "text-emerald-300",
            status === "away" && "text-amber-300",
            status === "offline" && "text-[var(--admin-text-muted)]",
          )}
        >
          {getPresenceLabel(status)}
        </span>
      )}
      {showLastSeen && (
        <span className="text-xs text-[var(--admin-text-muted)]">{formatLastSeen(lastSeenAt)}</span>
      )}
    </span>
  );
}

export function PresenceLegend({ className }: { className?: string }) {
  const items: { status: PresenceStatus; label: string }[] = [
    { status: "online", label: "Online (< 3 min, active tab)" },
    { status: "away", label: "Away (< 30 min)" },
    { status: "offline", label: "Offline (30+ min)" },
  ];

  return (
    <div className={cn("admin-luxury-card rounded-xl px-3 py-2", className)}>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-[var(--admin-text-muted)]">
        {items.map(({ status, label }) => (
          <span key={status} className="inline-flex items-center gap-1.5">
            <span className={cn("h-1.5 w-1.5 rounded-full", getPresenceDotClass(status))} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
