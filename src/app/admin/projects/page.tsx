"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminField } from "@/components/admin/AdminField";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import {
  ProjectsAdminHeader,
  ProjectsSelect,
  ProjectsStatCard,
} from "@/components/admin/projects/ProjectsAdminHeader";
import { ProjectsPagination } from "@/components/admin/projects/ProjectsPagination";
import { ProjectsSidebar } from "@/components/admin/projects/ProjectsSidebar";
import { ProjectStatusBadge, ProjectsKanban, ProjectsTable } from "@/components/admin/projects/ProjectsTable";
import {
  PROJECT_CATEGORIES,
  computeProjectStats,
  exportProjectsCsv,
  formatCurrencyDetailed,
  inferCategory,
  isInProgressStatus,
  isOverdue,
  monthGrowthHint,
  projectStatuses,
  projectTags,
  statusStyle,
  type ProjectRecord,
} from "@/lib/projects/utils";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Client = { id: string; name: string; email: string };

const emptyForm = {
  client_id: "",
  title: "",
  description: "",
  status: "planning",
  budget: "",
  deadline: "",
};

const statIcons = {
  total: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  ),
  inProgress: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  completed: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  onHold: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
    </svg>
  ),
  overdue: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
};

function AdminProjectsInner() {
  const searchParams = useSearchParams();
  const clientFilter = searchParams.get("client") ?? "all";

  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [clientSelect, setClientSelect] = useState(clientFilter);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [layoutMode, setLayoutMode] = useState<"list" | "kanban">("list");
  const [listDisplay, setListDisplay] = useState<"table" | "grid">("table");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  const [detailProject, setDetailProject] = useState<ProjectRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setClientSelect(clientFilter);
  }, [clientFilter]);

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

  useEffect(() => {
    setPage(1);
  }, [search, clientSelect, statusFilter, categoryFilter, tagFilter, perPage]);

  useEffect(() => {
    if (!detailProject) return;
    const fresh = projects.find((p) => p.id === detailProject.id);
    if (fresh) setDetailProject(fresh);
    else setDetailProject(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync detail row when list changes
  }, [projects, detailProject?.id]);

  const scopedProjects = useMemo(() => {
    if (clientSelect === "all") return projects;
    return projects.filter((p) => p.client_id === clientSelect);
  }, [projects, clientSelect]);

  const stats = useMemo(() => computeProjectStats(scopedProjects), [scopedProjects]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scopedProjects.filter((project) => {
      if (statusFilter !== "all" && project.status !== statusFilter) return false;
      if (categoryFilter !== "all" && inferCategory(project.title, project.description) !== categoryFilter) return false;
      if (tagFilter === "high_budget" && (project.budget ?? 0) < 10000) return false;
      if (tagFilter === "overdue" && !isOverdue(project)) return false;
      if (!q) return true;
      return [project.title, project.description, project.clients?.name, project.clients?.email, project.clients?.company]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [scopedProjects, search, statusFilter, categoryFilter, tagFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    if (page > totalPages) setPage(totalPages);
  }, [filtered.length, perPage, page]);

  function openCreate() {
    setEditId(null);
    setForm({ ...emptyForm, client_id: clientSelect !== "all" ? clientSelect : "" });
    setShowForm(true);
    setError(null);
  }

  function openEdit(project: ProjectRecord) {
    setDetailProject(null);
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
    setError(null);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
  }

  async function handleSubmit() {
    if (!form.client_id || !form.title.trim()) {
      setError("Select a client and enter a project title.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    const res = await fetch("/api/admin/projects", {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(editId ? { id: editId, ...form } : form),
    });
    setSaving(false);
    if (res.ok) {
      closeForm();
      setSuccess(editId ? "Project updated." : "Project created.");
      await fetchData();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Failed to save project");
  }

  async function updateStatus(project: ProjectRecord, status: string) {
    setError(null);
    const res = await fetch("/api/admin/projects", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id: project.id, status }),
    });
    if (res.ok) {
      setSuccess("Project status updated.");
      await fetchData();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Failed to update status");
  }

  async function deleteProject(id: string) {
    if (!confirm("Delete this project?")) return;
    setError(null);
    const res = await fetch(`/api/admin/projects?id=${id}`, { method: "DELETE", credentials: "same-origin" });
    if (res.ok) {
      if (detailProject?.id === id) setDetailProject(null);
      setSuccess("Project deleted.");
      await fetchData();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Failed to delete project");
  }

  const clientOptions = useMemo(
    () => [{ value: "all", label: "All Clients" }, ...clients.map((c) => ({ value: c.id, label: c.name }))],
    [clients],
  );

  const statusOptions = useMemo(
    () => [
      { value: "all", label: "All Statuses" },
      ...projectStatuses.map((s) => ({ value: s, label: statusStyle(s).label })),
    ],
    [],
  );

  const categoryOptions = useMemo(
    () => [{ value: "all", label: "All Categories" }, ...PROJECT_CATEGORIES.map((c) => ({ value: c, label: c }))],
    [],
  );

  return (
    <div className="admin-projects-page">
      <ProjectsAdminHeader
        search={search}
        onSearchChange={setSearch}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((v) => !v)}
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
        onNewProject={openCreate}
        newProjectDisabled={clients.length === 0}
      />

      <AdminPageContent className="admin-projects-content">
        {error && <AdminAlert tone="error" className="mb-4">{error}</AdminAlert>}
        {success && <AdminAlert tone="success" className="mb-4">{success}</AdminAlert>}

        {!loading && clients.length === 0 && (
          <AdminAlert tone="warning" className="mb-4">
            Add a client before creating projects.{" "}
            <Link href="/admin/clients" className="underline">Go to Clients</Link>
          </AdminAlert>
        )}

        {clientFilter !== "all" && (
          <AdminAlert tone="info" className="mb-4">
            Filtering by client.{" "}
            <Link href="/admin/projects" className="underline">Show all projects</Link>
          </AdminAlert>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <ProjectsStatCard label="Total Projects" value={stats.total} hint={monthGrowthHint(scopedProjects)} icon={statIcons.total} />
          <ProjectsStatCard label="In Progress" value={stats.inProgress} hint={monthGrowthHint(scopedProjects, (p) => isInProgressStatus(p.status))} icon={statIcons.inProgress} />
          <ProjectsStatCard label="Completed" value={stats.completed} hint={monthGrowthHint(scopedProjects, (p) => p.status === "completed")} icon={statIcons.completed} />
          <ProjectsStatCard label="On Hold" value={stats.onHold} hint={monthGrowthHint(scopedProjects, (p) => p.status === "on_hold")} hintTone="down" icon={statIcons.onHold} />
          <ProjectsStatCard label="Overdue" value={stats.overdue} hint={monthGrowthHint(scopedProjects, (p) => isOverdue(p))} icon={statIcons.overdue} />
        </div>

        <div className="admin-projects-layout">
          <div className="admin-projects-main">
            <div className={cn("admin-projects-toolbar", !showFilters && "admin-projects-toolbar-compact")}>
              {showFilters && (
                <div className="flex flex-wrap gap-2">
                  <ProjectsSelect value={clientSelect} onChange={setClientSelect} options={clientOptions} />
                  <ProjectsSelect value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
                  <ProjectsSelect value={categoryFilter} onChange={setCategoryFilter} options={categoryOptions} />
                  <ProjectsSelect
                    value={tagFilter}
                    onChange={setTagFilter}
                    options={[
                      { value: "all", label: "All Tags" },
                      { value: "high_budget", label: "High Budget" },
                      { value: "overdue", label: "Overdue" },
                    ]}
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {layoutMode === "list" && (
                  <div className="admin-projects-view-toggle">
                    <button type="button" onClick={() => setListDisplay("grid")} className={cn("admin-projects-view-btn", listDisplay === "grid" && "admin-projects-view-btn-active")} aria-label="Grid view">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0111.25 6v2.25A2.25 2.25 0 019.5 10.5H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
                      </svg>
                    </button>
                    <button type="button" onClick={() => setListDisplay("table")} className={cn("admin-projects-view-btn", listDisplay === "table" && "admin-projects-view-btn-active")} aria-label="List view">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm0 5.25h.007v.008H3.75v-.008zm0 5.25h.007v.008H3.75v-.008z" />
                      </svg>
                    </button>
                  </div>
                )}
                <button type="button" onClick={() => exportProjectsCsv(filtered)} className="admin-btn-ghost px-3 py-2 text-xs">Export</button>
              </div>
            </div>

            {layoutMode === "kanban" ? (
              <ProjectsKanban projects={filtered} loading={loading} onView={setDetailProject} />
            ) : (
              <ProjectsTable
                projects={paginated}
                loading={loading}
                listDisplay={listDisplay}
                onView={setDetailProject}
                onEdit={openEdit}
                onDelete={deleteProject}
                onStatusChange={updateStatus}
              />
            )}

            {layoutMode === "list" && !loading && filtered.length > 0 && (
              <ProjectsPagination page={page} perPage={perPage} total={filtered.length} onPageChange={setPage} onPerPageChange={setPerPage} />
            )}
          </div>

          <ProjectsSidebar projects={scopedProjects} onNewProject={openCreate} onExport={() => exportProjectsCsv(filtered)} />
        </div>
      </AdminPageContent>

      <AdminModal
        open={!!detailProject}
        onClose={() => setDetailProject(null)}
        title={detailProject?.title ?? "Project details"}
        size="lg"
        footer={
          detailProject ? (
            <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--admin-border-subtle)] px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button size="sm" href={`/portal/projects/${detailProject.id}`} variant="secondary" className="admin-btn-ghost">Portal view</Button>
              <Button size="sm" href={`/admin/invoices?client=${detailProject.client_id}`} variant="secondary" className="admin-btn-ghost">View invoices</Button>
              <Button size="sm" variant="secondary" className="admin-btn-ghost" onClick={() => openEdit(detailProject)}>Edit project</Button>
              <Button size="sm" variant="ghost" className="admin-btn-ghost" onClick={() => deleteProject(detailProject.id)}>Delete</Button>
            </div>
          ) : undefined
        }
      >
        {detailProject && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <ProjectStatusBadge status={detailProject.status} />
              {projectTags(detailProject).map((tag) => (
                <span key={tag} className="admin-projects-tag">{tag}</span>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><p className="text-xs uppercase tracking-wider text-[var(--admin-text-muted)]">Client</p><p className="text-sm text-[var(--admin-text)]">{detailProject.clients?.name ?? "—"}</p></div>
              <div><p className="text-xs uppercase tracking-wider text-[var(--admin-text-muted)]">Category</p><p className="text-sm text-[var(--admin-text)]">{inferCategory(detailProject.title, detailProject.description)}</p></div>
              <div><p className="text-xs uppercase tracking-wider text-[var(--admin-text-muted)]">Budget</p><p className="text-sm text-[var(--admin-gold-light)]">{formatCurrencyDetailed(detailProject.budget)}</p></div>
              <div><p className="text-xs uppercase tracking-wider text-[var(--admin-text-muted)]">Deadline</p><p className="text-sm text-[var(--admin-text)]">{detailProject.deadline ? new Date(`${detailProject.deadline}T12:00:00`).toLocaleDateString() : "—"}</p></div>
            </div>
            {detailProject.description && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">Description</p>
                <p className="text-sm text-[var(--admin-text-muted)]">{detailProject.description}</p>
              </div>
            )}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">Status</label>
              <select value={detailProject.status} onChange={(e) => updateStatus(detailProject, e.target.value)} className="admin-input w-full text-sm">
                {projectStatuses.map((s) => (
                  <option key={s} value={s} className="bg-[var(--admin-bg)]">{statusStyle(s).label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </AdminModal>

      <AdminModal
        open={showForm}
        onClose={closeForm}
        title={editId ? "Edit Project" : "New Project"}
        size="lg"
        footer={
          <div className="flex justify-end gap-2 border-t border-[var(--admin-border-subtle)] px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button variant="ghost" size="sm" className="admin-btn-ghost" onClick={closeForm}>Cancel</Button>
            <Button size="sm" className="admin-btn-gold" disabled={saving || !form.title || !form.client_id} onClick={handleSubmit}>
              {saving ? "Saving…" : editId ? "Update" : "Create Project"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">Client</label>
            <select required value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className="admin-input w-full text-sm">
              <option value="">Select client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-[var(--admin-bg)]">{c.name}</option>
              ))}
            </select>
          </div>
          <AdminField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <AdminField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} multiline rows={3} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="admin-input w-full text-sm">
              {projectStatuses.map((s) => (
                <option key={s} value={s} className="bg-[var(--admin-bg)]">{statusStyle(s).label}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Budget" value={form.budget} onChange={(v) => setForm({ ...form, budget: v })} placeholder="8500" />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="admin-input w-full text-sm" />
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}

export default function AdminProjectsPage() {
  return (
    <Suspense fallback={<AdminPageContent><p className="text-[var(--admin-text-muted)]">Loading projects…</p></AdminPageContent>}>
      <AdminProjectsInner />
    </Suspense>
  );
}
