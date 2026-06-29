"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminField } from "@/components/admin/AdminField";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import {
  ClientsAdminHeader,
  ClientsSelect,
  ClientsStatCard,
} from "@/components/admin/clients/ClientsAdminHeader";
import { ClientsPagination } from "@/components/admin/clients/ClientsPagination";
import { ClientsSidebar } from "@/components/admin/clients/ClientsSidebar";
import { ClientStatusBadge, ClientsTable } from "@/components/admin/clients/ClientsTable";
import type { ClientRecord, ClientStats } from "@/lib/clients/utils";
import {
  CLIENT_STATUSES,
  allTimeRangeLocal,
  clientDisplayName,
  exportClientsCsv,
  formatCurrency,
  formatCurrencyDetailed,
  isInDateRange,
  monthGrowthHint,
  monthRangeLocal,
  pct,
  statusStyle,
} from "@/lib/clients/utils";
import { cn } from "@/lib/utils";

const emptyForm = { name: "", email: "", phone: "", company: "", notes: "", status: "active" };

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function formatDateRange(from: string, to: string) {
  const f = new Date(from + "T12:00:00");
  const t = new Date(to + "T12:00:00");
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  return `${f.toLocaleDateString("en-US", opts)} – ${t.toLocaleDateString("en-US", opts)}`;
}

const statIcons = {
  total: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  active: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  projects: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  ),
  invoices: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  revenue: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
};

