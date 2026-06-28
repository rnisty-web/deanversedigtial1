"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const HEARTBEAT_INTERVAL_MS = 60 * 1000;

async function sendHeartbeat() {
  if (typeof document !== "undefined" && document.visibilityState !== "visible") {
    return;
  }

  try {
    await fetch("/api/presence/heartbeat", {
      method: "POST",
      credentials: "same-origin",
    });
  } catch {
    // Non-critical — ignore network errors
  }
}

export function PresenceHeartbeat() {
  const pathname = usePathname();

  useEffect(() => {
    sendHeartbeat();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sendHeartbeat();
      }
    };

    const onFocus = () => {
      sendHeartbeat();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        sendHeartbeat();
      }
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, [pathname]);

  return null;
}
