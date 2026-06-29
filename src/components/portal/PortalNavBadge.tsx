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

  return (
    <span
      className={cn(
        variant === "sidebar" ? "ml-auto" : "ml-1.5",
        overdue ? "bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/30" : "admin-nav-badge",
        variant === "mobile" && "min-w-[1.125rem] px-1.5 py-0.5",
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
