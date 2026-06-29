"use client";

import Link from "next/link";
import type { Conversation } from "@/lib/messages/utils";
import {
  formatMessageDate,
  formatRelativeTime,
  initials,
  profileEmail,
  profileName,
  threadMessages,
} from "@/lib/messages/utils";
import { cn } from "@/lib/utils";

type MessagesContactPanelProps = {
  conversation: Conversation | null;
  starred: boolean;
  onToggleStar: () => void;
  hidden?: boolean;
};

export function MessagesContactPanel({
  conversation,
  starred,
  onToggleStar,
  hidden,
}: MessagesContactPanelProps) {
  if (!conversation) {
    return (
      <aside className={cn("admin-messages-contact-panel", hidden && "admin-messages-panel-hidden")}>
        <div className="admin-messages-contact-empty">
          <p className="text-sm text-[var(--admin-text-muted)]">Contact details appear here when you open a thread.</p>
        </div>
      </aside>
    );
  }

  const name = profileName(conversation.counterpart);
  const email = profileEmail(conversation.counterpart);
  const thread = threadMessages(conversation);
  const started = thread[0]?.created_at;
  const lastActivity = conversation.latestMessage.created_at;

  return (
    <aside className={cn("admin-messages-contact-panel", hidden && "admin-messages-panel-hidden")}>
      <div className="admin-messages-contact-card">
        <div className="admin-messages-contact-profile">
          <div className="admin-messages-avatar admin-messages-avatar-lg">{initials(name)}</div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-[var(--admin-text)]">{name}</p>
            <p className="truncate text-sm text-[var(--admin-text-muted)]">{email || "No email on file"}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleStar}
          className={cn("admin-messages-contact-star", starred && "admin-messages-contact-star-active")}
        >
          <svg viewBox="0 0 24 24" fill={starred ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
          {starred ? "Starred" : "Star conversation"}
        </button>
      </div>

      <div className="admin-messages-contact-section">
        <p className="admin-messages-contact-title">Conversation</p>
        <dl className="admin-messages-contact-meta">
          <div>
            <dt>Messages</dt>
            <dd>{thread.length}</dd>
          </div>
          <div>
            <dt>Unread</dt>
            <dd>{conversation.unreadCount}</dd>
          </div>
          {started ? (
            <div>
              <dt>Started</dt>
              <dd>{formatMessageDate(started)}</dd>
            </div>
          ) : null}
          <div>
            <dt>Last activity</dt>
            <dd>{formatRelativeTime(lastActivity)}</dd>
          </div>
          {conversation.subject ? (
            <div>
              <dt>Subject</dt>
              <dd className="break-words">{conversation.subject}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      {conversation.projectId ? (
        <div className="admin-messages-contact-section">
          <p className="admin-messages-contact-title">Linked project</p>
          <p className="text-sm text-[var(--admin-text)]">{conversation.projectTitle ?? "Project"}</p>
          <Link href="/admin/projects" className="admin-messages-contact-link">
            View projects →
          </Link>
        </div>
      ) : null}

      {email ? (
        <div className="admin-messages-contact-section">
          <p className="admin-messages-contact-title">Quick actions</p>
          <a href={`mailto:${email}`} className="admin-messages-quick-link">
            Email {name.split(" ")[0] || "client"}
          </a>
        </div>
      ) : null}
    </aside>
  );
}
