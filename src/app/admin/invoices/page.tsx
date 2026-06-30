"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminField } from "@/components/admin/AdminField";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import { InvoicesDetailModal } from "@/components/admin/invoices/InvoicesDetailModal";
import {
  InvoicesAdminHeader,
  InvoicesSelect,
  InvoicesStatCard,
} from "@/components/admin/invoices/InvoicesAdminHeader";
import { InvoicesPagination } from "@/components/admin/invoices/InvoicesPagination";
import { InvoicesSidebar } from "@/components/admin/invoices/InvoicesSidebar";
import { InvoicesTable } from "@/components/admin/invoices/InvoicesTable";
import { Button } from "@/components/ui/Button";
import type { ClientRef, InvoiceRecord, ProjectRef } from "@/lib/invoices/utils";
import {
  computeInvoiceStats,
  computeTotal,
  emptyInvoiceForm,
  emptyLineItem,
  exportInvoicesCsv,
  filterByTab,
  formatCurrency,
  formatCurrencyCompact,
  isInDateRange,
  joinClientName,
  joinProjectTitle,
  allTimeRangeLocal,
} from "@/lib/invoices/utils";
import { cn } from "@/lib/utils";
import type { InvoiceLineItem } from "@/types";

const TABS = [
  { id: "all", label: "All Invoices" },
  { id: "paid", label: "Paid" },
  { id: "pending", label: "Pending" },
  { id: "overdue", label: "Overdue" },
  { id: "draft", label: "Draft" },
] as const;

const statIcons = {
  total: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  paid: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  pending: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  overdue: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  draft: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a4.5 4.5 0 116.364 6.364L10.582 21.75 4.5 21.75V15.668l11.362-11.363z" />
    </svg>
  ),
};

export default function AdminInvoicesPage() {
  return (
    <Suspense fallback={<AdminPageContent><div className="admin-luxury-card h-96 animate-pulse" /></AdminPageContent>}>
      <AdminInvoicesInner />
    </Suspense>
  );
}

