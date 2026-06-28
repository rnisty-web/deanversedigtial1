"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

  return (
    <PortalPageContent>
      <PortalPageHeader
        title="Messages"
        subtitle="Direct line to your DeanVerse project team — questions, feedback, and updates."
        actions={
          <Button size="sm" onClick={() => setShowCompose(true)}>
            Compose
          </Button>
        }
      />

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mb-4 flex gap-2">
        {(["all", "unread"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "min-h-[44px] rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors",
              filter === key
                ? "bg-[#6f8f72]/25 text-[#a3c9a8]"
                : "bg-white/5 text-white/50 hover:text-white/70",
            )}
          >
            {key}
            {key === "unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-white/50">Loading inbox…</p>
      ) : filtered.length === 0 ? (
        <PortalCard padding="lg" className="text-center">
          <p className="text-white/60">Your inbox is empty.</p>
          <Button size="sm" className="mt-4" onClick={() => setShowCompose(true)}>
            Send your first message
          </Button>
        </PortalCard>
      ) : (
        <div className="grid gap-4 lg:min-h-[480px] lg:grid-cols-5">
          <PortalCard
            padding="sm"
            className={cn(
              "overflow-hidden p-0 lg:col-span-2",
              mobileDetailOpen && "hidden lg:block",
            )}
          >
            <ul className="max-h-[70vh] overflow-y-auto lg:max-h-[560px]">
              {filtered.map((msg) => (
                <li key={msg.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(msg.id)}
                    className={cn(
                      "w-full border-b border-white/[0.06] px-4 py-3 text-left transition-colors hover:bg-white/[0.03]",
                      selected?.id === msg.id && "bg-[#6f8f72]/10",
                      !msg.read && "border-l-2 border-l-[#6f8f72]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-medium text-white">
                        {msg.subject ?? "No subject"}
                      </p>
                      {!msg.read && (
                        <span className="shrink-0 rounded-full bg-[#6f8f72] px-2 py-0.5 text-[10px] text-white">
                          New
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-white/40">
                      {msg.sender?.full_name ?? msg.sender?.email ?? "Team"}
                    </p>
                    <p className="mt-1 text-[11px] text-white/30">
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </PortalCard>

          <PortalCard
            padding="lg"
            className={cn("lg:col-span-3", !mobileDetailOpen && "hidden lg:block")}
          >
            {selected ? (
              <>
                <button
                  type="button"
                  onClick={() => setMobileDetailOpen(false)}
                  className="mb-4 inline-flex min-h-[44px] items-center gap-2 text-sm text-[var(--accent)] lg:hidden"
                >
                  ← Back to inbox
                </button>
                <div className="mb-4 border-b border-white/[0.06] pb-4">
                  <h2 className="text-xl font-semibold text-white">
                    {selected.subject ?? "No subject"}
                  </h2>
                  <p className="mt-1 text-sm text-white/45">
                    {selected.sender?.full_name ?? selected.sender?.email ?? "Unknown"} ·{" "}
                    {new Date(selected.created_at).toLocaleString()}
                  </p>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/75">
                  {selected.content}
                </p>
              </>
            ) : (
              <p className="text-white/40">Select a message</p>
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
              <label className="mb-1.5 block text-xs font-medium text-white/50">Project (optional)</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white"
              >
                <option value="">General inquiry</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0f1a17]">
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white"
          />
          <textarea
            required
            placeholder="Your message"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white"
            rows={6}
          />
          {sendError && <p className="text-sm text-red-400">{sendError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setShowCompose(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={sending}>
              {sending ? "Sending…" : "Send message"}
            </Button>
          </div>
        </form>
      </PortalModal>
    </PortalPageContent>
  );
}
