"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminField } from "@/components/admin/AdminField";
import { MessagesChatPanel } from "@/components/admin/messages/MessagesChatPanel";
import { ConversationListPanel } from "@/components/messages/ConversationListPanel";
import { Button } from "@/components/ui/Button";
import { PortalModal } from "@/components/portal/PortalModal";
import { PortalPageShell } from "@/components/portal/PortalPageShell";
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { PortalCard } from "@/components/portal/PortalCard";
import { useMessageRealtime } from "@/hooks/useMessageRealtime";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { mergeIncomingMessage } from "@/lib/messages/realtime";
import type { MessageRecord } from "@/lib/messages/utils";
import {
  groupConversations,
  profileName,
  replySubjectForConversation,
} from "@/lib/messages/utils";
import type { PortalMessageRecipient } from "@/lib/portal/message-recipients";

import { cn } from "@/lib/utils";

type Project = { id: string; title: string };

export default function PortalMessagesPage() {
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [recipients, setRecipients] = useState<PortalMessageRecipient[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [projectId, setProjectId] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [composeSending, setComposeSending] = useState(false);
  const [composeError, setComposeError] = useState<string | null>(null);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [msgRes, fileRes] = await Promise.all([
      fetch("/api/portal/messages", { credentials: "same-origin" }),
      fetch("/api/portal/files", { credentials: "same-origin" }),
    ]);

    if (!msgRes.ok) {
      const data = await msgRes.json().catch(() => ({}));
      setError(data.error ?? "Failed to load messages");
      setLoading(false);
      return;
    }

    const msgData = await msgRes.json();
    setUserId(msgData.userId ?? null);
    setMessages(msgData.messages ?? []);
    const loadedRecipients: PortalMessageRecipient[] = msgData.recipients ?? [];
    setRecipients(loadedRecipients);
    const defaultRecipient = loadedRecipients.find((item) => item.is_default) ?? loadedRecipients[0];
    if (defaultRecipient) {
      setRecipientId((current) => current || defaultRecipient.id);
    }

    if (fileRes.ok) {
      const fileData = await fileRes.json();
      setProjects(fileData.projects ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useMessageRealtime({
    userId,
    variant: "portal",
    enabled: !loading,
    setMessages,
  });

  const conversations = useMemo(
    () => groupConversations(messages, userId),
    [messages, userId],
  );

  const filtered = useMemo(
    () =>
      filter === "unread"
        ? conversations.filter((conversation) => conversation.unreadCount > 0)
        : conversations,
    [conversations, filter],
  );

  const selected =
    filtered.find((conversation) => conversation.key === selectedKey) ??
    filtered[0] ??
    null;

  const { typingLabel, notifyTyping, stopTyping } = useTypingIndicator(
    selected?.key ?? null,
    userId,
    selected ? profileName(selected.counterpart) : undefined,
  );

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedKey(null);
      return;
    }
    if (!selectedKey || !filtered.some((conversation) => conversation.key === selectedKey)) {
      setSelectedKey(filtered[0].key);
    }
  }, [filtered, selectedKey]);

  useEffect(() => {
    if (!selected) return;
    setReplyContent("");
    setSendError(null);
  }, [selected]);

  const markConversationRead = useCallback(
    async (conversationKey: string) => {
      const conversation = conversations.find((item) => item.key === conversationKey);
      if (!conversation || !userId) return;

      const unread = conversation.messages.filter(
        (message) => !message.read && message.recipient_id === userId,
      );
      if (unread.length === 0) return;

      const unreadIds = unread.map((message) => message.id);
      const res = await fetch("/api/portal/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ ids: unreadIds, read: true }),
      });

      if (res.ok) {
        setMessages((prev) =>
          prev.map((item) => (unreadIds.includes(item.id) ? { ...item, read: true } : item)),
        );
      }
    },
    [conversations, userId],
  );

  useEffect(() => {
    if (!selectedKey) return;
    void markConversationRead(selectedKey);
  }, [selectedKey, markConversationRead]);

  function handleSelect(key: string) {
    setSelectedKey(key);
    setMobileChatOpen(true);
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !replyContent.trim()) return;

    setSending(true);
    setSendError(null);

    const res = await fetch("/api/portal/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        subject: replySubjectForConversation(selected),
        content: replyContent,
        project_id: selected.projectId,
        recipient_id: selected.counterpart.id,
      }),
    });

    setSending(false);

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.message) {
        setMessages((prev) => mergeIncomingMessage(prev, data.message as MessageRecord));
      }
      setReplyContent("");
      stopTyping();
      setSelectedKey(selected.key);
      return;
    }

    const data = await res.json().catch(() => ({}));
    setSendError(data.error ?? "Failed to send message");
  }

  async function handleCompose(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !recipientId) return;

    setComposeSending(true);
    setComposeError(null);

    const res = await fetch("/api/portal/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        subject: subject || undefined,
        content,
        project_id: projectId || null,
        recipient_id: recipientId,
      }),
    });

    setComposeSending(false);

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.message) {
        setMessages((prev) => mergeIncomingMessage(prev, data.message as MessageRecord));
      }
      setShowCompose(false);
      setSubject("");
      setContent("");
      setProjectId("");
      const defaultRecipient = recipients.find((item) => item.is_default) ?? recipients[0];
      setRecipientId(defaultRecipient?.id ?? "");
      return;
    }

    const data = await res.json().catch(() => ({}));
    setComposeError(data.error ?? "Failed to send message");
  }

  const unreadCount = conversations.reduce(
    (sum, conversation) => sum + conversation.unreadCount,
    0,
  );

  const tabs = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread", count: unreadCount },
  ];

  return (
    <PortalPageShell
      className="flex min-h-0 flex-1 flex-col"
      contentClassName="portal-messages-page admin-messages-content flex min-h-0 flex-1 flex-col"
      header={
        <PortalPageHeader
          title="Messages"
          subtitle="Chat directly with your DeanVerse project team — fast replies, one thread."
          className="portal-messages-header"
          breadcrumb={[
            { label: "Dashboard", href: "/portal" },
            { label: "Messages" },
          ]}
          tabs={tabs}
          activeTab={filter}
          onTabChange={(id) => setFilter(id as "all" | "unread")}
          actions={
            <Button
              size="sm"
              className="admin-btn-gold"
              onClick={() => {
                const defaultRecipient = recipients.find((item) => item.is_default) ?? recipients[0];
                if (defaultRecipient) setRecipientId(defaultRecipient.id);
                setShowCompose(true);
              }}
              disabled={recipients.length === 0}
            >
              New message
            </Button>
          }
        />
      }
    >

      {error ? (
        <AdminAlert tone="error" className="mb-4">
          {error}
        </AdminAlert>
      ) : null}

      {loading ? (
        <div className="portal-messages-layout min-h-[40dvh] flex-1">
          <div className="admin-luxury-card min-h-[40dvh] flex-1 animate-pulse" />
        </div>
      ) : conversations.length === 0 ? (
        <PortalCard padding="lg" className="text-center">
          <p className="text-[var(--admin-text-muted)]">
            Start a conversation with your project team.
          </p>
          <Button
            size="sm"
            className="admin-btn-gold mt-4"
            onClick={() => setShowCompose(true)}
            disabled={recipients.length === 0}
          >
            Send your first message
          </Button>
        </PortalCard>
      ) : filtered.length === 0 ? (
        <PortalCard padding="lg" className="text-center">
          <p className="text-[var(--admin-text-muted)]">You&apos;re all caught up.</p>
        </PortalCard>
      ) : (
        <div className={cn("portal-messages-layout dm-layout min-h-0 flex-1", mobileChatOpen && "dm-layout-chat-open")}>
          <ConversationListPanel
            conversations={filtered}
            selectedKey={selected?.key ?? null}
            onSelect={handleSelect}
            hidden={mobileChatOpen}
            variant="portal"
            title="Inbox"
          />
          <MessagesChatPanel
            conversation={selected}
            userId={userId}
            replyContent={replyContent}
            sending={sending}
            sendError={sendError}
            onReplyContentChange={setReplyContent}
            onSubmit={handleReply}
            onTyping={notifyTyping}
            onStopTyping={stopTyping}
            typingLabel={typingLabel}
            onBack={() => setMobileChatOpen(false)}
            hidden={!mobileChatOpen}
            variant="portal"
          />
        </div>
      )}

      <PortalModal
        open={showCompose}
        onClose={() => setShowCompose(false)}
        title="New message"
        size="md"
        footer={null}
      >
        <form onSubmit={handleCompose} className="space-y-4">
          {recipients.length > 0 ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">
                Send to
              </label>
              <select
                required
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="admin-input admin-entity-select w-full"
              >
                <option value="" disabled>
                  Choose a team member…
                </option>
                {recipients.map((recipient) => (
                  <option key={recipient.id} value={recipient.id}>
                    {recipient.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <AdminAlert tone="warning">
              No team members are available to receive messages right now.
            </AdminAlert>
          )}
          {projects.length > 0 ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">
                Project (optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="admin-input admin-entity-select w-full"
              >
                <option value="">General message</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <AdminField
            label="Topic (optional)"
            value={subject}
            onChange={setSubject}
            placeholder="Only needed for a brand-new thread"
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">
              Message
            </label>
            <textarea
              required
              placeholder="Write your message…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="admin-input min-h-[140px] resize-y"
              rows={6}
            />
          </div>
          {composeError ? <AdminAlert tone="error">{composeError}</AdminAlert> : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className="admin-btn-ghost"
              onClick={() => setShowCompose(false)}
            >
              Cancel
            </Button>
            <Button size="sm" type="submit" className="admin-btn-gold" disabled={composeSending || !recipientId}>
              {composeSending ? "Sending…" : "Send message"}
            </Button>
          </div>
        </form>
      </PortalModal>
    </PortalPageShell>
  );
}
