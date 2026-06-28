"use client";

import { cn } from "@/lib/utils";
import type { PortalNotificationCounts } from "@/hooks/usePortalNotifications";

type BadgeKey = "messages" | "invoices";

function getBadgeCount(key: BadgeKey, counts: PortalNotificationCounts): number {
  if (key === "messages") return counts.unreadMessages;
  return counts.unpaidInvoices;
}

function isOverdue(key: BadgeKey, counts: PortalNotificationCounts): boolean {
  return key === "invoices" && counts.overdueInvoices > 0;
}

export function PortalNavBadge({
  badgeKey,
  counts,
  variant = "sidebar",
}: {
  badgeKey: BadgeKey;
  counts: PortalNotificationCounts;
  variant?: "sidebar" | "mobile";
}) {
  const count = getBadgeCount(badgeKey, counts);
  if (count <= 0) return null;

  const overdue = isOverdue(badgeKey, counts);
  const label =
    badgeKey === "messages"
      ? `${count} unread message${count === 1 ? "" : "s"}`
      : `${count} unpaid invoice${count === 1 ? "" : "s"}`;

  if (variant === "mobile") {
    return (
      <span
        className={cn(
          "ml-1.5 inline-flex min-w-[1.125rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
          overdue
            ? "bg-amber-500/90 text-[#0f1a17]"
            : "bg-white/20 text-white",
        )}
        aria-label={label}
      >
        {count > 9 ? "9+" : count}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "ml-auto inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ring-1",
        overdue
          ? "bg-amber-500/20 text-amber-200 ring-amber-400/30"
          : "bg-[var(--primary)]/25 text-[var(--accent)] ring-[var(--primary)]/40",
      )}
      aria-label={label}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function getNavBadgeKey(href: string): BadgeKey | null {
  if (href === "/portal/messages") return "messages";
  if (href === "/portal/invoices") return "invoices";
  return null;
}
