export type ProfileRef = { id: string; full_name: string | null; email: string };
export type ProjectRef = { title: string } | { title: string }[] | null;

export type MessageRecord = {
  id: string;
  subject: string | null;
  content: string;
  read: boolean;
  created_at: string;
  project_id: string | null;
  sender_id: string;
  recipient_id: string;
  sender?: ProfileRef | ProfileRef[] | null;
  recipient?: ProfileRef | ProfileRef[] | null;
  projects?: ProjectRef;
};

export type Conversation = {
  key: string;
  messages: MessageRecord[];
  counterpart: ProfileRef;
  latestMessage: MessageRecord;
  unreadCount: number;
  projectId: string | null;
  projectTitle: string | null;
  subject: string | null;
};

const STARRED_STORAGE_KEY = "admin-messages-starred";

export function resolveProfile(profile: ProfileRef | ProfileRef[] | null | undefined): ProfileRef | null {
  if (!profile) return null;
  return Array.isArray(profile) ? profile[0] ?? null : profile;
}

export function profileName(profile: ProfileRef | ProfileRef[] | null | undefined) {
  const p = resolveProfile(profile);
  return p?.full_name?.trim() || p?.email || "Unknown";
}

export function profileEmail(profile: ProfileRef | ProfileRef[] | null | undefined) {
  return resolveProfile(profile)?.email ?? "";
}

export function profileId(profile: ProfileRef | ProfileRef[] | null | undefined) {
  return resolveProfile(profile)?.id ?? null;
}

export function projectTitle(projects: ProjectRef | undefined) {
  if (!projects) return null;
  return Array.isArray(projects) ? projects[0]?.title ?? null : projects.title;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";
}

export function conversationKey(msg: MessageRecord) {
  return [msg.sender_id, msg.recipient_id].sort().join(":");
}

export function getCounterpart(msg: MessageRecord, adminId: string | null): ProfileRef {
  const sender = resolveProfile(msg.sender);
  const recipient = resolveProfile(msg.recipient);
  if (adminId && msg.sender_id === adminId) {
    return recipient ?? { id: msg.recipient_id, full_name: null, email: "Unknown" };
  }
  if (adminId && msg.recipient_id === adminId) {
    return sender ?? { id: msg.sender_id, full_name: null, email: "Unknown" };
  }
  return sender ?? { id: msg.sender_id, full_name: null, email: "Unknown" };
}

export function groupConversations(messages: MessageRecord[], adminId: string | null): Conversation[] {
  const map = new Map<string, MessageRecord[]>();

  for (const msg of messages) {
    const key = conversationKey(msg);
    const existing = map.get(key);
    if (existing) existing.push(msg);
    else map.set(key, [msg]);
  }

  const conversations: Conversation[] = [];

  for (const [key, thread] of map) {
    const sorted = [...thread].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const latestMessage = sorted[0];
    const counterpart = getCounterpart(latestMessage, adminId);
    const unreadCount = thread.filter((m) => !m.read && m.recipient_id === adminId).length;
    const withProject = sorted.find((m) => m.project_id) ?? latestMessage;

    conversations.push({
      key,
      messages: thread,
      counterpart,
      latestMessage,
      unreadCount,
      projectId: withProject.project_id,
      projectTitle: projectTitle(withProject.projects),
      subject: latestMessage.subject,
    });
  }

  return conversations.sort(
    (a, b) => new Date(b.latestMessage.created_at).getTime() - new Date(a.latestMessage.created_at).getTime(),
  );
}

export function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatMessageDate(dateStr: string) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function formatMessageTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function truncatePreview(text: string, max = 72) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}

export function getStarredKeys(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STARRED_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function saveStarredKeys(keys: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STARRED_STORAGE_KEY, JSON.stringify([...keys]));
}

export function replySubjectForConversation(conversation: Conversation) {
  const subject = conversation.subject ?? "Your message";
  return subject.startsWith("Re:") ? subject : `Re: ${subject}`;
}

export function threadMessages(conversation: Conversation) {
  return [...conversation.messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

export type ThreadBubble = {
  id: string;
  content: string;
  created_at: string;
  subject?: string | null;
  isOutgoing: boolean;
};

export type BubbleGroup = {
  isOutgoing: boolean;
  bubbles: ThreadBubble[];
  timestamp: string;
};

export type ThreadSegment =
  | { type: "date"; label: string }
  | { type: "group"; group: BubbleGroup; showSubject: boolean };

export function toThreadBubble(
  msg: Pick<MessageRecord, "id" | "content" | "created_at" | "subject" | "sender_id">,
  userId: string | null,
): ThreadBubble {
  return {
    id: msg.id,
    content: msg.content,
    created_at: msg.created_at,
    subject: msg.subject,
    isOutgoing: userId ? msg.sender_id === userId : false,
  };
}

export function groupConsecutiveBubbles(messages: ThreadBubble[]): BubbleGroup[] {
  const groups: BubbleGroup[] = [];

  for (const message of messages) {
    const last = groups[groups.length - 1];
    if (last && last.isOutgoing === message.isOutgoing) {
      last.bubbles.push(message);
      last.timestamp = message.created_at;
    } else {
      groups.push({
        isOutgoing: message.isOutgoing,
        bubbles: [message],
        timestamp: message.created_at,
      });
    }
  }

  return groups;
}

export function buildThreadSegments(messages: ThreadBubble[]): ThreadSegment[] {
  const segments: ThreadSegment[] = [];
  let lastDate = "";
  let shownSubject = false;

  for (const group of groupConsecutiveBubbles(messages)) {
    const dateLabel = formatMessageDate(group.bubbles[0].created_at);
    if (dateLabel !== lastDate) {
      segments.push({ type: "date", label: dateLabel });
      lastDate = dateLabel;
    }

    const showSubject =
      !shownSubject &&
      !group.isOutgoing &&
      Boolean(group.bubbles[0]?.subject);

    if (showSubject) shownSubject = true;

    segments.push({ type: "group", group, showSubject });
  }

  return segments;
}

export function filterConversations(
  conversations: Conversation[],
  search: string,
  tab: "all" | "unread" | "starred",
  starredKeys: Set<string>,
) {
  let list = conversations;
  if (tab === "unread") list = list.filter((c) => c.unreadCount > 0);
  if (tab === "starred") list = list.filter((c) => starredKeys.has(c.key));

  const q = search.trim().toLowerCase();
  if (!q) return list;

  return list.filter((c) =>
    [
      c.subject,
      c.latestMessage.content,
      profileName(c.counterpart),
      profileEmail(c.counterpart),
      c.projectTitle,
    ]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q)),
  );
}

export function computeMessageStats(conversations: Conversation[], starredKeys: Set<string>) {
  const unread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeek = conversations.filter(
    (c) => new Date(c.latestMessage.created_at).getTime() >= weekAgo,
  ).length;

  return {
    total: conversations.length,
    unread,
    starred: conversations.filter((c) => starredKeys.has(c.key)).length,
    thisWeek,
  };
}
