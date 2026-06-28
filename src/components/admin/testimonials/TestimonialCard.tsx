"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type TestimonialCardItem = {
  id: string;
  client_name: string;
  client_company: string | null;
  client_image: string | null;
  content: string;
  rating: number | null;
  featured: boolean;
  published: boolean;
  created_at?: string;
  updated_at?: string;
};

type TestimonialCardProps = {
  item: TestimonialCardItem;
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

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="admin-testimonials-stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={cn("h-3.5 w-3.5", i < rating ? "text-[var(--admin-gold-light)]" : "text-[var(--admin-text)]/15")}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export function TestimonialCard({
  item,
  onEdit,
  onTogglePublish,
  onDelete,
}: TestimonialCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const rating = item.rating ?? 5;
  const date = formatDate(item.updated_at ?? item.created_at);

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

  return (
    <article className="admin-testimonials-card group">
      <div className="relative overflow-hidden bg-[var(--admin-panel)] p-5">
        <div className="admin-testimonials-quote-mark pointer-events-none absolute right-4 top-2 select-none" aria-hidden>
          &ldquo;
        </div>

        {item.featured && (
          <span className="absolute left-3 top-3 rounded-md border border-[var(--admin-gold)]/50 bg-[var(--admin-gold)]/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0a0a0a]">
            Featured
          </span>
        )}

        <div ref={menuRef} className="absolute right-2 top-2">
          <button
            type="button"
            aria-label="Testimonial menu"
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
                href="/testimonials"
                target="_blank"
                className="admin-sidebar-menu-item block"
                onClick={() => setMenuOpen(false)}
              >
                Preview page
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

        <div className="flex gap-4 pt-6">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)]">
            {item.client_image ? (
              <Image
                src={item.client_image}
                alt={item.client_name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-lg font-semibold text-[var(--admin-gold-light)]">
                {item.client_name[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            {item.client_company && (
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400/90">
                {item.client_company}
              </p>
            )}
            <h3 className="admin-heading-serif mt-0.5 line-clamp-1 text-base font-semibold text-[var(--admin-text)]">
              {item.client_name}
            </h3>
          </div>
        </div>

        <p className="admin-testimonials-quote mt-4 line-clamp-4 min-h-[5rem] text-sm leading-relaxed text-[var(--admin-text-muted)]">
          &ldquo;{item.content}&rdquo;
        </p>
      </div>

      <div className="px-5 pb-4">
        <div className="flex items-center justify-between gap-2 border-t border-[var(--admin-border-subtle)] pt-3">
          <div className="flex items-center gap-3 text-xs text-[var(--admin-text-muted)]">
            <StarRating rating={rating} />
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
