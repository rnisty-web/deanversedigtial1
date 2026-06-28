"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

type LeadsPaginationProps = {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
};

export function LeadsPagination({
  page,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
}: LeadsPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  const pages = useMemo(() => {
    const maxVisible = 5;
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    startPage = Math.max(1, endPage - maxVisible + 1);
    const items: (number | "ellipsis")[] = [];
    for (let p = startPage; p <= endPage; p++) {
      items.push(p);
    }
    if (endPage < totalPages - 1) {
      items.push("ellipsis");
    }
    if (totalPages > endPage) {
      items.push(totalPages);
    }
    return items;
  }, [page, totalPages]);

  return (
    <footer className="admin-leads-pagination mt-6 flex flex-col gap-4 border-t border-[var(--admin-border-subtle)] pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[var(--admin-text-muted)]">
        {total === 0 ? "No leads to show" : `Showing ${start} to ${end} of ${total} leads`}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        {page > 1 && (
          <button type="button" onClick={() => onPageChange(page - 1)} className="admin-leads-page-btn" aria-label="Previous">
            ←
          </button>
        )}
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`e-${i}`} className="px-1 text-[var(--admin-text-muted)]">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={cn("admin-leads-page-btn", p === page && "admin-leads-page-btn-active")}
            >
              {p}
            </button>
          ),
        )}
        {page < totalPages && (
          <button type="button" onClick={() => onPageChange(page + 1)} className="admin-leads-page-btn" aria-label="Next">
            →
          </button>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--admin-text-muted)]">
        Show
        <select
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          className="admin-leads-select !w-auto py-1.5"
        >
          {[8, 16, 24, 32].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        per page
      </label>
    </footer>
  );
}
