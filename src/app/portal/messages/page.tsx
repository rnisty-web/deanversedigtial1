"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminField } from "@/components/admin/AdminField";
import { Button } from "@/components/ui/Button";
import { PortalModal } from "@/components/portal/PortalModal";
import { PortalPageContent } from "@/components/portal/PortalPageContent";
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { PortalCard } from "@/components/portal/PortalCard";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  subject: string | null;
  content: string;
  read: boolean;
  created_at: string;
  project_id: string | null;
  sender_id: string;
  recipient_id: string;
  sender?: { full_name: string | null; email: string };
};

type Project = { id: string; title: string };

export default function PortalMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [projectId, setProjectId] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

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
    setMessages(msgData.messages ?? []);

    if (fileRes.ok) {
      const fileData = await fileRes.json();
      setProjects(fileData.projects ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const filtered = useMemo(
    () => (filter === "unread" ? messages.filter((m) => !m.read) : messages),
    [messages, filter],
  );

  const selected = filtered.find((m) => m.id === selectedId) ?? filtered[0] ?? null;

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filtered.some((m) => m.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  async function markRead(id: string) {
    const msg = messages.find((m) => m.id === id);
    if (!msg || msg.read) return;

    const res = await fetch("/api/portal/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id, read: true }),
    });

    if (res.ok) {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
    }
  }

  async function handleSelect(id: string) {
    setSelectedId(id);
    setMobileDetailOpen(true);
    await markRead(id);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setSendError(null);

    const res = await fetch("/api/portal/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        subject,
        content,
        project_id: projectId || null,
      }),
    });

    setSending(false);

    if (res.ok) {
      setShowCompose(false);
      setSubject("");
      setContent("");
      setProjectId("");
      fetchMessages();
      return;
    }

    const data = await res.json().catch(() => ({}));
    setSendError(data.error ?? "Failed to send message");
  }

  const unreadCount = messages.filter((m) => !m.read).length;
  const tabs = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread", count: unreadCount },
  ];

  return (
    <PortalPageContent>
      <PortalPageHeader
        title="Messages"
        subtitle="Direct line to your DeanVerse project team — questions, feedback, and updates."
        breadcrumb={[
          { label: "Dashboard", href: "/portal" },
          { label: "Messages" },
        ]}
        tabs={tabs}
        activeTab={filter}
        onTabChange={(id) => setFilter(id as "all" | "unread")}
        actions={
          <Button size="sm" className="admin-btn-gold" onClick={() => setShowCompose(true)}>
            Compose
          </Button>
        }
      />

      {error && (
        <AdminAlert tone="error" className="mb-4">
          {error}
        </AdminAlert>
      )}

      {loading ? (
        <div className="portal-messages-layout">
          <div className="admin-luxury-card h-96 animate-pulse" />
          <div className="admin-luxury-card h-96 animate-pulse" />
        </div>
      ) : filtered.length === 0 ? (
        <PortalCard padding="lg" className="text-center">
          <p className="text-[var(--admin-text-muted)]">Your inbox is empty.</p>
          <Button size="sm" className="admin-btn-gold mt-4" onClick={() => setShowCompose(true)}>
            Send your first message
          </Button>
        </PortalCard>
      ) : (
        <div className={cn("portal-messages-layout", mobileDetailOpen && "max-lg:[&>:first-child]:hidden")}>
          <PortalCard padding="none" className="overflow-hidden">
            <ul className="max-h-[70vh] overflow-y-auto lg:max-h-[560px]">
              {filtered.map((msg) => (
                <li key={msg.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(msg.id)}
                    className={cn(
                      "portal-message-list-item",
                      selected?.id === msg.id && "portal-message-list-item-active",
                      !msg.read && "portal-message-list-item-unread",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-medium text-[var(--admin-text)]">
                        {msg.subject ?? "No subject"}
                      </p>
                      {!msg.read && (
                        <span className="admin-nav-badge shrink-0 !min-w-0 px-2 py-0.5 text-[10px]">New</span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-[var(--admin-text-muted)]">
                      {msg.sender?.full_name ?? msg.sender?.email ?? "Team"}
                    </p>
                    <p className="mt-1 text-[11px] text-[var(--admin-text-muted)]">
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </PortalCard>

          <PortalCard padding="lg" className={cn(!mobileDetailOpen && "hidden lg:block")}>
            {selected ? (
              <>
                <button
                  type="button"
                  onClick={() => setMobileDetailOpen(false)}
                  className="admin-btn-ghost mb-4 inline-flex min-h-[44px] items-center gap-2 px-3 py-2 text-sm lg:hidden"
                >
                  ← Back to inbox
                </button>
                <div className="mb-4 border-b border-[var(--admin-border-subtle)] pb-4">
                  <h2 className="text-xl font-semibold text-[var(--admin-text)]">
                    {selected.subject ?? "No subject"}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
                    {selected.sender?.full_name ?? selected.sender?.email ?? "Unknown"} ·{" "}
                    {new Date(selected.created_at).toLocaleString()}
                  </p>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--admin-text)]/85">
                  {selected.content}
                </p>
              </>
            ) : (
              <p className="text-[var(--admin-text-muted)]">Select a message</p>
            )}
          </PortalCard>
        </div>
      )}

      <PortalModal
        open={showCompose}
        onClose={() => setShowCompose(false)}
        title="New message"
        size="md"
        footer={null}
      >
        <form id="compose-message-form" onSubmit={handleSend} className="space-y-4">
          {projects.length > 0 && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">
                Project (optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="admin-input admin-entity-select w-full"
              >
                <option value="">General inquiry</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <AdminField label="Subject" value={subject} onChange={setSubject} placeholder="What is this about?" />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">Message</label>
            <textarea
              required
              placeholder="Your message"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="admin-input min-h-[140px] resize-y"
              rows={6}
            />
          </div>
          {sendError && <AdminAlert tone="error">{sendError}</AdminAlert>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" className="admin-btn-ghost" onClick={() => setShowCompose(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" className="admin-btn-gold" disabled={sending}>
              {sending ? "Sending…" : "Send message"}
            </Button>
          </div>
        </form>
      </PortalModal>
    </PortalPageContent>
  );
}
