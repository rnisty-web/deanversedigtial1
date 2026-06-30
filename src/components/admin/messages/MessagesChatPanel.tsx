"use client";

import { useMemo } from "react";
import { MessageAvatar } from "@/components/messages/MessageAvatar";
import { MessageBubbleThread } from "@/components/messages/MessageBubbleThread";
import { MessageComposer } from "@/components/messages/MessageComposer";
import type { Conversation } from "@/lib/messages/utils";
import {
  profileName,
  threadMessages,
  toThreadBubble,
} from "@/lib/messages/utils";
import { cn } from "@/lib/utils";

type MessagesChatPanelProps = {
  conversation: Conversation | null;
  userId: string | null;
  replyContent: string;
  sending: boolean;
  sendError: string | null;
  onReplyContentChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack?: () => void;
  hidden?: boolean;
  variant?: "admin" | "portal";
};

export function MessagesChatPanel({
  conversation,
  userId,
  replyContent,
  sending,
  sendError,
  onReplyContentChange,
  onSubmit,
  onBack,
  hidden,
  variant = "admin",
}: MessagesChatPanelProps) {
  const thread = useMemo(() => {
    if (!conversation) return [];
    return threadMessages(conversation).map((msg) => toThreadBubble(msg, userId));
  }, [conversation, userId]);

  if (!conversation) {
    return (
      <section className={cn("dm-chat-panel", hidden && "dm-panel-hidden")}>
        <div className="dm-chat-empty">
          <div className="dm-chat-empty-icon" aria-hidden>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[var(--admin-text)]">Select a conversation</h2>
          <p className="mt-2 max-w-sm text-sm text-[var(--admin-text-muted)]">
            Pick a thread to read messages and reply in real time.
          </p>
        </div>
      </section>
    );
  }

  const counterpartName = profileName(conversation.counterpart);

  return (
    <section
      className={cn(
        "dm-chat-panel",
        variant === "portal" && "dm-chat-panel-portal",
        hidden && "dm-panel-hidden",
      )}
    >
      <div className="dm-chat-header">
        {onBack ? (
          <button type="button" onClick={onBack} className="dm-back-btn lg:hidden">
            ←
          </button>
        ) : null}
        <MessageAvatar name={counterpartName} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-[var(--admin-text)]">
            {counterpartName}
          </p>
          <p className="truncate text-xs text-[var(--admin-text-muted)]">
            {conversation.projectTitle ?? "Direct message"}
          </p>
        </div>
      </div>

      <MessageBubbleThread
        messages={thread}
        variant={variant}
        scrollKey={conversation.key}
        className="dm-chat-thread"
      />

      <MessageComposer
        value={replyContent}
        onChange={onReplyContentChange}
        onSubmit={onSubmit}
        sending={sending}
        error={sendError}
        placeholder={`Message ${counterpartName.split(" ")[0] ?? "team"}…`}
        variant={variant}
      />
    </section>
  );
}
