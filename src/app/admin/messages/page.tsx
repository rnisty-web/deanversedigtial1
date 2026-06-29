"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminField } from "@/components/admin/AdminField";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import { AdminSearchInput, AdminToolbar } from "@/components/admin/AdminToolbar";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ProfileRef = { id: string; full_name: string | null; email: string };
type ProjectRef = { title: string } | { title: string }[] | null;

type Message = {
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

function profileName(profile: ProfileRef | ProfileRef[] | null | undefined) {
  if (!profile) return "Unknown";
  const p = Array.isArray(profile) ? profile[0] : profile;
  return p?.full_name ?? p?.email ?? "Unknown";
}

function profileId(profile: ProfileRef | ProfileRef[] | null | undefined) {
  if (!profile) return null;
  const p = Array.isArray(profile) ? profile[0] : profile;
  return p?.id ?? null;
}

function projectTitle(projects: ProjectRef | undefined) {
  if (!projects) return null;
  return Array.isArray(projects) ? projects[0]?.title : projects.title;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    const qs = filter === "unread" ? "?unread=true" : "";
    const res = await fetch(`/api/admin/messages${qs}`, { credentials: "same-origin" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to load messages");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setMessages(data.messages ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter((m) =>
      [m.subject, m.content, profileName(m.sender), profileName(m.recipient), projectTitle(m.projects)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [messages, search]);

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

  useEffect(() => {
    if (!selected) return;
    setReplySubject(
      selected.subject?.startsWith("Re:")
        ? selected.subject
        : `Re: ${selected.subject ?? "Your message"}`,
    );
    setReplyContent("");
    setSendError(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- reset reply form when selection id changes
  }, [selected?.id]);

  async function markRead(id: string) {
    const msg = messages.find((m) => m.id === id);
    if (!msg || msg.read) return;

    const res = await fetch("/api/admin/messages", {
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

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !replyContent.trim()) return;

    const recipientId = profileId(selected.sender);
    if (!recipientId) {
      setSendError("Cannot reply — sender profile not found");
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
        project_id: selected.project_id,
        subject: replySubject,
        content: replyContent,
      }),
    });

    setSending(false);

    if (res.ok) {
      setReplyContent("");
      fetchMessages();
      return;
    }

    const data = await res.json().catch(() => ({}));
    setSendError(data.error ?? "Failed to send reply");
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <>
      <AdminHeader
        title="Messages"
        subtitle="Client inbox — read inquiries and reply without leaving the admin portal."
      />

      <AdminPageContent>
        {error && (
          <AdminAlert tone="error" className="mb-6">
            {error}
          </AdminAlert>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          {(["all", "unread"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm capitalize transition-all",
                filter === key
                  ? "admin-luxury-card border-[color-mix(in_srgb,var(--admin-gold)_35%,transparent)] text-[var(--admin-gold-light)]"
                  : "border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text-muted)]",
              )}
            >
              {key}
              {key === "unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
            </button>
          ))}
        </div>

        <AdminToolbar>
          <AdminSearchInput value={search} onChange={setSearch} placeholder="Search messages…" />
        </AdminToolbar>

        {loading ? (
          <AdminTableSkeleton />
        ) : filtered.length === 0 ? (
          <AdminEmptyState
            title="No messages"
            description="Client portal messages will appear here for staff to read and reply."
          />
        ) : (
          <div className="grid gap-6 xl:grid-cols-5">
            <div
              className={cn(
                "admin-luxury-card overflow-hidden rounded-3xl xl:col-span-2",
                mobileDetailOpen && "hidden xl:block",
              )}
            >
              <ul className="max-h-[70vh] overflow-y-auto xl:max-h-[600px]">
                {filtered.map((msg) => (
                  <li key={msg.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(msg.id)}
                      className={cn(
                        "w-full border-b border-[var(--admin-border-subtle)] px-5 py-4 text-left transition-colors hover:bg-[var(--admin-panel-hover)]",
                        selected?.id === msg.id &&
                          "bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]",
                        !msg.read && "border-l-2 border-l-[#6f8f72]",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium text-[var(--admin-text)]">
                          {msg.subject ?? "No subject"}
                        </p>
                        {!msg.read && (
                          <span className="shrink-0 rounded-full bg-[var(--admin-emerald)] px-2 py-0.5 text-[10px] text-[var(--admin-text)]">
                            New
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
                        From {profileName(msg.sender)}
                      </p>
                      {projectTitle(msg.projects) && (
                        <p className="mt-0.5 text-[11px] text-[var(--admin-gold-light)]">
                          {projectTitle(msg.projects)}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-[var(--admin-text-muted)]">
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className={cn(
                "admin-luxury-card rounded-3xl p-4 sm:p-6 xl:col-span-3",
                !mobileDetailOpen && "hidden xl:block",
              )}
            >
              {selected ? (
                <div className="space-y-6">
                  <button
                    type="button"
                    onClick={() => setMobileDetailOpen(false)}
                    className="inline-flex min-h-[44px] items-center gap-2 text-sm text-[var(--admin-gold-light)] xl:hidden"
                  >
                    ← Back to inbox
                  </button>
                  <div className="border-b border-[var(--admin-border-subtle)] pb-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-gold-light)]">
                      Message detail
                    </p>
                    <h2 className="mt-3 text-xl font-semibold text-[var(--admin-text)]">
                      {selected.subject ?? "No subject"}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--admin-text-muted)]">
                      {profileName(selected.sender)} → {profileName(selected.recipient)} ·{" "}
                      {new Date(selected.created_at).toLocaleString()}
                    </p>
                    {selected.project_id && (
                      <Link
                        href={`/admin/projects`}
                        className="mt-2 inline-block text-xs text-[var(--admin-gold-light)] hover:text-[var(--admin-text)]"
                      >
                        {projectTitle(selected.projects)
                          ? `Project: ${projectTitle(selected.projects)} →`
                          : "View projects →"}
                      </Link>
                    )}
                  </div>

                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--admin-text-muted)]">
                    {selected.content}
                  </p>

                  <form onSubmit={handleReply} className="space-y-4 border-t border-[var(--admin-border-subtle)] pt-5">
                    <p className="text-sm font-medium text-[var(--admin-text)]">Reply to client</p>
                    <AdminField
                      label="Subject"
                      value={replySubject}
                      onChange={setReplySubject}
                    />
                    <AdminField
                      label="Message"
                      value={replyContent}
                      onChange={setReplyContent}
                      multiline
                      rows={5}
                    />
                    {sendError && <p className="text-sm text-red-400">{sendError}</p>}
                    <div className="flex justify-end">
                      <Button size="sm" className="admin-btn-gold" type="submit" disabled={sending || !replyContent.trim()}>
                        {sending ? "Sending…" : "Send reply"}
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <AdminEmptyState
                  title="Select a message"
                  description="Choose a thread to read and reply."
                  className="border-none bg-transparent py-8"
                />
              )}
            </div>
          </div>
        )}
      </AdminPageContent>
    </>
  );
}
