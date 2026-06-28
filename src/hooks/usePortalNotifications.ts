"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type PortalNotificationCounts = {
  unreadMessages: number;
  unpaidInvoices: number;
  overdueInvoices: number;
};

const POLL_MS = 60_000;

export function usePortalNotifications() {
  const pathname = usePathname();
  const [counts, setCounts] = useState<PortalNotificationCounts>({
    unreadMessages: 0,
    unpaidInvoices: 0,
    overdueInvoices: 0,
  });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/portal/notifications", {
        credentials: "same-origin",
      });
      if (res.ok) {
        const data = (await res.json()) as PortalNotificationCounts;
        setCounts(data);
      }
    } catch {
      // Ignore transient network errors
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_MS);
    return () => clearInterval(interval);
  }, [refresh, pathname]);

  return counts;
}
