"use client";

import { useEffect, useRef, useState } from "react";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { LeadBadge, LeadStatusBadge } from "@/components/admin/leads/LeadsSidebar";
import type { LeadRecord } from "@/lib/leads/utils";
import {
  formatLeadDate,
  initials,
  LEAD_STATUSES,
  serviceLabel,
  sourceStyle,
  statusStyle,
} from "@/lib/leads/utils";
import { cn } from "@/lib/utils";

type LeadsTableProps = {
  leads: LeadRecord[];
  loading: boolean;
  viewMode: "list" | "grid";
  bulkMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (ids: string[]) => void;
  onView: (lead: LeadRecord) => void;
  onNotes: (lead: LeadRecord) => void;
  onStatusChange: (lead: LeadRecord, status: string) => void;
  onConvert: (lead: LeadRecord) => void;
  onDelete: (id: string) => void;
};

export function LeadsTable({
  leads,
  loading,
  viewMode,
  bulkMode,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onView,
  onNotes,
  onStatusChange,
  onConvert,
  onDelete,
}: LeadsTableProps) {
  const [menuId, setMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuId) return;
    function close(e: MouseEvent) {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      setMenuId(null);
    }
    function closeOnEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuId(null);
    }
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuId]);

  if (loading) {
    return <AdminTableSkeleton />;
  }

  if (leads.length === 0) {
    return (
      <div className="admin-leads-empty flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-[var(--admin-text)]">No leads match your filters</p>
        <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
          Try widening the date range or clearing filters to see more leads.
        </p>
      </div>
    );
  }

  const allSelected = leads.length > 0 && leads.every((l) => selectedIds.has(l.id));

  if (viewMode === "grid") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {leads.map((lead) => (
          <article key={lead.id} className="admin-leads-card">
            {bulkMode && (
              <label className="admin-leads-bulk-check">
                <input
                  type="checkbox"
                  checked={selectedIds.has(lead.id)}
                  onChange={() => onToggleSelect(lead.id)}
                  className="rounded border-[var(--admin-border-subtle)]"
                />
              </label>
            )}
            <div className="flex items-start gap-3">
              <div className="admin-leads-avatar">{initials(lead.name)}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[var(--admin-text)]">{lead.name}</p>
                <p className="truncate text-xs text-[var(--admin-text-muted)]">{lead.company ?? "—"}</p>
              </div>
              <LeadStatusBadge status={lead.status} />
            </div>
            <div className="mt-3 space-y-1 text-xs text-[var(--admin-text-muted)]">
              <p>{lead.email}</p>
              <p>{lead.phone ?? "—"}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {lead.source && (
                <LeadBadge label={lead.source} style={sourceStyle(lead.source)} />
              )}
            </div>
            <p className="mt-2 text-xs text-[var(--admin-text-muted)]">{serviceLabel(lead)}</p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => onView(lead)} className="admin-leads-action-btn" aria-label="View">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => onNotes(lead)}
                className="admin-leads-action-btn text-xs px-2"
              >
                Notes
              </button>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="admin-leads-table-wrap overflow-x-auto">
      <table className="admin-leads-table w-full min-w-[960px] text-sm">
        <thead>
          <tr className="text-left text-[11px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">
            {bulkMode && (
              <th className="w-10 px-3 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => onToggleSelectAll(leads.map((l) => l.id))}
                  className="rounded border-[var(--admin-border-subtle)]"
                  aria-label="Select all on page"
                />
              </th>
            )}
            <th className="px-3 py-3">Lead</th>
            <th className="px-3 py-3">Contact</th>
            <th className="px-3 py-3">Source</th>
            <th className="px-3 py-3">Service Interest</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3">Assigned To</th>
            <th className="px-3 py-3">Date Added</th>
            <th className="px-3 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const src = sourceStyle(lead.source);
            return (
              <tr key={lead.id} className="admin-leads-table-row">
                {bulkMode && (
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(lead.id)}
                      onChange={() => onToggleSelect(lead.id)}
                      className="rounded border-[var(--admin-border-subtle)]"
                      aria-label={`Select ${lead.name}`}
                    />
                  </td>
                )}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="admin-leads-avatar !h-9 !w-9 text-xs">{initials(lead.name)}</div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[var(--admin-text)]">{lead.name}</p>
                      <p className="truncate text-xs text-[var(--admin-text-muted)]">{lead.company ?? "—"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <p className="truncate text-[var(--admin-text)]">{lead.email}</p>
                  <p className="truncate text-xs text-[var(--admin-text-muted)]">{lead.phone ?? "—"}</p>
                </td>
                <td className="px-3 py-3">
                  {lead.source ? (
                    <LeadBadge label={lead.source} style={src} />
                  ) : (
                    <span className="text-[var(--admin-text-muted)]">—</span>
                  )}
                </td>
                <td className="max-w-[180px] px-3 py-3 text-xs leading-relaxed text-[var(--admin-text-muted)]">
                  {serviceLabel(lead)}
                </td>
                <td className="px-3 py-3">
                  <LeadStatusBadge status={lead.status} />
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="admin-leads-avatar !h-7 !w-7 text-[10px] opacity-60">U</div>
                    <span className="text-xs text-[var(--admin-text-muted)]">Unassigned</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-xs text-[var(--admin-text-muted)]">
                  {formatLeadDate(lead.created_at)}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onView(lead)}
                      className="admin-leads-action-btn"
                      aria-label={`View ${lead.name}`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    <div className="relative" ref={menuId === lead.id ? menuRef : undefined}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuId(menuId === lead.id ? null : lead.id);
                        }}
                        className="admin-leads-action-btn"
                        aria-label="More actions"
                        aria-expanded={menuId === lead.id}
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="5" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="12" cy="19" r="1.5" />
                        </svg>
                      </button>
                      {menuId === lead.id && (
                        <div className="admin-leads-menu" role="menu">
                          <button type="button" onClick={() => { onView(lead); setMenuId(null); }}>View details</button>
                          <button type="button" onClick={() => { onNotes(lead); setMenuId(null); }}>Edit notes</button>
                          {LEAD_STATUSES.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => { onStatusChange(lead, s); setMenuId(null); }}
                              className={cn(lead.status === s && "text-[var(--admin-gold-light)]")}
                            >
                              Mark as {statusStyle(s).label}
                            </button>
                          ))}
                          {lead.status !== "converted" && (
                            <button type="button" onClick={() => { onConvert(lead); setMenuId(null); }}>
                              Convert to client
                            </button>
                          )}
                          <a href={`mailto:${lead.email}`} className="admin-leads-menu-link">Send email</a>
                          <button type="button" className="text-red-300" onClick={() => { onDelete(lead.id); setMenuId(null); }}>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
