"use client";

import { useEffect, useMemo, useRef } from "react";
import { AdminField } from "@/components/admin/AdminField";
import { Button } from "@/components/ui/Button";
import type { Conversation } from "@/lib/messages/utils";
import {
  formatMessageDate,
  formatMessageTime,
  profileName,
  threadMessages,
} from "@/lib/messages/utils";
import { cn } from "@/lib/utils";

type MessagesChatPanelProps = {
  conversation: Conversation | null;
  adminId: string | null;
  replySubject: string;
  replyContent: string;
  sending: boolean;
  sendError: string | null;
  onReplySubjectChange: (value: string) => void;
  onReplyContentChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack?: () => void;
  hidden?: boolean;
};

export function MessagesChatPanel({
  conversation,
  adminId,
  replySubject,
  replyContent,
  sending,
  sendError,
  onReplySubjectChange,
  onReplyContentChange,
  onSubmit,
  onBack,
  hidden,
}: MessagesChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const thread = useMemo(
    () => (conversation ? threadMessages(conversation) : []),
    [conversation],
  );

  const threadWithDates = useMemo(
    () =>
      thread.map((msg, index) => {
        const dateLabel = formatMessageDate(msg.created_at);
        const showDate =
          index === 0 || dateLabel !== formatMessageDate(thread[index - 1].created_at);
        return { msg, dateLabel, showDate };
      }),
    [thread],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [conversation?.key, thread.length]);

  if (!conversation) {
    return (
      <section className={cn("admin-messages-chat-panel", hidden && "admin-messages-panel-hidden")}>
        <div className="admin-messages-chat-empty">
          <div className="admin-messages-chat-empty-icon" aria-hidden>
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
            Choose a thread from the list to read messages and reply to your client.
          </p>
        </div>
      </section>
    );
  }

  const counterpartName = profileName(conversation.counterpart);

  return (
    <section className={cn("admin-messages-chat-panel", hidden && "admin-messages-panel-hidden")}>
      <div className="admin-messages-chat-header">
        {onBack ? (
          <button type="button" onClick={onBack} className="admin-messages-back-btn xl:hidden">
            ← Back
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-[var(--admin-text)]">{counterpartName}</p>
          <p className="truncate text-xs text-[var(--admin-text-muted)]">
            {conversation.subject ?? "No subject"}
            {conversation.projectTitle ? ` · ${conversation.projectTitle}` : ""}
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="admin-messages-chat-thread">
        {threadWithDates.map(({ msg, dateLabel, showDate }) => {
          const outgoing = adminId ? msg.sender_id === adminId : false;

          return (
            <div key={msg.id}>
              {showDate ? (
                <div className="admin-messages-date-separator">
                  <span>{dateLabel}</span>
                </div>
              ) : null}
              <div className={cn("admin-messages-bubble-row", outgoing && "admin-messages-bubble-row-out")}>
                <div className={cn("admin-messages-bubble", outgoing ? "admin-messages-bubble-out" : "admin-messages-bubble-in")}>
                  {!outgoing && msg.subject ? (
                    <p className="admin-messages-bubble-subject">{msg.subject}</p>
                  ) : null}
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  <p className="admin-messages-bubble-time">{formatMessageTime(msg.created_at)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={onSubmit} className="admin-messages-compose">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--admin-gold-light)]">
          Reply to {counterpartName}
        </p>
        <AdminField label="Subject" value={replySubject} onChange={onReplySubjectChange} />
        <AdminField
          label="Message"
          value={replyContent}
          onChange={onReplyContentChange}
          multiline
          rows={4}
        />
        {sendError ? <p className="text-sm text-red-400">{sendError}</p> : null}
        <div className="flex justify-end">
          <Button
            size="sm"
            className="admin-btn-gold"
            type="submit"
            disabled={sending || !replyContent.trim()}
          >
            {sending ? "Sending…" : "Send reply"}
          </Button>
        </div>
      </form>
    </section>
  );
}