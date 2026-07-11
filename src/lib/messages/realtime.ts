import { getPortalSenderName } from "@/lib/portal/client-access";
import type { MessageRecord, ProfileRef } from "@/lib/messages/utils";
import { resolveProfile } from "@/lib/messages/utils";

export type RawMessageRow = {
  id: string;
  subject: string | null;
  content: string;
  read: boolean;
  created_at: string;
  project_id: string | null;
  sender_id: string;
  recipient_id: string;
};

export function buildProfileIndex(messages: MessageRecord[]): Map<string, ProfileRef> {
  const index = new Map<string, ProfileRef>();

  for (const msg of messages) {
    const sender = resolveProfile(msg.sender);
    const recipient = resolveProfile(msg.recipient);

    if (sender) index.set(msg.sender_id, sender);
    else index.set(msg.sender_id, { id: msg.sender_id, full_name: null, email: "" });

    if (recipient) index.set(msg.recipient_id, recipient);
    else index.set(msg.recipient_id, { id: msg.recipient_id, full_name: null, email: "" });
  }

  return index;
}

export function sanitizePortalMessageClient(
  message: MessageRecord,
  userId: string,
): MessageRecord {
  const senderProfile = resolveProfile(message.sender);
  const recipientProfile = resolveProfile(message.recipient);
  const isOutgoing = message.sender_id === userId;

  return {
    ...message,
    sender: {
      id: message.sender_id,
      full_name: isOutgoing ? "You" : getPortalSenderName(senderProfile),
      email: senderProfile?.email ?? "",
    },
    recipient: {
      id: message.recipient_id,
      full_name: isOutgoing
        ? getPortalSenderName(recipientProfile, "Team member")
        : "You",
      email: recipientProfile?.email ?? "",
    },
  };
}

export function enrichRealtimeMessage(
  row: RawMessageRow,
  existingMessages: MessageRecord[],
  variant: "admin" | "portal",
  userId: string,
): MessageRecord {
  const index = buildProfileIndex(existingMessages);
  const senderProfile =
    index.get(row.sender_id) ?? { id: row.sender_id, full_name: null, email: "" };
  const recipientProfile =
    index.get(row.recipient_id) ?? { id: row.recipient_id, full_name: null, email: "" };

  const base: MessageRecord = {
    id: row.id,
    subject: row.subject,
    content: row.content,
    read: row.read,
    created_at: row.created_at,
    project_id: row.project_id,
    sender_id: row.sender_id,
    recipient_id: row.recipient_id,
    sender: senderProfile,
    recipient: recipientProfile,
    projects: null,
  };

  if (variant === "portal") {
    return sanitizePortalMessageClient(base, userId);
  }

  return base;
}

function hasProfileData(profile: MessageRecord["sender"]): boolean {
  const resolved = resolveProfile(profile);
  return Boolean(resolved && (resolved.full_name || resolved.email));
}

export function mergeIncomingMessage(
  prev: MessageRecord[],
  incoming: MessageRecord,
): MessageRecord[] {
  const existing = prev.find((message) => message.id === incoming.id);
  if (!existing) return [incoming, ...prev];

  // A realtime row may land before the richer API response (or vice versa).
  // Upgrade the stored row field-by-field so profile names and project info
  // from the API payload are never discarded.
  const upgraded: MessageRecord = {
    ...existing,
    sender: hasProfileData(incoming.sender) ? incoming.sender : existing.sender,
    recipient: hasProfileData(incoming.recipient) ? incoming.recipient : existing.recipient,
    projects: incoming.projects ?? existing.projects,
  };

  return prev.map((message) => (message.id === incoming.id ? upgraded : message));
}
