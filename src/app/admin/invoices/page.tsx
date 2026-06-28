"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import { invoiceStatuses } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { InvoiceLineItem } from "@/types";

type Client = { id: string; name: string; email: string };
type Project = { id: string; title: string; client_id: string };

type Invoice = {
  id: string;
  client_id: string;
  project_id: string | null;
  invoice_number: string;
  amount: number;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  line_items: InvoiceLineItem[] | null;
  notes: string | null;
  created_at: string;
  clients?: Client | Client[] | null;
  projects?: { id: string; title: string } | { id: string; title: string }[] | null;
};

function joinName(clients: Invoice["clients"]) {
  if (!clients) return "—";
  const c = Array.isArray(clients) ? clients[0] : clients;
  return c?.name ?? "—";
}

function joinProjectTitle(projects: Invoice["projects"]) {
  if (!projects) return "—";
  const p = Array.isArray(projects) ? projects[0] : projects;
  return p?.title ?? "—";
}

const emptyLineItem = (): InvoiceLineItem => ({
  description: "",
  quantity: 1,
  unit_price: 0,
  total: 0,
});

const emptyForm = {
  client_id: "",
  project_id: "",
  invoice_number: "",
  status: "draft",
  due_date: "",
  notes: "",
  line_items: [emptyLineItem()] as InvoiceLineItem[],
};

