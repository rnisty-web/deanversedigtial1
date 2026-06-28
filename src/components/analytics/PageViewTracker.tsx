"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const sessionId =
      sessionStorage.getItem("dvd_session") ??
      (() => {
        const id = crypto.randomUUID();
        sessionStorage.setItem("dvd_session", id);
        return id;
      })();

    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page_path: pathname, session_id: sessionId }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
