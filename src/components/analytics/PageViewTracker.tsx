"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function getDeviceType() {
  if (typeof navigator === "undefined") return "Unknown";
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "Tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera mini/i.test(ua)) return "Mobile";
  return "Desktop";
}

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
      body: JSON.stringify({
        page_path: pathname,
        session_id: sessionId,
        metadata: { device: getDeviceType() },
      }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
