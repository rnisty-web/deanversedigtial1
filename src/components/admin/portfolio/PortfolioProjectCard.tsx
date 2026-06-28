"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type PortfolioCardItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  industry: string | null;
  tags: string[];
  featured: boolean;
  published: boolean;
  updated_at?: string;
  created_at?: string;
};

type PortfolioProjectCardProps = {
  item: PortfolioCardItem;
  onEdit: () => void;
  onTogglePublish: () => void;
  onDelete: () => void;
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PortfolioProjectCard({
  item,
  onEdit,
  onTogglePublish,
  onDelete,
}: PortfolioProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const category = item.industry || item.tags[0] || "Project";
  const date = formatDate(item.updated_at ?? item.created_at);

  return (
    <article className="admin-portfolio-card group">
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--admin-panel)]">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--admin-text-muted)]">
            No image
          </div>
        )}

        {item.featured && (
          <span className="absolute left-3 top-3 rounded-md border border-[var(--admin-gold)]/50 bg-[var(--admin-gold)]/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0a0a0a]">
            Featured
          </span>
        )}

        <div ref={menuRef} className="absolute right-2 top-2">
          <button
            type="button"
            aria-label="Project menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/50 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/70"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <div className="admin-content-add-menu absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl">
              <button type="button" className="admin-sidebar-menu-item w-full text-left" onClick={() => { onEdit(); setMenuOpen(false); }}>
                Edit
              </button>
              <button type="button" className="admin-sidebar-menu-item w-full text-left" onClick={() => { onTogglePublish(); setMenuOpen(false); }}>
                {item.published ? "Unpublish" : "Publish"}
              </button>
              <Link
                href={`/portfolio/${item.slug}`}
                target="_blank"
                className="admin-sidebar-menu-item block"
                onClick={() => setMenuOpen(false)}
              >
                Preview
              </Link>
              <button
                type="button"
                className="admin-sidebar-menu-item w-full text-left text-red-300"
                onClick={() => { onDelete(); setMenuOpen(false); }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400/90">
          {category}
        </p>
        <h3 className="mt-1 line-clamp-1 text-base font-semibold text-[var(--admin-text)]">
          {item.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-[var(--admin-text-muted)]">
          {item.description || "No description yet."}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--admin-border-subtle)] pt-3">
          <div className="flex items-center gap-3 text-xs text-[var(--admin-text-muted)]">
            <span className="inline-flex items-center gap-1" title="Views not tracked yet">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              —
            </span>
            <span className="inline-flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {date}
            </span>
          </div>
          <span
            className={cn(
              "admin-content-status-badge",
              item.published ? "admin-content-status-published" : "admin-content-status-draft",
            )}
          >
            {item.published ? "Published" : "Draft"}
          </span>
        </div>
      </div>
    </article>
  );
}
