"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { PortfolioCardItem } from "@/components/admin/portfolio/PortfolioProjectCard";

type PortfolioListRowProps = {
  item: PortfolioCardItem;
  sortOrder: number;
  onEdit: () => void;
  onTogglePublish: () => void;
  onToggleFeatured: () => void;
  onDelete: () => void;
};

export function PortfolioListRow({
  item,
  sortOrder,
  onEdit,
  onTogglePublish,
  onToggleFeatured,
  onDelete,
}: PortfolioListRowProps) {
  const previewHref = item.published
    ? `/portfolio/${item.slug}`
    : `/admin/portfolio/preview/${item.slug}`;

  return (
    <div className="admin-portfolio-list-row">
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--admin-panel)]">
        {item.image_url ? (
          <Image src={item.image_url} alt="" fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-[var(--admin-text-muted)]">
            No image
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/90">
            {item.industry || "Project"}
          </p>
          {item.featured && (
            <span className="rounded-md border border-[var(--admin-gold)]/35 bg-[var(--admin-gold)]/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--admin-gold-light)]">
              Homepage
            </span>
          )}
          <span className="text-[10px] text-[var(--admin-text-muted)]">Order {sortOrder}</span>
        </div>
        <p className="truncate font-medium text-[var(--admin-text)]">{item.title}</p>
        <p className="truncate text-xs text-[var(--admin-text-muted)]">
          {item.description || "No description"}
        </p>
      </div>

      <span
        className={cn(
          "admin-content-status-badge shrink-0",
          item.published ? "admin-content-status-published" : "admin-content-status-draft",
        )}
      >
        {item.published ? "Published" : "Draft"}
      </span>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
        <button type="button" className="admin-btn-ghost px-2 py-1 text-xs" onClick={onEdit}>
          Edit
        </button>
        <button type="button" className="admin-btn-ghost px-2 py-1 text-xs" onClick={onToggleFeatured}>
          {item.featured ? "Unfeature" : "Feature"}
        </button>
        <button type="button" className="admin-btn-ghost px-2 py-1 text-xs" onClick={onTogglePublish}>
          {item.published ? "Unpublish" : "Publish"}
        </button>
        <Link
          href={previewHref}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn-ghost px-2 py-1 text-xs"
        >
          Preview
        </Link>
        <button
          type="button"
          className="admin-btn-ghost px-2 py-1 text-xs text-red-300 hover:text-red-200"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
