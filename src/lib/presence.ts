export type PresenceStatus = "online" | "away" | "offline";

/** Active tab heartbeat within this window → online */
export const ONLINE_MS = 3 * 60 * 1000;
/** Last seen within this window but not online → away */
export const AWAY_MS = 30 * 60 * 1000;

export type PresenceConfig = {
  label: string;
  shortLabel: string;
  hint: string;
  pillClass: string;
  dotClass: string;
  textClass: string;
};

export function getPresenceStatus(lastSeenAt: string | null | undefined): PresenceStatus {
  if (!lastSeenAt) return "offline";

  const elapsed = Date.now() - new Date(lastSeenAt).getTime();
  if (elapsed <= ONLINE_MS) return "online";
  if (elapsed <= AWAY_MS) return "away";
  return "offline";
}

export function getPresenceConfig(status: PresenceStatus): PresenceConfig {
  switch (status) {
    case "online":
      return {
        label: "Online",
        shortLabel: "Online",
        hint: "Active in the last 3 minutes",
        pillClass: "presence-pill presence-pill--online",
        dotClass: "presence-dot presence-dot--online",
        textClass: "presence-text presence-text--online",
      };
    case "away":
      return {
        label: "Away",
        shortLabel: "Away",
        hint: "Seen within the last 30 minutes",
        pillClass: "presence-pill presence-pill--away",
        dotClass: "presence-dot presence-dot--away",
        textClass: "presence-text presence-text--away",
      };
    case "offline":
      return {
        label: "Offline",
        shortLabel: "Offline",
        hint: "Not seen in the last 30 minutes",
        pillClass: "presence-pill presence-pill--offline",
        dotClass: "presence-dot presence-dot--offline",
        textClass: "presence-text presence-text--offline",
      };
  }
}

export function getPresenceLabel(status: PresenceStatus): string {
  return getPresenceConfig(status).label;
}

export function getPresenceDotClass(status: PresenceStatus): string {
  return getPresenceConfig(status).dotClass;
}

export function formatLastSeen(lastSeenAt: string | null | undefined): string {
  if (!lastSeenAt) return "Never seen";

  const elapsed = Date.now() - new Date(lastSeenAt).getTime();
  const minutes = Math.floor(elapsed / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  return new Date(lastSeenAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
