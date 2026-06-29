"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

export type AdminPaginationProps = {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  entityName: string;
  emptyMessage?: string;
  perPageOptions?: number[];
  maxVisiblePages?: number;
  showEllipsis?: boolean;
  spacing?: "default" | "relaxed";
};

function buildPageItems(
  page: number,
  totalPages: number,
  maxVisible: number,
  showEllipsis: boolean,
): (number | "ellipsis")[] {
  if (totalPages <= 1) {
    return totalPages === 1 ? [1] : [];
  }

  if (!showEllipsis) {
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);
    startPage = Math.max(1, endPage - maxVisible + 1);
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  let startPage = Math.max(1, page - 2);
  const endPage = Math.min(totalPages, startPage + maxVisible - 1);
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
}

export function AdminPagination({
  page,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
  entityName,
  emptyMessage,
  perPageOptions = [8, 16, 24, 32],
  maxVisiblePages = 5,
  showEllipsis = true,
  spacing = "default",
}: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  const pages = useMemo(
    () => buildPageItems(page, totalPages, maxVisiblePages, showEllipsis),
    [page, totalPages, maxVisiblePages, showEllipsis],
  );

  const summary =
    total === 0
      ? (emptyMessage ?? `No ${entityName} to show`)
      : `Showing ${start} to ${end} of ${total} ${entityName}`;

  return (
    <footer
      className={cn(
        "admin-pagination mt-6 flex flex-col gap-4 border-t border-[var(--admin-border-subtle)] pt-5 sm:flex-row sm:items-center sm:justify-between",
        spacing === "relaxed" && "mt-8 pt-6",
      )}
    >
      <p className="text-sm text-[var(--admin-text-muted)]">{summary}</p>

      <div className={cn("flex flex-wrap items-center", spacing === "relaxed" ? "gap-2" : "gap-1.5")}>
        {page > 1 && (
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            className="admin-pagination-btn"
            aria-label="Previous page"
          >
            ←
          </button>
        )}
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-[var(--admin-text-muted)]">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={cn("admin-pagination-btn", p === page && "admin-pagination-btn-active")}
            >
              {p}
            </button>
          ),
        )}
        {page < totalPages && (
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            className="admin-pagination-btn"
            aria-label="Next page"
          >
            →
          </button>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--admin-text-muted)]">
        Show
        <select
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          className="admin-pagination-select"
        >
          {perPageOptions.map((n) => (
            <option key={n} value={n} className="bg-[var(--admin-bg)] text-[var(--admin-text)]">
              {n}
            </option>
          ))}
        </select>
        per page
      </label>
    </footer>
  );
}
