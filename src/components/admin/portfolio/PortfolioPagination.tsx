"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

type PortfolioPaginationProps = {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
};

export function PortfolioPagination({
  page,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
}: PortfolioPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  const pages = useMemo(() => {
    const maxVisible = 3;
    let start = Math.max(1, page - 1);
    let end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <footer className="admin-portfolio-pagination mt-8 flex flex-col gap-4 border-t border-[var(--admin-border-subtle)] pt-6 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[var(--admin-text-muted)]">
        {total === 0
          ? "No projects to show"
          : `Showing ${start} to ${end} of ${total} projects`}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {page > 1 && (
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            className="admin-portfolio-page-btn"
            aria-label="Previous page"
          >
            ←
          </button>
        )}
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              "admin-portfolio-page-btn",
              p === page && "admin-portfolio-page-btn-active",
            )}
          >
            {p}
          </button>
        ))}
        {page < totalPages && (
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            className="admin-portfolio-page-btn"
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
          className="admin-portfolio-select !w-auto py-1.5"
        >
          {[8, 12, 16, 24].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        per page
      </label>
    </footer>
  );
}