function AdminInvoicesInner() {
  const searchParams = useSearchParams();
  const urlClientFilter = searchParams.get("client") ?? "all";
  const defaultRange = allTimeRangeLocal();
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [clients, setClients] = useState<ClientRef[]>([]);
  const [projects, setProjects] = useState<ProjectRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState(defaultRange.from);
  const [dateTo, setDateTo] = useState(defaultRange.to);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [detailInvoice, setDetailInvoice] = useState<InvoiceRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyInvoiceForm);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/invoices", { credentials: "same-origin" });
    if (res.ok) {
      const data = await res.json();
      setInvoices(data.invoices ?? []);
      setClients(data.clients ?? []);
      setProjects(data.projects ?? []);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to load invoices");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (urlClientFilter !== "all") {
      setClientFilter(urlClientFilter);
    }
  }, [urlClientFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, activeTab, clientFilter, projectFilter, statusFilter, dateFrom, dateTo, perPage]);

  useEffect(() => {
    if (!detailInvoice) return;
    const fresh = invoices.find((inv) => inv.id === detailInvoice.id);
    if (fresh) setDetailInvoice(fresh);
    else setDetailInvoice(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync detail when list updates
  }, [invoices, detailInvoice?.id]);

  const stats = useMemo(() => computeInvoiceStats(invoices), [invoices]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: invoices.length };
    TABS.forEach((tab) => {
      if (tab.id === "all") return;
      counts[tab.id] = invoices.filter((inv) => filterByTab(inv, tab.id)).length;
    });
    return counts;
  }, [invoices]);

  const clientOptions = useMemo(
    () => [{ value: "all", label: "All Clients" }, ...clients.map((c) => ({ value: c.id, label: c.name }))],
    [clients],
  );

  const projectOptions = useMemo(
    () => [{ value: "all", label: "All Projects" }, ...projects.map((p) => ({ value: p.id, label: p.title }))],
    [projects],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (!filterByTab(inv, activeTab)) return false;
      if (clientFilter !== "all" && inv.client_id !== clientFilter) return false;
      if (projectFilter !== "all" && inv.project_id !== projectFilter) return false;
      if (statusFilter !== "all" && inv.status !== statusFilter) return false;
      if (!isInDateRange(inv.created_at, dateFrom, dateTo)) return false;
      if (!q) return true;
      return [inv.invoice_number, joinClientName(inv.clients), joinProjectTitle(inv.projects), inv.notes]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [invoices, search, activeTab, clientFilter, projectFilter, statusFilter, dateFrom, dateTo]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  const clientProjects = useMemo(
    () => (form.client_id ? projects.filter((p) => p.client_id === form.client_id) : projects),
    [projects, form.client_id],
  );

  function openCreate() {
    setEditId(null);
    const nextNum = `INV-${String(invoices.length + 1).padStart(4, "0")}`;
    setForm({ ...emptyInvoiceForm, invoice_number: nextNum, line_items: [emptyLineItem()] });
    setShowForm(true);
  }

  function startEdit(invoice: InvoiceRecord) {
    setDetailInvoice(null);
    setEditId(invoice.id);
    setForm({
      client_id: invoice.client_id,
      project_id: invoice.project_id ?? "",
      invoice_number: invoice.invoice_number,
      status: invoice.status,
      due_date: invoice.due_date ?? "",
      notes: invoice.notes ?? "",
      line_items: invoice.line_items?.length ? invoice.line_items : [emptyLineItem()],
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setForm(emptyInvoiceForm);
  }

  function updateLineItem(index: number, field: keyof InvoiceLineItem, value: string) {
    setForm((prev) => {
      const items = [...prev.line_items];
      const item = { ...items[index] };
      if (field === "description") item.description = value;
      else {
        const num = parseFloat(value) || 0;
        if (field === "quantity") item.quantity = num;
        if (field === "unit_price") item.unit_price = num;
        item.total = item.quantity * item.unit_price;
      }
      items[index] = item;
      return { ...prev, line_items: items };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setActionNotice(null);
    const method = editId ? "PATCH" : "POST";
    const body = editId
      ? { id: editId, ...form, project_id: form.project_id || null }
      : { ...form, project_id: form.project_id || null };

    const res = await fetch("/api/admin/invoices", {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (res.ok) {
      closeForm();
      fetchData();
      setActionNotice({
        tone: "success",
        text: editId ? "Invoice updated." : "Invoice created.",
      });
      return;
    }

    const data = await res.json().catch(() => ({}));
    setActionNotice({ tone: "error", text: data.error ?? "Failed to save invoice" });
  }

  async function updateStatus(invoice: InvoiceRecord, status: string) {
    setActionNotice(null);
    const res = await fetch("/api/admin/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id: invoice.id, status }),
    });
    if (res.ok) {
      fetchData();
      setActionNotice({ tone: "success", text: "Invoice status updated." });
      return;
    }
    const data = await res.json().catch(() => ({}));
    setActionNotice({ tone: "error", text: data.error ?? "Failed to update status" });
  }

  async function deleteInvoice(id: string) {
    if (!confirm("Delete this invoice?")) return;
    setActionNotice(null);
    const res = await fetch(`/api/admin/invoices?id=${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setActionNotice({ tone: "error", text: data.error ?? "Failed to delete invoice" });
      return;
    }
    if (detailInvoice?.id === id) setDetailInvoice(null);
    fetchData();
    setActionNotice({ tone: "success", text: "Invoice deleted." });
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll(checked: boolean) {
    if (!checked) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(paginated.map((inv) => inv.id)));
  }

  const formTotal = computeTotal(form.line_items);

  return (
    <div className="admin-invoices-page">
      <InvoicesAdminHeader
        search={search}
        onSearchChange={setSearch}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((v) => !v)}
        onNewInvoice={openCreate}
        disableCreate={clients.length === 0}
      />

      <AdminPageContent className="admin-invoices-content">
        {error ? (
          <AdminAlert tone="error" className="mb-6">
            {error}
          </AdminAlert>
        ) : null}

        {actionNotice ? (
          <AdminAlert tone={actionNotice.tone} className="mb-6">
            {actionNotice.text}
          </AdminAlert>
        ) : null}

        {clientFilter !== "all" ? (
          <AdminAlert tone="info" className="mb-6">
            Filtering by client.{" "}
            <Link href="/admin/invoices" className="text-[var(--admin-gold-light)] underline">
              Show all invoices
            </Link>
          </AdminAlert>
        ) : null}

        {!loading && clients.length === 0 ? (
          <AdminAlert tone="warning" className="mb-6">
            Add a client before creating invoices.{" "}
            <Link href="/admin/clients" className="text-[var(--admin-gold-light)] underline">
              Go to Clients
            </Link>
          </AdminAlert>
        ) : null}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <InvoicesStatCard
            label="Total Invoices"
            value={stats.totalCount}
            hint={`↑ ${stats.monthGrowth}% this month`}
            icon={statIcons.total}
          />
          <InvoicesStatCard
            label="Paid"
            value={formatCurrencyCompact(stats.paidAmount)}
            hint="Collected revenue"
            icon={statIcons.paid}
          />
          <InvoicesStatCard
            label="Pending"
            value={formatCurrencyCompact(stats.pendingAmount)}
            hint="Awaiting payment"
            icon={statIcons.pending}
            hintTone="gold"
          />
          <InvoicesStatCard
            label="Overdue"
            value={formatCurrencyCompact(stats.overdueAmount)}
            hint="Needs follow-up"
            icon={statIcons.overdue}
            hintTone="down"
          />
          <InvoicesStatCard
            label="Draft"
            value={formatCurrencyCompact(stats.draftAmount)}
            hint="Not yet sent"
            icon={statIcons.draft}
            hintTone="neutral"
          />
        </div>

        <div className="admin-invoices-layout">
          <div className="admin-invoices-main">
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-sm transition-all",
                    activeTab === tab.id
                      ? "border-[color-mix(in_srgb,var(--admin-gold)_35%,transparent)] bg-[var(--admin-gold-soft)] text-[var(--admin-gold-light)]"
                      : "border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]",
                  )}
                >
                  {tab.label} ({tabCounts[tab.id] ?? 0})
                </button>
              ))}
            </div>

            {showFilters ? (
              <div className="admin-invoices-toolbar">
                <div className="flex flex-wrap items-center gap-2">
                  <InvoicesSelect value={clientFilter} onChange={setClientFilter} options={clientOptions} />
                  <InvoicesSelect value={projectFilter} onChange={setProjectFilter} options={projectOptions} />
                  <InvoicesSelect
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                      { value: "all", label: "All Status" },
                      { value: "draft", label: "Draft" },
                      { value: "sent", label: "Pending" },
                      { value: "paid", label: "Paid" },
                      { value: "overdue", label: "Overdue" },
                      { value: "cancelled", label: "Cancelled" },
                    ]}
                  />
                  <div className="admin-invoices-date-range">
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="admin-invoices-date-input" />
                    <span className="text-xs text-[var(--admin-text-muted)]">–</span>
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="admin-invoices-date-input" />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" className="admin-btn-ghost px-3 py-2 text-sm" onClick={() => exportInvoicesCsv(filtered)}>
                    Export
                  </button>
                </div>
              </div>
            ) : (
              <div className="admin-invoices-toolbar admin-invoices-toolbar-compact">
                <button type="button" className="admin-btn-ghost px-3 py-2 text-sm" onClick={() => exportInvoicesCsv(filtered)}>
                  Export
                </button>
              </div>
            )}

            <InvoicesTable
              invoices={paginated}
              loading={loading}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onToggleSelectAll={toggleSelectAll}
              onView={setDetailInvoice}
              onEdit={startEdit}
              onDelete={deleteInvoice}
              onStatusChange={updateStatus}
            />

            <InvoicesPagination
              page={page}
              perPage={perPage}
              total={filtered.length}
              onPageChange={setPage}
              onPerPageChange={setPerPage}
            />
          </div>

          <InvoicesSidebar invoices={invoices} onNewInvoice={openCreate} onExport={() => exportInvoicesCsv(filtered)} />
        </div>
      </AdminPageContent>

      <InvoicesDetailModal
        invoice={detailInvoice}
        onClose={() => setDetailInvoice(null)}
        onEdit={startEdit}
        onDelete={deleteInvoice}
        onStatusChange={updateStatus}
      />

      <AdminModal open={showForm} onClose={closeForm} title={editId ? "Edit invoice" : "New invoice"} size="xl">
        <form id="invoice-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">Client</label>
              <select
                required
                value={form.client_id}
                onChange={(e) => setForm({ ...form, client_id: e.target.value, project_id: "" })}
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
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">Project (optional)</label>
              <select
                value={form.project_id}
                onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                className="admin-input w-full text-sm"
              >
                <option value="">No project</option>
                {clientProjects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[var(--admin-bg)]">
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Invoice number" value={form.invoice_number} onChange={(v) => setForm({ ...form, invoice_number: v })} />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="admin-input w-full text-sm">
                <option value="draft" className="bg-[var(--admin-bg)]">draft</option>
                <option value="sent" className="bg-[var(--admin-bg)]">sent</option>
                <option value="paid" className="bg-[var(--admin-bg)]">paid</option>
                <option value="overdue" className="bg-[var(--admin-bg)]">overdue</option>
                <option value="cancelled" className="bg-[var(--admin-bg)]">cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">Due date</label>
            <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="admin-input w-full text-sm" />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-[var(--admin-text-muted)]">Line items</label>
              <button type="button" onClick={() => setForm((prev) => ({ ...prev, line_items: [...prev.line_items, emptyLineItem()] }))} className="text-xs text-[var(--admin-gold-light)] hover:text-[var(--admin-text)]">
                + Add row
              </button>
            </div>
            <div className="space-y-2">
              {form.line_items.map((item, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-12">
                  <input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateLineItem(index, "description", e.target.value)}
                    className="sm:col-span-5 rounded-lg border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] px-3 py-2 text-sm text-[var(--admin-text)]"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity || ""}
                    onChange={(e) => updateLineItem(index, "quantity", e.target.value)}
                    className="sm:col-span-2 rounded-lg border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] px-3 py-2 text-sm text-[var(--admin-text)]"
                  />
                  <input
                    type="number"
                    placeholder="Unit price"
                    value={item.unit_price || ""}
                    onChange={(e) => updateLineItem(index, "unit_price", e.target.value)}
                    className="sm:col-span-3 rounded-lg border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] px-3 py-2 text-sm text-[var(--admin-text)]"
                  />
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <span className="text-sm tabular-nums text-[var(--admin-text-muted)]">{formatCurrency(item.quantity * item.unit_price)}</span>
                    {form.line_items.length > 1 ? (
                      <button type="button" onClick={() => setForm((prev) => ({ ...prev, line_items: prev.line_items.filter((_, i) => i !== index) }))} className="text-xs text-red-400 hover:text-red-300">
                        ×
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-right text-sm font-medium text-[var(--admin-text)]">Total: {formatCurrency(formTotal)}</p>
          </div>

          <AdminField label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} multiline rows={2} />

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
    </div>
  );
}
