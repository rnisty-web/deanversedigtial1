export type PresenceStatus = "online" | "away" | "offline";

/** Active tab heartbeat within this window → online */
export const ONLINE_MS = 3 * 60 * 1000;
/** Last seen within this window but not online → away */
export const AWAY_MS = 30 * 60 * 1000;

export function getPresenceStatus(lastSeenAt: string | null | undefined): PresenceStatus {
  if (!lastSeenAt) return "offline";

  const elapsed = Date.now() - new Date(lastSeenAt).getTime();
  if (elapsed <= ONLINE_MS) return "online";
  if (elapsed <= AWAY_MS) return "away";
  return "offline";
}

export function getPresenceLabel(status: PresenceStatus): string {
  switch (status) {
    case "online":
      return "Online";
    case "away":
      return "Away";
    case "offline":
      return "Offline";
  }
}

export function getPresenceDotClass(status: PresenceStatus): string {
  switch (status) {
    case "online":
      return "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]";
    case "away":
      return "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.4)]";
    case "offline":
      return "bg-white/25";
  }
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
