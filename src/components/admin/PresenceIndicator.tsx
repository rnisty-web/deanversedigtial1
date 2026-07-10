import { cn } from "@/lib/utils";
import {
  formatLastSeen,
  getPresenceConfig,
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

const dotSizeClasses = {
  sm: "presence-dot--sm",
  md: "presence-dot--md",
  lg: "presence-dot--lg",
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
  const config = getPresenceConfig(status);
  const isPill = showLabel || showLastSeen;

  if (!isPill) {
    return (
      <span
        className={cn("presence-dot-wrap", className)}
        title={`${config.label}${lastSeenAt ? ` · ${formatLastSeen(lastSeenAt)}` : ""}`}
      >
        <span
          className={cn(
            "presence-dot",
            config.dotClass,
            dotSizeClasses[size],
            prominent && status === "online" && "presence-dot--prominent",
          )}
          aria-hidden
        />
      </span>
    );
  }

  return (
    <span
      className={cn(config.pillClass, prominent && "presence-pill--prominent", className)}
      title={config.hint}
    >
      <span
        className={cn("presence-dot", config.dotClass, dotSizeClasses[size])}
        aria-hidden
      />
      <span className="presence-pill-content">
        {showLabel ? <span className={config.textClass}>{config.label}</span> : null}
        {showLastSeen ? (
          <span className="presence-meta">{formatLastSeen(lastSeenAt)}</span>
        ) : null}
      </span>
    </span>
  );
}

export function PresenceLegend({ className }: { className?: string }) {
  const items: { status: PresenceStatus }[] = [
    { status: "online" },
    { status: "away" },
    { status: "offline" },
  ];

  return (
    <div className={cn("presence-legend", className)} role="list" aria-label="Presence legend">
      {items.map(({ status }) => {
        const config = getPresenceConfig(status);
        return (
          <span
            key={status}
            role="listitem"
            className="presence-legend-chip"
            title={config.hint}
          >
            <span className={cn("presence-dot presence-dot--sm", config.dotClass)} aria-hidden />
            <span>{config.shortLabel}</span>
          </span>
        );
      })}
    </div>
  );
}

type PresenceStatProps = {
  status: PresenceStatus;
  count: number;
  className?: string;
};

export function PresenceStat({ status, count, className }: PresenceStatProps) {
  const config = getPresenceConfig(status);

  return (
    <div className={cn("presence-stat", `presence-stat--${status}`, className)}>
      <span className={cn("presence-dot presence-dot--md", config.dotClass)} aria-hidden />
      <div className="presence-stat-copy">
        <p className="presence-stat-value">{count}</p>
        <p className="presence-stat-label">{config.label}</p>
      </div>
    </div>
  );
}
