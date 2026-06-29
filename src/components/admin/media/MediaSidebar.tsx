"use client";

import { useMemo } from "react";
import { StatsChart } from "@/components/admin/StatsChart";
import { cn } from "@/lib/utils";
import type { MediaFile, MediaFolder } from "@/lib/media/utils";
import {
  MEDIA_FOLDERS,
  STORAGE_LIMIT_BYTES,
  computeMediaStats,
  folderCount,
  formatBytes,
  getFileType,
  timeAgo,
} from "@/lib/media/utils";

const TYPE_COLORS = ["#34d399", "#c9a962", "#60a5fa", "#9ca3af"];

type MediaSidebarProps = {
  files: MediaFile[];
  activeFolder: MediaFolder;
  onFolderChange: (folder: MediaFolder) => void;
  uploading: boolean;
  onUploadClick: () => void;
  onDropFiles: (files: FileList) => void;
};

export function MediaSidebar({
  files,
  activeFolder,
  onFolderChange,
  uploading,
  onUploadClick,
  onDropFiles,
}: MediaSidebarProps) {
  const totalBytes = files.reduce((sum, f) => sum + (f.size || 0), 0);
  const usedPct = Math.min(100, Math.round((totalBytes / STORAGE_LIMIT_BYTES) * 100));
  const remaining = Math.max(0, STORAGE_LIMIT_BYTES - totalBytes);
  const recent = [...files]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  const typeOverview = useMemo(() => {
    const stats = computeMediaStats(files);
    return {
      labels: ["Images", "Videos", "Documents", "Other"],
      data: [stats.images, stats.videos, stats.documents, stats.other],
      total: stats.total,
    };
  }, [files]);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files?.length) {
      onDropFiles(e.dataTransfer.files);
    }
  }

  return (
    <aside className="admin-media-sidebar">
      <div className="admin-media-sidebar-panel">
        <section className="admin-media-sidebar-section">
          <h3 className="admin-media-sidebar-title">Library Overview</h3>
          <div className="admin-media-overview-chart">
            <StatsChart
              type="doughnut"
              labels={typeOverview.labels}
              datasets={[{ label: "Files", data: typeOverview.data, backgroundColor: TYPE_COLORS }]}
              height={160}
              emptyMessage="No files yet."
              variant="luxury"
              hideLegend
            />
            <p className="admin-media-overview-total">
              <span className="text-2xl font-bold text-[var(--admin-text)]">{typeOverview.total}</span>
              <span className="block text-xs text-[var(--admin-text-muted)]">Total Files</span>
            </p>
          </div>
          <ul className="admin-media-overview-legend">
            {typeOverview.labels.map((label, i) => (
              <li key={label}>
                <span className="admin-media-legend-dot" style={{ backgroundColor: TYPE_COLORS[i] }} />
                {label}
                <span className="ml-auto tabular-nums text-[var(--admin-text-muted)]">{typeOverview.data[i]}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="admin-media-sidebar-divider" />

        <section className="admin-media-sidebar-section">
          <h3 className="admin-media-sidebar-title">Storage Overview</h3>
          <p className="admin-media-storage-label">
            {formatBytes(totalBytes)} / {formatBytes(STORAGE_LIMIT_BYTES)} Used
            <span className="text-[var(--admin-text-muted)]"> ({usedPct}%)</span>
          </p>
          <div className="admin-media-storage-bar">
            <div className="admin-media-storage-fill" style={{ width: `${usedPct}%` }} />
          </div>
          <p className="admin-media-storage-remaining">{formatBytes(remaining)} remaining</p>
        </section>

        <div className="admin-media-sidebar-divider" />

        <section className="admin-media-sidebar-section">
          <div className="admin-media-sidebar-heading">
            <h3>Folders</h3>
            <button type="button" className="admin-media-new-folder" onClick={() => alert("Folder organization uses smart grouping by filename. Rename files with keywords like logo, hero, or portfolio to sort into folders.")}>
              + New Folder
            </button>
          </div>
          <ul className="admin-media-folder-list">
            {MEDIA_FOLDERS.map((folder) => {
              const count = folderCount(files, folder.id);
              return (
                <li key={folder.id}>
                  <button
                    type="button"
                    onClick={() => onFolderChange(folder.id)}
                    className={cn(
                      "admin-media-folder-item",
                      activeFolder === folder.id && "admin-media-folder-item-active",
                    )}
                  >
                    <svg className="h-4 w-4 shrink-0 text-[var(--admin-gold-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                    </svg>
                    <span className="truncate">{folder.label}</span>
                    <span className="ml-auto tabular-nums text-[var(--admin-text-muted)]">{count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="admin-media-sidebar-divider" />

        <section className="admin-media-sidebar-section">
          <h3 className="admin-media-sidebar-title mb-3">Upload Files</h3>
          <button
            type="button"
            onClick={onUploadClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            disabled={uploading}
            className="admin-media-dropzone w-full"
          >
            <svg className="mx-auto h-8 w-8 text-[var(--admin-gold-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
            <p className="mt-2 text-sm font-medium text-[var(--admin-text)]">
              {uploading ? "Uploading…" : "Drag & drop files here"}
            </p>
            <p className="mt-1 text-xs text-[var(--admin-text-muted)]">or click to browse</p>
            <p className="mt-3 text-[10px] leading-relaxed text-[var(--admin-text-muted)]">
              Supports: JPG, PNG, GIF, MP4, PDF, SVG · Max 100 MB
            </p>
          </button>
        </section>

        <div className="admin-media-sidebar-divider" />

        <section className="admin-media-sidebar-section">
          <div className="admin-media-sidebar-heading">
            <h3>Recent Uploads</h3>
            <button type="button" onClick={() => onFolderChange("all")}>View All</button>
          </div>
          {recent.length === 0 ? (
            <p className="admin-media-sidebar-empty">No uploads yet.</p>
          ) : (
            <ul className="admin-media-recent-list">
              {recent.map((file) => {
                const type = getFileType(file.name);
                return (
                  <li key={file.name} className="admin-media-recent-item">
                    <span className="admin-media-recent-icon">
                      {type === "video" ? (
                        <svg className="h-3.5 w-3.5 text-[var(--admin-gold-light)]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      ) : type === "document" ? (
                        <svg className="h-3.5 w-3.5 text-[var(--admin-gold-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                      ) : (
                        <svg className="h-3.5 w-3.5 text-[var(--admin-gold-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" /></svg>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium text-[var(--admin-text)]">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-[var(--admin-text-muted)]">
                        {formatBytes(file.size)} · {timeAgo(file.created_at)}
                      </span>
                    </span>
                    <span className="admin-media-recent-check" aria-hidden>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </aside>
  );
}