export default function AdminClientsPage() {
  const defaultRange = allTimeRangeLocal();
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [stats, setStats] = useState<ClientStats>({
    totalClients: 0,
    activeClients: 0,
    projectsInProgress: 0,
    outstandingInvoices: 0,
    outstandingTotal: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [vipFilter, setVipFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState(defaultRange.from);
  const [dateTo, setDateTo] = useState(defaultRange.to);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  const [detailClient, setDetailClient] = useState<ClientRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/clients", { credentials: "same-origin" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to load clients");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setClients(data.clients ?? []);
    if (data.stats) setStats(data.stats);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, industryFilter, typeFilter, vipFilter, dateFrom, dateTo, perPage]);

  useEffect(() => {
    if (!detailClient) return;
    const fresh = clients.find((c) => c.id === detailClient.id);
    if (fresh) setDetailClient(fresh);
    else setDetailClient(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync detail row when list or id changes
  }, [clients, detailClient?.id]);

  const industryOptions = useMemo(() => {
    const set = new Set(clients.map((c) => c.industry));
    return [{ value: "all", label: "All Services" }, ...[...set].sort().map((s) => ({ value: s, label: s }))];
  }, [clients]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((client) => {
      if (statusFilter !== "all" && client.status !== statusFilter) return false;
      if (industryFilter !== "all" && client.industry !== industryFilter) return false;
      if (typeFilter === "company" && !client.company) return false;
      if (typeFilter === "individual" && client.company) return false;
      if (vipFilter === "vip" && !client.is_vip) return false;
      if (!isInDateRange(client.created_at, dateFrom, dateTo)) return false;
      if (!q) return true;
      return [client.name, client.email, client.company, client.phone, client.industry]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [clients, search, statusFilter, industryFilter, typeFilter, vipFilter, dateFrom, dateTo]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    if (page > totalPages) setPage(totalPages);
  }, [filtered.length, perPage, page]);

  function openCreate() {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(true);
    setError(null);
  }

  function openEdit(client: ClientRecord) {
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone ?? "",
      company: client.company ?? "",
      notes: client.notes ?? "",
      status: client.status,
    });
    setEditId(client.id);
    setShowForm(true);
    setError(null);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
  }

  async function handleSubmit() {
    if (!form.name.trim() || !isValidEmail(form.email)) {
      setError("Enter a valid name and email.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      company: form.company.trim() || null,
      notes: form.notes.trim() || null,
      status: form.status,
    };
    const res = await fetch("/api/admin/clients", {
      method: editId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(editId ? { id: editId, ...payload } : payload),
    });
    setSaving(false);
    if (res.ok) {
      closeForm();
      setSuccess(editId ? "Client updated." : "Client added.");
      await fetchClients();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Failed to save client");
  }

  async function deleteClient(id: string) {
    if (!confirm("Delete this client?")) return;
    setError(null);
    const res = await fetch(`/api/admin/clients?id=${id}`, { method: "DELETE", credentials: "same-origin" });
    if (res.ok) {
      if (detailClient?.id === id) setDetailClient(null);
      setSuccess("Client deleted.");
      await fetchClients();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Failed to delete client");
  }

  async function updateStatus(id: string, status: string) {
    setError(null);
    const res = await fetch("/api/admin/clients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setSuccess("Client status updated.");
      await fetchClients();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Failed to update status");
  }

  async function importClients(rows: { name: string; email: string; phone?: string; company?: string }[]) {
    setError(null);
    setSuccess(null);
    let imported = 0;
    let failed = 0;
    for (const row of rows) {
      if (!isValidEmail(row.email)) {
        failed++;
        continue;
      }
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ ...row, status: "active" }),
      });
      if (res.ok) imported++;
      else failed++;
    }
    await fetchClients();
    if (imported > 0) setSuccess(`Imported ${imported} client${imported === 1 ? "" : "s"}${failed ? ` (${failed} skipped)` : ""}.`);
    else setError("Import failed. Check that each row has a valid name and email.");
  }

  function handleQuickEmail() {
    const first = filtered[0];
    if (first) window.location.href = `mailto:${first.email}`;
    else setError("No clients available to email.");
  }

  function applyThisMonthFilter() {
    const range = monthRangeLocal();
    setDateFrom(range.from);
    setDateTo(range.to);
  }

  function clearDateFilter() {
    const range = allTimeRangeLocal();
    setDateFrom(range.from);
    setDateTo(range.to);
  }

  return (
    <div className="admin-clients-page">
      <ClientsAdminHeader
        search={search}
        onSearchChange={setSearch}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((v) => !v)}
        onAddClient={openCreate}
      />

      <AdminPageContent className="admin-clients-content">
        {error && <AdminAlert tone="error" className="mb-4">{error}</AdminAlert>}
        {success && <AdminAlert tone="success" className="mb-4">{success}</AdminAlert>}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <ClientsStatCard label="Total Clients" value={stats.totalClients} hint={monthGrowthHint(clients)} icon={statIcons.total} />
          <ClientsStatCard label="Active Clients" value={stats.activeClients} hint={`${pct(stats.activeClients, stats.totalClients)} of total`} icon={statIcons.active} />
          <ClientsStatCard label="Projects in Progress" value={stats.projectsInProgress} hint={`${pct(stats.projectsInProgress, Math.max(stats.totalClients, 1))} active clients`} icon={statIcons.projects} />
          <ClientsStatCard label="Outstanding Invoices" value={stats.outstandingInvoices} hint={formatCurrencyDetailed(stats.outstandingTotal)} icon={statIcons.invoices} goldValue />
          <ClientsStatCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} hint={monthGrowthHint(clients, (c) => c.revenue > 0)} icon={statIcons.revenue} goldValue />
        </div>

        <div className="admin-clients-layout">
          <div className="admin-clients-main">
            <div className={cn("admin-clients-toolbar", !showFilters && "admin-clients-toolbar-compact")}>
              {showFilters && (
                <div className="flex flex-wrap gap-2">
                  <ClientsSelect
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                      { value: "all", label: "All Statuses" },
                      ...CLIENT_STATUSES.map((s) => ({ value: s, label: statusStyle(s).label })),
                    ]}
                  />
                  <ClientsSelect value={industryFilter} onChange={setIndustryFilter} options={industryOptions} />
                  <ClientsSelect
                    value={vipFilter}
                    onChange={setVipFilter}
                    options={[
                      { value: "all", label: "All Tags" },
                      { value: "vip", label: "VIP" },
                    ]}
                  />
                  <ClientsSelect
                    value={typeFilter}
                    onChange={setTypeFilter}
                    options={[
                      { value: "all", label: "Client Type" },
                      { value: "company", label: "Company" },
                      { value: "individual", label: "Individual" },
                    ]}
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <div className="admin-clients-date-range">
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="admin-clients-date-input" aria-label="From date" />
                  <span className="text-[var(--admin-text-muted)]">–</span>
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="admin-clients-date-input" aria-label="To date" />
                  <span className="hidden text-xs text-[var(--admin-text-muted)] lg:inline">{formatDateRange(dateFrom, dateTo)}</span>
                  <button type="button" onClick={applyThisMonthFilter} className="admin-btn-ghost px-2 py-1 text-[10px]">This month</button>
                  <button type="button" onClick={clearDateFilter} className="admin-btn-ghost px-2 py-1 text-[10px]">All time</button>
                </div>

                <div className="admin-clients-view-toggle">
                  <button type="button" onClick={() => setViewMode("grid")} className={cn("admin-clients-view-btn", viewMode === "grid" && "admin-clients-view-btn-active")} aria-label="Grid view">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0111.25 6v2.25A2.25 2.25 0 019.5 10.5H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => setViewMode("list")} className={cn("admin-clients-view-btn", viewMode === "list" && "admin-clients-view-btn-active")} aria-label="List view">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm0 5.25h.007v.008H3.75v-.008zm0 5.25h.007v.008H3.75v-.008z" />
                    </svg>
                  </button>
                </div>

                <button type="button" onClick={() => exportClientsCsv(filtered)} className="admin-btn-ghost px-3 py-2 text-xs">Export</button>
              </div>
            </div>

            <ClientsTable
              clients={paginated}
              loading={loading}
              viewMode={viewMode}
              onView={setDetailClient}
              onEdit={openEdit}
              onDelete={deleteClient}
              onStatusChange={(client, status) => updateStatus(client.id, status)}
            />

            {!loading && filtered.length > 0 && (
              <ClientsPagination page={page} perPage={perPage} total={filtered.length} onPageChange={setPage} onPerPageChange={setPerPage} />
            )}
          </div>

          <ClientsSidebar
            clients={clients}
            onAddClient={openCreate}
            onImport={importClients}
            onImportError={(message) => { setSuccess(null); setError(message); }}
            onSendEmail={handleQuickEmail}
            onCreateInvoice={() => setSuccess(null)}
          />
        </div>
      </AdminPageContent>

      <AdminModal
        open={!!detailClient}
        onClose={() => setDetailClient(null)}
        title={detailClient ? clientDisplayName(detailClient) : "Client details"}
        size="lg"
        footer={
          detailClient ? (
            <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--admin-border-subtle)] px-6 py-4">
              <Button size="sm" href={`/admin/projects?client=${detailClient.id}`} variant="secondary" className="admin-btn-ghost">View projects</Button>
              <Button size="sm" href={`/admin/invoices?client=${detailClient.id}`} variant="secondary" className="admin-btn-ghost">View invoices</Button>
              <Button size="sm" variant="secondary" className="admin-btn-ghost" onClick={() => openEdit(detailClient)}>Edit client</Button>
              <Button size="sm" href={`mailto:${detailClient.email}`} variant="ghost" className="admin-btn-ghost">Email client</Button>
              <Button size="sm" variant="ghost" className="admin-btn-ghost" onClick={() => deleteClient(detailClient.id)}>Delete</Button>
            </div>
          ) : undefined
        }
      >
        {detailClient && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <ClientStatusBadge status={detailClient.status} />
              {detailClient.is_vip && <span className="admin-clients-vip-badge">VIP</span>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><p className="text-xs uppercase tracking-wider text-[var(--admin-text-muted)]">Contact</p><p className="text-sm text-[var(--admin-text)]">{detailClient.name}</p></div>
              <div><p className="text-xs uppercase tracking-wider text-[var(--admin-text-muted)]">Email</p><p className="text-sm text-[var(--admin-text)]">{detailClient.email}</p></div>
              <div><p className="text-xs uppercase tracking-wider text-[var(--admin-text-muted)]">Phone</p><p className="text-sm text-[var(--admin-text)]">{detailClient.phone ?? "—"}</p></div>
              <div><p className="text-xs uppercase tracking-wider text-[var(--admin-text-muted)]">Industry</p><p className="text-sm text-[var(--admin-text)]">{detailClient.industry}</p></div>
              <div><p className="text-xs uppercase tracking-wider text-[var(--admin-text-muted)]">Projects</p><p className="text-sm text-[var(--admin-text)]">{detailClient.project_count}</p></div>
              <div><p className="text-xs uppercase tracking-wider text-[var(--admin-text-muted)]">Revenue</p><p className="text-sm text-[var(--admin-gold-light)]">{formatCurrencyDetailed(detailClient.revenue)}</p></div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">Status</label>
              <select value={detailClient.status} onChange={(e) => updateStatus(detailClient.id, e.target.value)} className="admin-input w-full text-sm">
                {CLIENT_STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-[var(--admin-bg)]">{statusStyle(s).label}</option>
                ))}
              </select>
            </div>
            {detailClient.notes && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">Notes</p>
                <p className="text-sm text-[var(--admin-text-muted)]">{detailClient.notes}</p>
              </div>
            )}
          </div>
        )}
      </AdminModal>

      <AdminModal
        open={showForm}
        onClose={closeForm}
        title={editId ? "Edit Client" : "Add Client"}
        footer={
          <div className="flex justify-end gap-2 border-t border-[var(--admin-border-subtle)] px-6 py-4">
            <Button variant="ghost" size="sm" className="admin-btn-ghost" onClick={closeForm}>Cancel</Button>
            <Button size="sm" className="admin-btn-gold" disabled={saving || !form.name || !form.email} onClick={handleSubmit}>
              {saving ? "Saving…" : editId ? "Update" : "Add Client"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <AdminField label="Contact name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <AdminField label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <AdminField label="Phone" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <AdminField label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="admin-input w-full text-sm">
              {CLIENT_STATUSES.map((s) => (
                <option key={s} value={s}>{statusStyle(s).label}</option>
              ))}
            </select>
          </div>
          <AdminField label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} multiline rows={4} hint="Add VIP in notes to flag high-value clients." />
        </div>
      </AdminModal>
    </div>
  );
}
