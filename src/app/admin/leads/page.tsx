"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminField } from "@/components/admin/AdminField";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import {
  LeadsAdminHeader,
  LeadsSelect,
  LeadsStatCard,
} from "@/components/admin/leads/LeadsAdminHeader";
import { LeadsPagination } from "@/components/admin/leads/LeadsPagination";
import { LeadsSidebar } from "@/components/admin/leads/LeadsSidebar";
import { LeadsTable } from "@/components/admin/leads/LeadsTable";
import { leadStatuses } from "@/lib/constants";
import type { LeadRecord } from "@/lib/leads/utils";
import {
  STAT_CARDS,
  allTimeRangeLocal,
  exportLeadsCsv,
  isInDateRange,
  monthGrowthHint,
  monthRangeLocal,
  sourcesMatch,
  statCount,
} from "@/lib/leads/utils";
import { cn } from "@/lib/utils";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function formatDateRange(from: string, to: string) {
  const f = new Date(from + "T12:00:00");
  const t = new Date(to + "T12:00:00");
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  return `${f.toLocaleDateString("en-US", opts)} – ${t.toLocaleDateString("en-US", opts)}`;
}

const statIcons: Record<string, React.ReactNode> = {
  new: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  contacted: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  qualified: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  proposal: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 4.5c.207 0 .375.336.375.75s-.168.75-.375.75-.375-.336-.375-.75.168-.75.375-.75Zm4.125-4.5c.207 0 .375.336.375.75s-.168.75-.375.75-.375-.336-.375-.75.168-.75.375-.75Zm-.375 4.5c.207 0 .375.336.375.75s-.168.75-.375.75-.375-.336-.375-.75.168-.75.375-.75Z" />
    </svg>
  ),
  negotiation: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0V7.875c0-.621-.504-1.125-1.125-1.125H9.375c-.621 0-1.125.504-1.125 1.125v3.75m8.625 0V9.375c0-.621-.504-1.125-1.125-1.125H9.375c-.621 0-1.125.504-1.125 1.125v3.75" />
    </svg>
  ),
  lost: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function AdminLeadsPage() {
  const defaultRange = allTimeRangeLocal();
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState(defaultRange.from);
  const [dateTo, setDateTo] = useState(defaultRange.to);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  const [detailLead, setDetailLead] = useState<LeadRecord | null>(null);
  const [notesLead, setNotesLead] = useState<LeadRecord | null>(null);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [savingLead, setSavingLead] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "Website",
    service_interest: "",
    project_type: "",
    budget: "",
    message: "",
    status: "new",
  });

  const [convertLead, setConvertLead] = useState<LeadRecord | null>(null);
  const [convertStep, setConvertStep] = useState<1 | 2>(1);
  const [createProject, setCreateProject] = useState(true);
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [clientForm, setClientForm] = useState({ name: "", email: "", phone: "", company: "" });
  const [projectForm, setProjectForm] = useState({ title: "", description: "", status: "planning" });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/leads", { credentials: "same-origin" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to load leads");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setLeads(data.leads ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    setPage(1);
  }, [search, sourceFilter, serviceFilter, statusFilter, dateFrom, dateTo, perPage]);

  useEffect(() => {
    if (!detailLead) return;
    const fresh = leads.find((l) => l.id === detailLead.id);
    if (fresh) setDetailLead(fresh);
    else setDetailLead(null);
  }, [leads, detailLead?.id]);

  useEffect(() => {
    if (sourceFilter !== "all" && !leads.some((l) => sourcesMatch(l.source, sourceFilter))) {
      setSourceFilter("all");
    }
    if (
      serviceFilter !== "all" &&
      !leads.some((l) => l.service_interest === serviceFilter || l.project_type === serviceFilter)
    ) {
      setServiceFilter("all");
    }
  }, [leads, sourceFilter, serviceFilter]);

  const sourceOptions = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => { if (l.source) set.add(l.source); });
    return [{ value: "all", label: "All Sources" }, ...[...set].sort().map((s) => ({ value: s, label: s }))];
  }, [leads]);

  const serviceOptions = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.service_interest) set.add(l.service_interest);
      if (l.project_type) set.add(l.project_type);
    });
    return [{ value: "all", label: "All Services" }, ...[...set].sort().map((s) => ({ value: s, label: s }))];
  }, [leads]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return leads.filter((lead) => {
      if (statusFilter !== "all" && lead.status !== statusFilter) return false;
      if (!sourcesMatch(lead.source, sourceFilter)) return false;
      if (serviceFilter !== "all" && lead.service_interest !== serviceFilter && lead.project_type !== serviceFilter) return false;
      if (!isInDateRange(lead.created_at, dateFrom, dateTo)) return false;
      if (!q) return true;
      return [lead.name, lead.email, lead.company, lead.service_interest, lead.budget, lead.project_type, lead.message, lead.source]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [leads, search, sourceFilter, serviceFilter, statusFilter, dateFrom, dateTo]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    if (page > totalPages) setPage(totalPages);
  }, [filtered.length, perPage, page]);

  async function updateLead(id: string, updates: Partial<LeadRecord>) {
    setError(null);
    const res = await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id, ...updates }),
    });
    if (res.ok) {
      setSuccess(null);
      await fetchLeads();
      return true;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Failed to update lead");
    return false;
  }

  async function deleteLead(id: string) {
    if (!confirm("Delete this lead?")) return;
    setError(null);
    const res = await fetch(`/api/admin/leads?id=${id}`, { method: "DELETE", credentials: "same-origin" });
    if (res.ok) {
      if (detailLead?.id === id) setDetailLead(null);
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      setSuccess("Lead deleted.");
      await fetchLeads();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Failed to delete lead");
  }

  async function bulkDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected lead(s)?`)) return;
    setError(null);
    const ids = [...selectedIds];
    let deleted = 0;
    for (const id of ids) {
      const res = await fetch(`/api/admin/leads?id=${id}`, { method: "DELETE", credentials: "same-origin" });
      if (res.ok) deleted++;
    }
    if (detailLead && ids.includes(detailLead.id)) setDetailLead(null);
    setSelectedIds(new Set());
    setBulkMode(false);
    setSuccess(`Deleted ${deleted} lead(s).`);
    await fetchLeads();
  }

  async function saveNotes() {
    if (!notesLead) return;
    setSavingNotes(true);
    setError(null);
    const ok = await updateLead(notesLead.id, { notes });
    setSavingNotes(false);
    if (ok) {
      setNotesLead(null);
      setSuccess("Notes saved.");
    }
  }

  function openConvert(lead: LeadRecord) {
    setConvertLead(lead);
    setConvertStep(1);
    setCreateProject(true);
    setConvertError(null);
    setClientForm({ name: lead.name, email: lead.email, phone: lead.phone ?? "", company: lead.company ?? "" });
    const projectLabel = lead.project_type ?? lead.service_interest ?? "New project";
    setProjectForm({ title: projectLabel, description: lead.message ?? "", status: "planning" });
  }

  function closeConvert() {
    setConvertLead(null);
    setConvertStep(1);
    setConvertError(null);
  }

  async function handleConvert() {
    if (!convertLead) return;
    setConverting(true);
    setConvertError(null);
    const res = await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        action: "convert",
        lead_id: convertLead.id,
        client: clientForm,
        project: createProject
          ? { title: projectForm.title, description: projectForm.description, status: projectForm.status, budget: convertLead.budget }
          : undefined,
      }),
    });
    setConverting(false);
    if (res.ok) {
      closeConvert();
      if (detailLead?.id === convertLead.id) setDetailLead(null);
      fetchLeads();
      setSuccess("Lead converted to client successfully.");
      return;
    }
    const data = await res.json().catch(() => ({}));
    setConvertError(data.error ?? "Failed to convert lead");
  }

  async function createLead() {
    if (!isValidEmail(leadForm.email)) {
      setError("Enter a valid email address.");
      return;
    }
    setSavingLead(true);
    setError(null);
    setSuccess(null);
    const res = await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(leadForm),
    });
    setSavingLead(false);
    if (res.ok) {
      setAddLeadOpen(false);
      setLeadForm({ name: "", email: "", phone: "", company: "", source: "Website", service_interest: "", project_type: "", budget: "", message: "", status: "new" });
      fetchLeads();
      setSuccess("Lead added successfully.");
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Failed to add lead");
  }

  async function importLeads(rows: { name: string; email: string; phone?: string; company?: string; source?: string }[]) {
    if (!rows.length) return;
    setError(null);
    setSuccess(null);
    let imported = 0;
    let failed = 0;
    for (const row of rows) {
      if (!isValidEmail(row.email)) {
        failed++;
        continue;
      }
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ ...row, status: "new" }),
      });
      if (res.ok) imported++;
      else failed++;
    }
    await fetchLeads();
    if (imported > 0) {
      setSuccess(`Imported ${imported} lead${imported === 1 ? "" : "s"}${failed ? ` (${failed} skipped)` : ""}.`);
    } else {
      setError("Import failed. Check that each row has a valid name and email.");
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll(ids: string[]) {
    setSelectedIds((prev) => {
      const allOnPage = ids.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allOnPage) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  }

  function handleQuickNote() {
    const pool = selectedIds.size > 0 ? filtered.filter((l) => selectedIds.has(l.id)) : filtered;
    const first = pool[0];
    if (first) {
      setError(null);
      setNotesLead(first);
      setNotes(first.notes ?? "");
    } else {
      setSuccess(null);
      setError("Select a lead or adjust filters to choose one.");
    }
  }

  function handleQuickEmail() {
    const pool = selectedIds.size > 0 ? filtered.filter((l) => selectedIds.has(l.id)) : filtered;
    const first = pool[0];
    if (first) {
      setError(null);
      window.location.href = `mailto:${first.email}`;
    } else {
      setSuccess(null);
      setError("Select a lead or adjust filters to choose one.");
    }
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
    <div className="admin-leads-page">
      <LeadsAdminHeader
        search={search}
        onSearchChange={setSearch}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((v) => !v)}
        onAddLead={() => setAddLeadOpen(true)}
      />

      <AdminPageContent className="admin-leads-content">
        {error && <AdminAlert tone="error" className="mb-4">{error}</AdminAlert>}
        {success && <AdminAlert tone="success" className="mb-4">{success}</AdminAlert>}

        <div className="mb-6 grid gap-4 grid-cols-2 md:grid-cols-3 2xl:grid-cols-6">
          {STAT_CARDS.map((card) => (
            <LeadsStatCard
              key={card.id}
              label={card.label}
              value={statCount(leads, card)}
              hint={monthGrowthHint(
                leads,
                "statuses" in card ? card.statuses : undefined,
                "match" in card ? card.match : undefined,
              )}
              icon={statIcons[card.id]}
              negative={"negative" in card && card.negative}
            />
          ))}
        </div>

        <div className="admin-leads-layout">
          <div className="admin-leads-main">
            <div className={cn("admin-leads-toolbar", !showFilters && "admin-leads-toolbar-compact")}>
              {showFilters && (
                <div className="admin-leads-toolbar-row">
                  <LeadsSelect value={sourceFilter} onChange={setSourceFilter} options={sourceOptions} />
                  <LeadsSelect value={serviceFilter} onChange={setServiceFilter} options={serviceOptions} />
                  <LeadsSelect
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                      { value: "all", label: "All Statuses" },
                      ...leadStatuses.map((s) => ({
                        value: s,
                        label: s === "converted" ? "Won" : s.charAt(0).toUpperCase() + s.slice(1),
                      })),
                    ]}
                  />
                </div>
              )}

              <div className="admin-leads-toolbar-row admin-leads-toolbar-actions">
                <div className="admin-leads-date-range">
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="admin-leads-date-input" aria-label="From date" />
                  <span className="text-[var(--admin-text-muted)]">–</span>
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="admin-leads-date-input" aria-label="To date" />
                  <span className="hidden text-xs text-[var(--admin-text-muted)] lg:inline">{formatDateRange(dateFrom, dateTo)}</span>
                  <button type="button" onClick={applyThisMonthFilter} className="admin-btn-ghost px-2 py-1 text-[10px]">This month</button>
                  <button type="button" onClick={clearDateFilter} className="admin-btn-ghost px-2 py-1 text-[10px]">All time</button>
                </div>

                <div className="admin-leads-view-toggle">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={cn("admin-leads-view-btn", viewMode === "grid" && "admin-leads-view-btn-active")}
                    aria-label="Grid view"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0111.25 6v2.25A2.25 2.25 0 019.5 10.5H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={cn("admin-leads-view-btn", viewMode === "list" && "admin-leads-view-btn-active")}
                    aria-label="List view"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm0 5.25h.007v.008H3.75v-.008zm0 5.25h.007v.008H3.75v-.008z" />
                    </svg>
                  </button>
                </div>

                <button type="button" onClick={() => exportLeadsCsv(filtered)} className="admin-btn-ghost px-3 py-2 text-xs">
                  Export
                </button>
                <button
                  type="button"
                  onClick={() => { setBulkMode((v) => !v); setSelectedIds(new Set()); }}
                  className={cn("admin-btn-ghost px-3 py-2 text-xs", bulkMode && "border-[var(--admin-gold)]/40 text-[var(--admin-gold-light)]")}
                >
                  Bulk Select
                </button>
              </div>
            </div>

            {bulkMode && selectedIds.size > 0 && (
              <div className="admin-leads-bulk-bar mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--admin-gold)]/25 bg-[var(--admin-gold-soft)] px-4 py-3">
                <p className="text-sm text-[var(--admin-text)]">{selectedIds.size} selected</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={handleQuickEmail} className="admin-btn-ghost px-3 py-1.5 text-xs">Email selected</button>
                  <button type="button" onClick={handleQuickNote} className="admin-btn-ghost px-3 py-1.5 text-xs">Add note</button>
                  <button type="button" onClick={bulkDelete} className="admin-btn-ghost px-3 py-1.5 text-xs text-red-300">Delete selected</button>
                </div>
              </div>
            )}

            <LeadsTable
              leads={paginated}
              loading={loading}
              viewMode={viewMode}
              bulkMode={bulkMode}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onToggleSelectAll={toggleSelectAll}
              onView={setDetailLead}
              onNotes={(lead) => { setNotesLead(lead); setNotes(lead.notes ?? ""); }}
              onStatusChange={async (lead, status) => {
                const ok = await updateLead(lead.id, { status });
                if (ok) setSuccess("Lead status updated.");
              }}
              onConvert={openConvert}
              onDelete={deleteLead}
            />

            {!loading && filtered.length > 0 && (
              <LeadsPagination
                page={page}
                perPage={perPage}
                total={filtered.length}
                onPageChange={setPage}
                onPerPageChange={setPerPage}
              />
            )}
          </div>

          <LeadsSidebar
            leads={leads}
            onAddLead={() => setAddLeadOpen(true)}
            onImport={importLeads}
            onImportError={(message) => { setSuccess(null); setError(message); }}
            onAddNote={handleQuickNote}
            onSendEmail={handleQuickEmail}
          />
        </div>
      </AdminPageContent>

      <AdminModal
        open={!!detailLead}
        onClose={() => setDetailLead(null)}
        title={detailLead ? detailLead.name : "Lead details"}
        size="lg"
        footer={
          detailLead ? (
            <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--admin-border-subtle)] px-6 py-4">
              {detailLead.status !== "converted" && (
                <Button size="sm" className="admin-btn-gold" onClick={() => openConvert(detailLead)}>Convert to client</Button>
              )}
              <Button size="sm" variant="secondary" className="admin-btn-ghost" onClick={() => { setNotesLead(detailLead); setNotes(detailLead.notes ?? ""); }}>Edit notes</Button>
              <Button size="sm" href={`mailto:${detailLead.email}`} variant="ghost" className="admin-btn-ghost">Email lead</Button>
              <Button size="sm" variant="ghost" className="admin-btn-ghost" onClick={() => deleteLead(detailLead.id)}>Delete</Button>
            </div>
          ) : undefined
        }
      >
        {detailLead && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--admin-text-muted)]">Email</p>
                <p className="text-sm text-[var(--admin-text)]">{detailLead.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--admin-text-muted)]">Phone</p>
                <p className="text-sm text-[var(--admin-text)]">{detailLead.phone ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--admin-text-muted)]">Company</p>
                <p className="text-sm text-[var(--admin-text)]">{detailLead.company ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--admin-text-muted)]">Source</p>
                <p className="text-sm text-[var(--admin-text)]">{detailLead.source ?? "—"}</p>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">Status</label>
              <select
                value={detailLead.status}
                onChange={async (e) => {
                  const ok = await updateLead(detailLead.id, { status: e.target.value });
                  if (ok) setSuccess("Lead status updated.");
                }}
                className="admin-input w-full text-sm"
              >
                {leadStatuses.map((s) => (
                  <option key={s} value={s} className="bg-[var(--admin-bg)]">
                    {s === "converted" ? "Won" : s}
                  </option>
                ))}
              </select>
            </div>
            {detailLead.message && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">Inquiry</p>
                <p className="rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] p-4 text-sm leading-relaxed text-[var(--admin-text-muted)]">{detailLead.message}</p>
              </div>
            )}
            {detailLead.notes && (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">Notes</p>
                <p className="text-sm text-[var(--admin-text-muted)]">{detailLead.notes}</p>
              </div>
            )}
          </div>
        )}
      </AdminModal>

      <AdminModal
        open={addLeadOpen}
        onClose={() => setAddLeadOpen(false)}
        title="Add Lead"
        footer={
          <div className="flex justify-end gap-2 border-t border-[var(--admin-border-subtle)] px-6 py-4">
            <Button variant="ghost" size="sm" className="admin-btn-ghost" onClick={() => setAddLeadOpen(false)}>Cancel</Button>
            <Button size="sm" className="admin-btn-gold" disabled={savingLead || !leadForm.name || !leadForm.email} onClick={createLead}>
              {savingLead ? "Saving…" : "Add Lead"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <AdminField label="Name" value={leadForm.name} onChange={(v) => setLeadForm({ ...leadForm, name: v })} />
          <AdminField label="Email" type="email" value={leadForm.email} onChange={(v) => setLeadForm({ ...leadForm, email: v })} />
          <AdminField label="Phone" type="tel" value={leadForm.phone} onChange={(v) => setLeadForm({ ...leadForm, phone: v })} />
          <AdminField label="Company" value={leadForm.company} onChange={(v) => setLeadForm({ ...leadForm, company: v })} />
          <AdminField label="Source" value={leadForm.source} onChange={(v) => setLeadForm({ ...leadForm, source: v })} />
          <AdminField label="Service interest" value={leadForm.service_interest} onChange={(v) => setLeadForm({ ...leadForm, service_interest: v })} />
          <AdminField label="Project type" value={leadForm.project_type} onChange={(v) => setLeadForm({ ...leadForm, project_type: v })} />
          <AdminField label="Budget" value={leadForm.budget} onChange={(v) => setLeadForm({ ...leadForm, budget: v })} />
          <AdminField label="Message" multiline rows={3} value={leadForm.message} onChange={(v) => setLeadForm({ ...leadForm, message: v })} />
        </div>
      </AdminModal>

      <AdminModal
        open={!!notesLead}
        onClose={() => setNotesLead(null)}
        title={notesLead ? `Notes — ${notesLead.name}` : "Notes"}
        footer={
          <div className="flex justify-end gap-2 border-t border-[var(--admin-border-subtle)] px-6 py-4">
            <Button variant="ghost" size="sm" className="admin-btn-ghost" onClick={() => setNotesLead(null)}>Cancel</Button>
            <Button size="sm" className="admin-btn-gold" disabled={savingNotes} onClick={saveNotes}>{savingNotes ? "Saving…" : "Save notes"}</Button>
          </div>
        }
      >
        <AdminField label="Internal notes" multiline rows={5} value={notes} onChange={setNotes} />
      </AdminModal>

      <AdminModal
        open={!!convertLead}
        onClose={closeConvert}
        title={convertLead ? `Convert — ${convertLead.name}` : "Convert lead"}
        size="lg"
        footer={
          <div className="flex items-center justify-between gap-2 border-t border-[var(--admin-border-subtle)] px-6 py-4">
            <div className="flex gap-1">
              {([1, 2] as const).map((step) => (
                <span key={step} className={cn("h-2 w-8 rounded-full transition-colors", convertStep >= step ? "bg-[var(--admin-emerald)]" : "bg-[var(--admin-panel-hover)]")} />
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="admin-btn-ghost" onClick={closeConvert}>Cancel</Button>
              {convertStep === 1 ? (
                <Button size="sm" className="admin-btn-gold" onClick={() => setConvertStep(2)} disabled={!clientForm.name || !clientForm.email}>Next</Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="admin-btn-ghost" onClick={() => setConvertStep(1)}>Back</Button>
                  <Button size="sm" className="admin-btn-gold" disabled={converting || (createProject && !projectForm.title)} onClick={handleConvert}>
                    {converting ? "Converting…" : "Convert lead"}
                  </Button>
                </>
              )}
            </div>
          </div>
        }
      >
        {convertError && <AdminAlert tone="error" className="mb-4">{convertError}</AdminAlert>}
        {convertStep === 1 ? (
          <div className="space-y-4">
            <p className="text-sm text-[var(--admin-text-muted)]">Confirm client details from this lead.</p>
            <AdminField label="Name" value={clientForm.name} onChange={(v) => setClientForm({ ...clientForm, name: v })} />
            <AdminField label="Email" type="email" value={clientForm.email} onChange={(v) => setClientForm({ ...clientForm, email: v })} />
            <AdminField label="Phone" type="tel" value={clientForm.phone} onChange={(v) => setClientForm({ ...clientForm, phone: v })} />
            <AdminField label="Company" value={clientForm.company} onChange={(v) => setClientForm({ ...clientForm, company: v })} />
          </div>
        ) : (
          <div className="space-y-4">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] px-4 py-3">
              <input type="checkbox" checked={createProject} onChange={(e) => setCreateProject(e.target.checked)} className="rounded border-[var(--admin-border-subtle)]" />
              <span className="text-sm text-[var(--admin-text)]">Create a project for this client</span>
            </label>
            {createProject && (
              <>
                <AdminField label="Project title" value={projectForm.title} onChange={(v) => setProjectForm({ ...projectForm, title: v })} />
                <AdminField label="Description" value={projectForm.description} onChange={(v) => setProjectForm({ ...projectForm, description: v })} multiline rows={4} />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">Status</label>
                  <select value={projectForm.status} onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })} className="admin-input w-full text-sm">
                    <option value="draft" className="bg-[var(--admin-bg)]">draft</option>
                    <option value="planning" className="bg-[var(--admin-bg)]">planning</option>
                    <option value="in_progress" className="bg-[var(--admin-bg)]">in progress</option>
                  </select>
                </div>
              </>
            )}
          </div>
        )}
      </AdminModal>
    </div>
  );
}