function computeTotal(items: InvoiceLineItem[]) {
  return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (statusFilter !== "all" && inv.status !== statusFilter) return false;
      if (!q) return true;
      return [
        inv.invoice_number,
        joinName(inv.clients),
        joinProjectTitle(inv.projects),
        inv.notes,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [invoices, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const map: Record<string, number> = { all: invoices.length };
    invoiceStatuses.forEach((s) => {
      map[s] = invoices.filter((i) => i.status === s).length;
    });
    return map;
  }, [invoices]);

  const clientProjects = useMemo(
    () =>
      form.client_id
        ? projects.filter((p) => p.client_id === form.client_id)
        : projects,
    [projects, form.client_id],
  );

  function openCreate() {
    setEditId(null);
    const nextNum = `INV-${String(invoices.length + 1).padStart(4, "0")}`;
    setForm({ ...emptyForm, invoice_number: nextNum, line_items: [emptyLineItem()] });
    setShowForm(true);
  }

  function startEdit(invoice: Invoice) {
    setEditId(invoice.id);
    setForm({
      client_id: invoice.client_id,
      project_id: invoice.project_id ?? "",
      invoice_number: invoice.invoice_number,
      status: invoice.status,
      due_date: invoice.due_date ?? "",
      notes: invoice.notes ?? "",
      line_items:
        invoice.line_items && invoice.line_items.length > 0
          ? invoice.line_items
          : [emptyLineItem()],
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
  }

  function updateLineItem(index: number, field: keyof InvoiceLineItem, value: string) {
    setForm((prev) => {
      const items = [...prev.line_items];
      const item = { ...items[index] };
      if (field === "description") {
        item.description = value;
      } else {
        const num = parseFloat(value) || 0;
        if (field === "quantity") item.quantity = num;
        if (field === "unit_price") item.unit_price = num;
        item.total = item.quantity * item.unit_price;
      }
      items[index] = item;
      return { ...prev, line_items: items };
    });
  }

  function addLineItem() {
    setForm((prev) => ({
      ...prev,
      line_items: [...prev.line_items, emptyLineItem()],
    }));
  }

  function removeLineItem(index: number) {
    setForm((prev) => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
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
    }
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch("/api/admin/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      fetchData();
      if (selected?.id === id) {
        setSelected((prev) => (prev ? { ...prev, status } : prev));
      }
    }
  }

  async function deleteInvoice(id: string) {
    if (!confirm("Delete this invoice?")) return;
    await fetch(`/api/admin/invoices?id=${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (selected?.id === id) setSelected(null);
    fetchData();
  }

  const formTotal = computeTotal(form.line_items);

  return (
    <>
      <AdminHeader
        title="Invoices"
        subtitle="Create and manage client invoices — visible in the portal when marked sent."
      />

      <AdminPageContent>
        {error && (
          <AdminAlert tone="error" className="mb-6">
            {error}
          </AdminAlert>
        )}

        {!loading && clients.length === 0 && (
          <AdminAlert tone="warning" className="mb-6">
            Add a client before creating invoices.{" "}
            <Link href="/admin/clients" className="underline">
              Go to Clients
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
                ? "admin-luxury-card border-[color-mix(in_srgb,var(--admin-gold)_35%,transparent)] text-[var(--admin-gold-light)]"
                : "border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text-muted)]",
            )}
          >
            All ({statusCounts.all ?? 0})
          </button>
          {invoiceStatuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm capitalize transition-all",
                statusFilter === status
                  ? "admin-luxury-card border-[color-mix(in_srgb,var(--admin-gold)_35%,transparent)] text-[var(--admin-gold-light)]"
                  : "border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] text-[var(--admin-text-muted)] hover:text-[var(--admin-text-muted)]",
              )}
            >
              {status} ({statusCounts[status] ?? 0})
            </button>
          ))}
        </div>

        <AdminToolbar>
          <AdminSearchInput value={search} onChange={setSearch} placeholder="Search invoices…" />
          <Button size="sm" className="admin-btn-gold" onClick={openCreate} disabled={clients.length === 0}>
            + New invoice
          </Button>
        </AdminToolbar>

        {loading ? (
          <AdminTableSkeleton />
        ) : filtered.length === 0 ? (
          <AdminEmptyState
            title="No invoices found"
            description="Create an invoice for a client. Set status to sent for it to appear in their portal."
            actionLabel="New invoice"
            onAction={openCreate}
          />
        ) : (
          <div className="grid gap-6 xl:grid-cols-5">
            <div className="admin-luxury-card overflow-hidden rounded-3xl xl:col-span-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-[var(--admin-border-subtle)] bg-[var(--admin-panel)]">
                    <tr className="text-left text-[10px] uppercase tracking-[0.16em] text-[var(--admin-text-muted)]">
                      <th className="px-5 py-4 font-semibold">Invoice</th>
                      <th className="px-5 py-4 font-semibold">Client</th>
                      <th className="px-5 py-4 font-semibold">Amount</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 font-semibold">Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((invoice) => (
                      <tr
                        key={invoice.id}
                        onClick={() => setSelected(invoice)}
                        className={cn(
                          "cursor-pointer border-t border-[var(--admin-border-subtle)] transition-colors hover:bg-[var(--admin-panel-hover)]",
                          selected?.id === invoice.id &&
                            "bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]",
                        )}
                      >
                        <td className="px-5 py-4 font-medium text-[var(--admin-text)]">
                          {invoice.invoice_number}
                        </td>
                        <td className="px-5 py-4 text-[var(--admin-text-muted)]">{joinName(invoice.clients)}</td>
                        <td className="px-5 py-4 tabular-nums text-[var(--admin-text-muted)]">
                          ${Number(invoice.amount).toLocaleString()}
                        </td>
                        <td className="px-5 py-4">
                          <AdminStatusBadge status={invoice.status} />
                        </td>
                        <td className="px-5 py-4 text-[var(--admin-text-muted)]">
                          {invoice.due_date
                            ? new Date(invoice.due_date).toLocaleDateString()
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
                      Selected invoice
                    </p>
                    <AdminStatusBadge status={selected.status} className="mt-3" />
                    <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--admin-text)]">
                      {selected.invoice_number}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--admin-text-muted)]">{joinName(selected.clients)}</p>
                    {selected.project_id && (
                      <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
                        Project: {joinProjectTitle(selected.projects)}
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-text-muted)]">
                      Amount
                    </p>
                    <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--admin-text)]">
                      ${Number(selected.amount).toLocaleString()}
                    </p>
                    {selected.due_date && (
                      <p className="mt-2 text-sm text-[var(--admin-text-muted)]">
                        Due {new Date(selected.due_date).toLocaleDateString()}
                      </p>
                    )}
                    {selected.paid_at && (
                      <p className="mt-1 text-sm text-emerald-300/80">
                        Paid {new Date(selected.paid_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {selected.line_items && selected.line_items.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">
                        Line items
                      </p>
                      <ul className="space-y-2 text-sm text-[var(--admin-text-muted)]">
                        {selected.line_items.map((item, i) => (
                          <li
                            key={i}
                            className="flex justify-between gap-2 rounded-xl border border-[var(--admin-border-subtle)] px-3 py-2"
                          >
                            <span>{item.description}</span>
                            <span className="tabular-nums text-[var(--admin-text)]">
                              ${(item.total ?? item.quantity * item.unit_price).toLocaleString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selected.notes && (
                    <p className="text-sm text-[var(--admin-text-muted)]">{selected.notes}</p>
                  )}

                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">
                      Update status
                    </label>
                    <select
                      value={selected.status}
                      onChange={(e) => updateStatus(selected.id, e.target.value)}
                      className="admin-input w-full text-sm"
                    >
                      {invoiceStatuses.map((s) => (
                        <option key={s} value={s} className="bg-[var(--admin-bg)]">
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-[var(--admin-border-subtle)] pt-5">
                    <Button size="sm" variant="secondary" className="admin-btn-ghost" onClick={() => startEdit(selected)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="admin-btn-ghost" onClick={() => deleteInvoice(selected.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <AdminEmptyState
                  title="Select an invoice"
                  description="Choose a row to review details, update status, or edit line items."
                  className="border-none bg-transparent py-8"
                />
              )}
            </div>
          </div>
        )}

        <AdminModal
          open={showForm}
          onClose={closeForm}
          title={editId ? "Edit invoice" : "New invoice"}
          size="xl"
        >
          <form id="invoice-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">Client</label>
                <select
                  required
                  value={form.client_id}
                  onChange={(e) =>
                    setForm({ ...form, client_id: e.target.value, project_id: "" })
                  }
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
                <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">
                  Project (optional)
                </label>
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
              <AdminField
                label="Invoice number"
                value={form.invoice_number}
                onChange={(v) => setForm({ ...form, invoice_number: v })}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="admin-input w-full text-sm"
                >
                  {invoiceStatuses.map((s) => (
                    <option key={s} value={s} className="bg-[var(--admin-bg)]">
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">Due date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="admin-input w-full text-sm"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-[var(--admin-text-muted)]">Line items</label>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="text-xs text-[var(--admin-gold-light)] hover:text-[var(--admin-text)]"
                >
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
                      <span className="text-sm tabular-nums text-[var(--admin-text-muted)]">
                        ${(item.quantity * item.unit_price).toLocaleString()}
                      </span>
                      {form.line_items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-right text-sm font-medium text-[var(--admin-text)]">
                Total: ${formTotal.toLocaleString()}
              </p>
            </div>

            <AdminField
              label="Notes"
              value={form.notes}
              onChange={(v) => setForm({ ...form, notes: v })}
              multiline
              rows={2}
            />

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
