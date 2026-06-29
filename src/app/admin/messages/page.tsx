"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import {
  MessagesAdminHeader,
  MessagesStatCard,
  MessagesTabs,
} from "@/components/admin/messages/MessagesAdminHeader";
import { MessagesChatPanel } from "@/components/admin/messages/MessagesChatPanel";
import { MessagesComposeModal } from "@/components/admin/messages/MessagesComposeModal";
import { MessagesContactPanel } from "@/components/admin/messages/MessagesContactPanel";
import { MessagesConversationList } from "@/components/admin/messages/MessagesConversationList";
import type { MessageRecord } from "@/lib/messages/utils";
import {
  computeMessageStats,
  filterConversations,
  getStarredKeys,
  groupConversations,
  profileId,
  replySubjectForConversation,
  saveStarredKeys,
} from "@/lib/messages/utils";

type ClientOption = { id: string; name: string; email: string };
type ProjectOption = { id: string; title: string; client_id: string };

const statIcons = {
  total: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
      />
    </svg>
  ),
  unread: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.981l7.5-4.039a2.25 2.25 0 012.134 0l7.5 4.039a2.25 2.25 0 011.183 1.98V18.75z"
      />
    </svg>
  ),
  starred: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  ),
  week: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  ),
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "unread" | "starred">("all");
  const [starredKeys, setStarredKeys] = useState<Set<string>>(() => getStarredKeys());
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeClientId, setComposeClientId] = useState("");
  const [composeProjectId, setComposeProjectId] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeContent, setComposeContent] = useState("");
  const [composeSending, setComposeSending] = useState(false);
  const [composeError, setComposeError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/messages", { credentials: "same-origin" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to load messages");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setMessages(data.messages ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    async function loadMeta() {
      const [accountRes, clientsRes, projectsRes] = await Promise.all([
        fetch("/api/admin/account", { credentials: "same-origin" }),
        fetch("/api/admin/clients", { credentials: "same-origin" }),
        fetch("/api/admin/projects", { credentials: "same-origin" }),
      ]);

      if (accountRes.ok) {
        const data = await accountRes.json();
        setAdminId(data.profile?.id ?? null);
      }
      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(
          (data.clients ?? []).map((c: ClientOption) => ({
            id: c.id,
            name: c.name,
            email: c.email,
          })),
        );
      }
      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(
          (data.projects ?? []).map((p: ProjectOption) => ({
            id: p.id,
            title: p.title,
            client_id: p.client_id,
          })),
        );
      }
    }
    loadMeta();
  }, []);

  const conversations = useMemo(
    () => groupConversations(messages, adminId),
    [messages, adminId],
  );

  const filtered = useMemo(
    () => filterConversations(conversations, search, tab, starredKeys),
    [conversations, search, tab, starredKeys],
  );

  const stats = useMemo(
    () => computeMessageStats(conversations, starredKeys),
    [conversations, starredKeys],
  );

  const selected =
    filtered.find((c) => c.key === selectedKey) ?? filtered[0] ?? null;

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedKey(null);
      return;
    }
    if (!selectedKey || !filtered.some((c) => c.key === selectedKey)) {
      setSelectedKey(filtered[0].key);
    }
  }, [filtered, selectedKey]);

  useEffect(() => {
    if (!selected) return;
    setReplySubject(replySubjectForConversation(selected));
    setReplyContent("");
    setSendError(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- reset reply form when conversation changes
  }, [selected?.key]);

  async function markConversationRead(conversationKey: string) {
    const conversation = conversations.find((c) => c.key === conversationKey);
    if (!conversation || !adminId) return;

    const unread = conversation.messages.filter((m) => !m.read && m.recipient_id === adminId);
    if (unread.length === 0) return;

    await Promise.all(
      unread.map(async (msg) => {
        const res = await fetch("/api/admin/messages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ id: msg.id, read: true }),
        });
        if (res.ok) {
          setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m)),
          );
        }
      }),
    );
  }

  async function handleSelect(key: string) {
    setSelectedKey(key);
    setMobileChatOpen(true);
    await markConversationRead(key);
  }

  function handleToggleStar(key: string) {
    setStarredKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      saveStarredKeys(next);
      return next;
    });
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !replyContent.trim()) return;

    const recipientId = profileId(selected.counterpart);
    if (!recipientId) {
      setSendError("Cannot reply — client profile not found");
      return;
    }

    setSending(true);
    setSendError(null);

    const res = await fetch("/api/admin/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        recipient_id: recipientId,
        project_id: selected.projectId,
        subject: replySubject,
        content: replyContent,
      }),
    });

    setSending(false);

    if (res.ok) {
      setReplyContent("");
      await fetchMessages();
      setSelectedKey(selected.key);
      return;
    }

    const data = await res.json().catch(() => ({}));
    setSendError(data.error ?? "Failed to send reply");
  }

  async function handleCompose(e: React.FormEvent) {
    e.preventDefault();
    if (!composeClientId || !composeContent.trim()) return;

    setComposeSending(true);
    setComposeError(null);

    const res = await fetch("/api/admin/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        client_id: composeClientId,
        project_id: composeProjectId || undefined,
        subject: composeSubject || undefined,
        content: composeContent,
      }),
    });

    setComposeSending(false);

    if (res.ok) {
      setComposeOpen(false);
      setComposeClientId("");
      setComposeProjectId("");
      setComposeSubject("");
      setComposeContent("");
      await fetchMessages();
      return;
    }

    const data = await res.json().catch(() => ({}));
    setComposeError(data.error ?? "Failed to send message");
  }

  function openCompose() {
    setComposeError(null);
    setComposeOpen(true);
  }

  return (
    <div className="admin-messages-page">
      <MessagesAdminHeader
        search={search}
        onSearchChange={setSearch}
        onNewMessage={openCompose}
      />

      <AdminPageContent className="admin-messages-content">
        {error ? (
          <AdminAlert tone="error" className="mb-6">
            {error}
          </AdminAlert>
        ) : null}

        <div className="admin-messages-stats">
          <MessagesStatCard label="Conversations" value={stats.total} icon={statIcons.total} />
          <MessagesStatCard
            label="Unread"
            value={stats.unread}
            hint={stats.unread ? "Needs attention" : "Inbox clear"}
            icon={statIcons.unread}
          />
          <MessagesStatCard label="Starred" value={stats.starred} icon={statIcons.starred} />
          <MessagesStatCard
            label="Active this week"
            value={stats.thisWeek}
            hint="Recent threads"
            icon={statIcons.week}
          />
        </div>

        <MessagesTabs
          tab={tab}
          onTabChange={setTab}
          unreadCount={stats.unread}
          starredCount={stats.starred}
        />

        {loading ? (
          <AdminTableSkeleton />
        ) : conversations.length === 0 ? (
          <AdminEmptyState
            title="No messages yet"
            description="Client portal messages will appear here for staff to read and reply."
          />
        ) : filtered.length === 0 ? (
          <AdminEmptyState
            title="No matching conversations"
            description="Try another tab or adjust your search."
          />
        ) : (
          <div className="admin-messages-layout">
            <MessagesConversationList
              conversations={filtered}
              selectedKey={selected?.key ?? null}
              starredKeys={starredKeys}
              onSelect={handleSelect}
              onToggleStar={handleToggleStar}
              hidden={mobileChatOpen}
            />
            <MessagesChatPanel
              conversation={selected}
              adminId={adminId}
              replySubject={replySubject}
              replyContent={replyContent}
              sending={sending}
              sendError={sendError}
              onReplySubjectChange={setReplySubject}
              onReplyContentChange={setReplyContent}
              onSubmit={handleReply}
              onBack={() => setMobileChatOpen(false)}
              hidden={!mobileChatOpen}
            />
            <MessagesContactPanel
              conversation={selected}
              starred={selected ? starredKeys.has(selected.key) : false}
              onToggleStar={() => selected && handleToggleStar(selected.key)}
              hidden={!mobileChatOpen}
            />
          </div>
        )}
      </AdminPageContent>

      <MessagesComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        clients={clients}
        projects={projects}
        clientId={composeClientId}
        projectId={composeProjectId}
        subject={composeSubject}
        content={composeContent}
        sending={composeSending}
        error={composeError}
        onClientChange={setComposeClientId}
        onProjectChange={setComposeProjectId}
        onSubjectChange={setComposeSubject}
        onContentChange={setComposeContent}
        onSubmit={handleCompose}
      />
    </div>
  );
}
