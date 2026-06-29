"use client";

import type { Conversation } from "@/lib/messages/utils";
import {
  formatRelativeTime,
  initials,
  profileName,
  truncatePreview,
} from "@/lib/messages/utils";
import { cn } from "@/lib/utils";

type MessagesConversationListProps = {
  conversations: Conversation[];
  selectedKey: string | null;
  starredKeys: Set<string>;
  onSelect: (key: string) => void;
  onToggleStar: (key: string) => void;
  hidden?: boolean;
};

export function MessagesConversationList({
  conversations,
  selectedKey,
  starredKeys,
  onSelect,
  onToggleStar,
  hidden,
}: MessagesConversationListProps) {
  return (
    <aside className={cn("admin-messages-list-panel", hidden && "admin-messages-panel-hidden")}>
      <div className="admin-messages-list-header">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-text-muted)]">
          Conversations
        </p>
        <span className="text-xs text-[var(--admin-text-muted)]">{conversations.length}</span>
      </div>

      {conversations.length === 0 ? (
        <div className="admin-messages-empty-list">
          <p className="text-sm text-[var(--admin-text-muted)]">No conversations match your filters.</p>
        </div>
      ) : (
        <ul className="admin-messages-list">
          {conversations.map((conversation) => {
            const name = profileName(conversation.counterpart);
            const isActive = selectedKey === conversation.key;
            const isStarred = starredKeys.has(conversation.key);

            return (
              <li key={conversation.key}>
                <div
                  className={cn(
                    "admin-messages-list-item",
                    isActive && "admin-messages-list-item-active",
                    conversation.unreadCount > 0 && "admin-messages-list-item-unread",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(conversation.key)}
                    className="admin-messages-list-item-main"
                  >
                    <div className="admin-messages-avatar">{initials(name)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium text-[var(--admin-text)]">{name}</p>
                        <span className="shrink-0 text-[10px] text-[var(--admin-text-muted)]">
                          {formatRelativeTime(conversation.latestMessage.created_at)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-[var(--admin-gold-light)]">
                        {conversation.subject ?? "No subject"}
                      </p>
                      <p className="mt-1 truncate text-xs text-[var(--admin-text-muted)]">
                        {truncatePreview(conversation.latestMessage.content)}
                      </p>
                      {conversation.projectTitle ? (
                        <p className="mt-1 truncate text-[10px] text-[var(--admin-emerald)]">
                          {conversation.projectTitle}
                        </p>
                      ) : null}
                    </div>
                  </button>
                  <div className="admin-messages-list-item-actions">
                    <button
                      type="button"
                      aria-label={isStarred ? "Unstar conversation" : "Star conversation"}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStar(conversation.key);
                      }}
                      className={cn("admin-messages-star-btn", isStarred && "admin-messages-star-btn-active")}
                    >
                      <svg viewBox="0 0 24 24" fill={isStarred ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} aria-hidden>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                        />
                      </svg>
                    </button>
                    {conversation.unreadCount > 0 ? (
                      <span className="admin-messages-unread-badge">{conversation.unreadCount}</span>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
