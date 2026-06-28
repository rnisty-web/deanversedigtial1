"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

type TestimonialsPaginationProps = {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
};

export function TestimonialsPagination({
  page,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
}: TestimonialsPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  const pages = useMemo(() => {
    const maxVisible = 3;
    let pageStart = Math.max(1, page - 1);
    let pageEnd = Math.min(totalPages, pageStart + maxVisible - 1);
    pageStart = Math.max(1, pageEnd - maxVisible + 1);
    return Array.from({ length: pageEnd - pageStart + 1 }, (_, i) => pageStart + i);
  }, [page, totalPages]);

  return (
    <footer className="admin-testimonials-pagination mt-8 flex flex-col gap-4 border-t border-[var(--admin-border-subtle)] pt-6 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[var(--admin-text-muted)]">
        {total === 0
          ? "No testimonials to show"
          : `Showing ${start} to ${end} of ${total} testimonials`}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {page > 1 && (
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            className="admin-testimonials-page-btn"
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
              "admin-testimonials-page-btn",
              p === page && "admin-testimonials-page-btn-active",
            )}
          >
            {p}
          </button>
        ))}
        {page < totalPages && (
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            className="admin-testimonials-page-btn"
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
          className="admin-testimonials-select !w-auto py-1.5"
        >
          {[6, 9, 12, 18].map((n) => (
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
