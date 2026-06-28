"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { MediaFile } from "@/lib/media/utils";
import {
  formatBytes,
  formatMediaDate,
  getExtension,
  getFileType,
} from "@/lib/media/utils";

type MediaFileCardProps = {
  file: MediaFile;
  bulkMode: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onCopyUrl: () => void;
  onDelete: () => void;
  deleting: boolean;
  copied: boolean;
};

export function MediaFileCard({
  file,
  bulkMode,
  selected,
  onToggleSelect,
  onCopyUrl,
  onDelete,
  deleting,
  copied,
}: MediaFileCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const type = getFileType(file.name);
  const ext = getExtension(file.name).toUpperCase();

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
    <article
      className={cn(
        "admin-media-card group",
        bulkMode && selected && "admin-media-card-selected",
      )}
    >
      {bulkMode && (
        <label className="admin-media-bulk-check">
          <input type="checkbox" checked={selected} onChange={onToggleSelect} />
        </label>
      )}

      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--admin-panel)]">
        {type === "image" ? (
          <Image src={file.url} alt={file.name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" unoptimized />
        ) : type === "video" ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-black/40">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/90">
              <svg className="ml-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)]">Video</span>
          </div>
        ) : type === "document" ? (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <span className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-panel)] px-3 py-2 text-xs font-bold uppercase text-[var(--admin-gold-light)]">
              {ext || "DOC"}
            </span>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--admin-text-muted)]">
            {ext || "FILE"}
          </div>
        )}
      </div>

      <div className="admin-media-card-footer">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[var(--admin-text)]" title={file.name}>
            {file.name}
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--admin-text-muted)]">
            {formatBytes(file.size)} · {ext || "FILE"}
          </p>
          <p className="text-[11px] text-[var(--admin-text-muted)]">{formatMediaDate(file.created_at)}</p>
        </div>

        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            aria-label="File menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="admin-media-menu-btn"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <div className="admin-content-add-menu absolute bottom-full right-0 z-20 mb-1 w-40 overflow-hidden rounded-xl">
              <button type="button" className="admin-sidebar-menu-item w-full text-left" onClick={() => { onCopyUrl(); setMenuOpen(false); }}>
                {copied ? "Copied!" : "Copy URL"}
              </button>
              <Link href={file.url} target="_blank" className="admin-sidebar-menu-item block" onClick={() => setMenuOpen(false)}>
                Open
              </Link>
              <button
                type="button"
                className="admin-sidebar-menu-item w-full text-left text-red-300"
                disabled={deleting}
                onClick={() => { onDelete(); setMenuOpen(false); }}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export function MediaFileListRow({
  file,
  bulkMode,
  selected,
  onToggleSelect,
  onCopyUrl,
  onDelete,
  deleting,
  copied,
}: MediaFileCardProps) {
  const type = getFileType(file.name);
  const ext = getExtension(file.name).toUpperCase();

  return (
    <div className={cn("admin-media-list-row", bulkMode && selected && "admin-media-card-selected")}>
      {bulkMode && (
        <input type="checkbox" checked={selected} onChange={onToggleSelect} className="shrink-0" />
      )}
      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--admin-panel)]">
        {type === "image" ? (
          <Image src={file.url} alt="" fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] font-bold text-[var(--admin-gold-light)]">
            {ext}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--admin-text)]">{file.name}</p>
        <p className="text-xs text-[var(--admin-text-muted)]">
          {formatBytes(file.size)} · {formatMediaDate(file.created_at)}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <button type="button" className="admin-btn-ghost px-2 py-1 text-xs" onClick={onCopyUrl}>
          {copied ? "Copied" : "Copy"}
        </button>
        <button type="button" className="admin-btn-ghost px-2 py-1 text-xs text-red-300" disabled={deleting} onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
