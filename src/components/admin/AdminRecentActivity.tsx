"use client";

import { cn } from "@/lib/utils";

export type ActivityFeedItem = {
  type: "lead" | "invoice";
  message: string;
  timestamp: string;
};

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const typeStyles: Record<
  ActivityFeedItem["type"],
  { iconBg: string; iconColor: string; icon: React.ReactNode }
> = {
  lead: {
    iconBg: "bg-[var(--admin-emerald)]/20",
    iconColor: "text-[var(--admin-gold-light)]",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
        />
      </svg>
    ),
  },
  invoice: {
    iconBg: "bg-[var(--admin-gold-soft)]",
    iconColor: "text-[var(--admin-gold-light)]",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
    ),
  },
};

export function AdminRecentActivity({
  items,
  className,
}: {
  items: ActivityFeedItem[];
  className?: string;
}) {
  if (items.length === 0) {
    return (
      <p className={cn("text-sm text-[var(--admin-text-muted)]", className)}>
        No recent activity yet.
      </p>
    );
  }

  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((item, index) => {
        const style = typeStyles[item.type];
        return (
          <li
            key={`${item.type}-${item.timestamp}-${index}`}
            className="flex items-start gap-3 rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)]/50 px-3 py-2.5"
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                style.iconBg,
                style.iconColor,
              )}
            >
              {style.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug text-[var(--admin-text)]">{item.message}</p>
              <p className="mt-0.5 text-xs text-[var(--admin-text-muted)]">
                {formatRelativeTime(item.timestamp)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
