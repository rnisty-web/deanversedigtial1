"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminField } from "@/components/admin/AdminField";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import { AdminSearchInput, AdminToolbar } from "@/components/admin/AdminToolbar";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { Button } from "@/components/ui/Button";
import { projectStatuses } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Project = {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: string;
  budget: number | null;
  deadline: string | null;
  created_at: string;
  clients?: { name: string; email: string };
};

type Client = { id: string; name: string; email: string };

const emptyForm = {
  client_id: "",
  title: "",
  description: "",
  status: "draft",
  budget: "",
  deadline: "",
};

function AdminProjectsInner() {
  const searchParams = useSearchParams();
  const clientFilter = searchParams.get("client") ?? "all";

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/projects", { credentials: "same-origin" });
    if (res.ok) {
      const data = await res.json();
      setProjects(data.projects ?? []);
      setClients(data.clients ?? []);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to load projects");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (clientFilter !== "all" && p.client_id !== clientFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!q) return true;
      return [p.title, p.description, p.clients?.name, p.clients?.email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [projects, search, statusFilter, clientFilter]);

  const statusCounts = useMemo(() => {
    const base = clientFilter === "all" ? projects : projects.filter((p) => p.client_id === clientFilter);
    const map: Record<string, number> = { all: base.length };
    projectStatuses.forEach((s) => {
      map[s] = base.filter((p) => p.status === s).length;
    });
    return map;
  }, [projects, clientFilter]);

  function openCreate() {
    setEditId(null);
    setForm({ ...emptyForm, client_id: clientFilter !== "all" ? clientFilter : "" });
    setShowForm(true);
  }

  function startEdit(project: Project) {
    setEditId(project.id);
    setForm({
      client_id: project.client_id,
      title: project.title,
      description: project.description ?? "",
      status: project.status,
      budget: project.budget?.toString() ?? "",
      deadline: project.deadline ?? "",
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const method = editId ? "PATCH" : "POST";
    const body = editId ? { id: editId, ...form } : form;

    const res = await fetch("/api/admin/projects", {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (res.ok) {
      closeForm();
      fetchData();
    }
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch("/api/admin/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      fetchData();
      if (selected?.id === id) setSelected((prev) => (prev ? { ...prev, status } : prev));
    }
  }

  async function deleteProject(id: string) {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/admin/projects?id=${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (selected?.id === id) setSelected(null);
    fetchData();
  }

  return (
    <>
      <AdminHeader
        title="Projects"
        subtitle="Curate client commissions — status, budget, deadlines, and portal deliverables."
      />

      <AdminPageContent>
        {error && (
          <AdminAlert tone="error" className="mb-6">
            {error}
          </AdminAlert>
        )}

        {!loading && clients.length === 0 && (
          <AdminAlert tone="warning" className="mb-6">
            Add a client before creating projects.{" "}
            <Link href="/admin/clients" className="underline">
              Go to Clients
            </Link>
          </AdminAlert>
        )}

        {clientFilter !== "all" && (
          <AdminAlert tone="info" className="mb-6">
            Filtering by client.{" "}
            <Link href="/admin/projects" className="underline">
              Show all projects
            </Link>
          </AdminAlert>
        )}

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm transition-all",
              statusFilter === "all"
                ? "admin-luxury-card border-[color-mix(in_srgb,var(--admin-gold)_35%,transparent)] text-[var(--admin-gold-light)] shadow-[0_8px_24px_-12px_var(--glass-shadow)]"
                : "border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] text-[var(--admin-text-muted)] hover:border-[var(--admin-border-subtle)] hover:text-[var(--admin-text-muted)]",
            )}
          >
            All ({statusCounts.all ?? 0})
          </button>
          {projectStatuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm capitalize transition-all",
                statusFilter === status
                  ? "admin-luxury-card border-[color-mix(in_srgb,var(--admin-gold)_35%,transparent)] text-[var(--admin-gold-light)] shadow-[0_8px_24px_-12px_var(--glass-shadow)]"
                  : "border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] text-[var(--admin-text-muted)] hover:border-[var(--admin-border-subtle)] hover:text-[var(--admin-text-muted)]",
              )}
            >
              {status.replace(/_/g, " ")} ({statusCounts[status] ?? 0})
            </button>
          ))}
        </div>

        <AdminToolbar>
          <AdminSearchInput value={search} onChange={setSearch} placeholder="Search projects…" />
          <Button size="sm" className="admin-btn-gold" onClick={openCreate} disabled={clients.length === 0}>
            + New project
          </Button>
        </AdminToolbar>

        {loading ? (
          <AdminTableSkeleton />
        ) : filtered.length === 0 ? (
          <AdminEmptyState
            title="No projects found"
            description="Create a project to unlock the client portal — files, messages, and invoices."
            actionLabel="New project"
            onAction={openCreate}
          />
        ) : (
          <div className="grid gap-6 xl:grid-cols-5">
            <div className="admin-luxury-card overflow-hidden rounded-3xl xl:col-span-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[var(--admin-border-subtle)] bg-[var(--admin-panel)]">
                    <tr className="text-left text-[10px] uppercase tracking-[0.16em] text-[var(--admin-text-muted)]">
                      <th className="px-5 py-4 font-semibold">Project</th>
                      <th className="px-5 py-4 font-semibold">Client</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 font-semibold">Budget</th>
                      <th className="px-5 py-4 font-semibold">Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((project) => (
                      <tr
                        key={project.id}
                        onClick={() => setSelected(project)}
                        className={cn(
                          "cursor-pointer border-t border-[var(--admin-border-subtle)] transition-colors hover:bg-[var(--admin-panel-hover)]",
                          selected?.id === project.id &&
                            "bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]",
                        )}
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium text-[var(--admin-text)]">{project.title}</p>
                          {project.description && (
                            <p className="line-clamp-1 text-xs text-[var(--admin-text-muted)]">{project.description}</p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-[var(--admin-text-muted)]">{project.clients?.name ?? "—"}</td>
                        <td className="px-5 py-4">
                          <select
                            value={project.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateStatus(project.id, e.target.value)}
                            className="rounded-full border border-[var(--admin-border-subtle)] bg-[var(--background)]/80 px-3 py-1.5 text-xs capitalize text-[var(--admin-text)] backdrop-blur-sm"
                          >
                            {projectStatuses.map((s) => (
                              <option key={s} value={s}>
                                {s.replace(/_/g, " ")}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-4 font-medium tabular-nums text-[var(--admin-text-muted)]">
                          {project.budget ? `$${Number(project.budget).toLocaleString()}` : "—"}
                        </td>
                        <td className="px-5 py-4 text-[var(--admin-text-muted)]">
                          {project.deadline
                            ? new Date(project.deadline).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-luxury-card rounded-3xl p-6 xl:col-span-2">
              {selected ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-gold-light)]">
                      Selected project
                    </p>
                    <AdminStatusBadge status={selected.status} className="mt-3" />
                    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--admin-text)]">
                      {selected.title}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--admin-text-muted)]">
                      {selected.clients?.name ?? "Unknown client"}
                      {selected.clients?.email ? ` · ${selected.clients.email}` : ""}
                    </p>
                  </div>

                  {selected.description && (
                    <p className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] p-4 text-sm leading-relaxed text-[var(--admin-text-muted)]">
                      {selected.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-text-muted)]">
                        Budget
                      </p>
                      <p className="mt-2 text-lg font-semibold tabular-nums text-[var(--admin-text)]">
                        {selected.budget
                          ? `$${Number(selected.budget).toLocaleString()}`
                          : "Not set"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-text-muted)]">
                        Deadline
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[var(--admin-text)]">
                        {selected.deadline
                          ? new Date(selected.deadline).toLocaleDateString()
                          : "Not set"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-[var(--admin-border-subtle)] pt-5">
                    <Button size="sm" variant="secondary" className="admin-btn-ghost" onClick={() => startEdit(selected)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="admin-btn-ghost" href={`/portal/projects/${selected.id}`}>
                      Portal view
                    </Button>
                    <Button size="sm" variant="ghost" className="admin-btn-ghost" onClick={() => deleteProject(selected.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <AdminEmptyState
                  title="Select a project"
                  description="Choose a row to review details, update status, or preview the client experience."
                  className="border-none bg-transparent py-8"
                />
              )}
            </div>
          </div>
        )}

        <AdminModal
          open={showForm}
          onClose={closeForm}
          title={editId ? "Edit project" : "New project"}
          size="lg"
        >
          <form id="project-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">Client</label>
              <select
                required
                value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                className="admin-input w-full text-sm"
              >
                <option value="">Select client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[var(--admin-bg)]">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <AdminField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
            <AdminField
              label="Description"
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
              multiline
              rows={3}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="admin-input w-full text-sm"
              >
                {projectStatuses.map((s) => (
                  <option key={s} value={s} className="bg-[var(--admin-bg)]">
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField
                label="Budget"
                value={form.budget}
                onChange={(v) => setForm({ ...form, budget: v })}
                placeholder="5000"
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">Deadline</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="admin-input w-full text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-[var(--admin-border-subtle)] pt-4">
              <Button variant="ghost" size="sm" className="admin-btn-ghost" type="button" onClick={closeForm}>
                Cancel
              </Button>
              <Button size="sm" className="admin-btn-gold" type="submit" disabled={saving}>
                {saving ? "Saving…" : editId ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </AdminModal>
      </AdminPageContent>
    </>
  );
}

export default function AdminProjectsPage() {
  return (
    <Suspense fallback={<AdminPageContent><p className="text-[var(--admin-text-muted)]">Loading projects…</p></AdminPageContent>}>
      <AdminProjectsInner />
    </Suspense>
  );
}
