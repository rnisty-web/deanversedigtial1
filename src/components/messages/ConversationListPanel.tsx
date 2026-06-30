"use client";

import type { Conversation } from "@/lib/messages/utils";
import {
  formatRelativeTime,
  profileName,
  truncatePreview,
} from "@/lib/messages/utils";
import { MessageAvatar } from "@/components/messages/MessageAvatar";
import { cn } from "@/lib/utils";

type ConversationListPanelProps = {
  conversations: Conversation[];
  selectedKey: string | null;
  starredKeys?: Set<string>;
  onSelect: (key: string) => void;
  onToggleStar?: (key: string) => void;
  hidden?: boolean;
  variant?: "admin" | "portal";
  title?: string;
  className?: string;
};

export function ConversationListPanel({
  conversations,
  selectedKey,
  starredKeys = new Set(),
  onSelect,
  onToggleStar,
  hidden,
  variant = "admin",
  title = "Messages",
  className,
}: ConversationListPanelProps) {
  const showStar = variant === "admin" && onToggleStar;

  return (
    <aside
      className={cn(
        "dm-list-panel",
        variant === "portal" && "dm-list-panel-portal",
        hidden && "dm-panel-hidden",
        className,
      )}
    >
      <div className="dm-list-header">
        <p className="dm-list-title">{title}</p>
        <span className="dm-list-count">{conversations.length}</span>
      </div>

      {conversations.length === 0 ? (
        <div className="dm-list-empty">
          <p>No conversations match your filters.</p>
        </div>
      ) : (
        <ul className="dm-list">
          {conversations.map((conversation) => {
            const name = profileName(conversation.counterpart);
            const isActive = selectedKey === conversation.key;
            const isStarred = starredKeys.has(conversation.key);
            const preview = truncatePreview(conversation.latestMessage.content, 56);
            const outgoing = conversation.latestMessage.sender_id !== conversation.counterpart.id;

            return (
              <li key={conversation.key}>
                <div
                  className={cn(
                    "dm-list-item",
                    isActive && "dm-list-item-active",
                    conversation.unreadCount > 0 && "dm-list-item-unread",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(conversation.key)}
                    className="dm-list-item-main"
                  >
                    <MessageAvatar name={name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-[var(--admin-text)]">
                          {name}
                        </p>
                        <span className="shrink-0 text-[10px] text-[var(--admin-text-muted)]">
                          {formatRelativeTime(conversation.latestMessage.created_at)}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-[var(--admin-text-muted)]">
                        {outgoing ? "You: " : ""}
                        {preview}
                      </p>
                      {conversation.projectTitle ? (
                        <p className="mt-1 truncate text-[10px] text-[var(--admin-emerald)]">
                          {conversation.projectTitle}
                        </p>
                      ) : null}
                    </div>
                  </button>
                  {showStar ? (
                    <div className="dm-list-item-actions">
                      <button
                        type="button"
                        aria-label={isStarred ? "Unstar conversation" : "Star conversation"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStar?.(conversation.key);
                        }}
                        className={cn("dm-star-btn", isStarred && "dm-star-btn-active")}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill={isStarred ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth={1.5}
                          aria-hidden
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                          />
                        </svg>
                      </button>
                      {conversation.unreadCount > 0 ? (
                        <span className="dm-unread-badge">{conversation.unreadCount}</span>
                      ) : null}
                    </div>
                  ) : conversation.unreadCount > 0 ? (
                    <div className="dm-list-item-actions">
                      <span className="dm-unread-badge">{conversation.unreadCount}</span>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
