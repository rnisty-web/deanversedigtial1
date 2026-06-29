"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import {
  MediaAdminHeader,
  MediaSelect,
  MediaStatCard,
} from "@/components/admin/media/MediaAdminHeader";
import { MediaFileCard, MediaFileListRow } from "@/components/admin/media/MediaFileCard";
import { MediaPagination } from "@/components/admin/media/MediaPagination";
import { MediaSidebar } from "@/components/admin/media/MediaSidebar";
import { cn } from "@/lib/utils";
import type { MediaFile, MediaFolder, MediaSizeFilter, MediaSort, MediaTab } from "@/lib/media/utils";
import {
  MAX_UPLOAD_BYTES,
  computeMediaStats,
  computeMediaTabCounts,
  filterMediaFiles,
  monthGrowthHint,
  pct,
} from "@/lib/media/utils";

const ACCEPT = "image/*,video/*,.pdf,.svg";

const statIcons = {
  total: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  ),
  images: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
    </svg>
  ),
  videos: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
  documents: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  other: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a2.25 2.25 0 0 1 1.512.586l.837.837a2.25 2.25 0 0 0 1.512.586H18A2.25 2.25 0 0 1 20.25 9v.776" />
    </svg>
  ),
};

export default function AdminMediaPage() {
  const uploadRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<MediaTab>("all");
  const [activeFolder, setActiveFolder] = useState<MediaFolder>("all");
  const [sizeFilter, setSizeFilter] = useState<MediaSizeFilter>("all");
  const [sortBy, setSortBy] = useState<MediaSort>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [bulkMode, setBulkMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(16);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/media", { credentials: "same-origin" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to load media");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setFiles(data.files ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    setPage(1);
  }, [search, activeTab, activeFolder, sizeFilter, sortBy, perPage]);

  const stats = useMemo(() => computeMediaStats(files), [files]);
  const tabCounts = useMemo(() => computeMediaTabCounts(files), [files]);

  const filtered = useMemo(
    () =>
      filterMediaFiles(files, {
        search,
        activeTab,
        activeFolder,
        sizeFilter,
        sortBy,
      }),
    [files, search, activeTab, activeFolder, sizeFilter, sortBy],
  );

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  async function uploadFiles(fileList: FileList | File[]) {
    const arr = Array.from(fileList);
    if (!arr.length) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    let uploaded = 0;
    for (const file of arr) {
      if (file.size > MAX_UPLOAD_BYTES) {
        setError(`${file.name} exceeds 100 MB limit`);
        continue;
      }
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Upload failed");
        break;
      }
      uploaded++;
    }

    setUploading(false);
    if (uploaded > 0) {
      setSuccess(`Uploaded ${uploaded} file${uploaded === 1 ? "" : "s"}.`);
      fetchFiles();
    }
  }

  function handleUploadInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      uploadFiles(e.target.files);
    }
    e.target.value = "";
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  async function deleteFile(name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    setDeleting(name);
    setError(null);
    const res = await fetch(`/api/admin/media?name=${encodeURIComponent(name)}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    setDeleting(null);
    if (res.ok) {
      setSuccess("File deleted.");
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
      fetchFiles();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Failed to delete file");
  }

  async function bulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} selected file(s)?`)) return;
    for (const name of selected) {
      await fetch(`/api/admin/media?name=${encodeURIComponent(name)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
    }
    setSelected(new Set());
    setBulkMode(false);
    setSuccess("Selected files deleted.");
    fetchFiles();
  }

  function toggleSelect(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function handleFolderChange(folder: MediaFolder) {
    setActiveFolder(folder);
    if (folder === "videos") setActiveTab("video");
    else if (folder === "documents") setActiveTab("document");
    else if (folder === "other") setActiveTab("other");
    else if (folder === "images" || folder === "logos" || folder === "backgrounds" || folder === "portfolio") {
      setActiveTab("image");
    } else {
      setActiveTab("all");
    }
  }

  return (
    <div className="admin-media-page">
      <MediaAdminHeader
        search={search}
        onSearchChange={setSearch}
        onUpload={() => uploadRef.current?.click()}
        uploading={uploading}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabCounts={tabCounts}
      />

      <AdminPageContent className="admin-media-content">
        {error && <AdminAlert tone="error" className="mb-4">{error}</AdminAlert>}
        {success && <AdminAlert tone="success" className="mb-4">{success}</AdminAlert>}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <MediaStatCard label="Total Files" value={stats.total} hint={monthGrowthHint(files)} icon={statIcons.total} />
          <MediaStatCard label="Images" value={stats.images} hint={`${pct(stats.images, stats.total)} of total`} icon={statIcons.images} />
          <MediaStatCard label="Videos" value={stats.videos} hint={`${pct(stats.videos, stats.total)} of total`} icon={statIcons.videos} />
          <MediaStatCard label="Documents" value={stats.documents} hint={`${pct(stats.documents, stats.total)} of total`} icon={statIcons.documents} />
          <MediaStatCard label="Other Files" value={stats.other} hint={`${pct(stats.other, stats.total)} of total`} icon={statIcons.other} />
        </div>

        <div className="admin-media-layout">
          <div className="admin-media-main">
            <div className="admin-media-toolbar">
              <div className="flex flex-wrap gap-2">
                <MediaSelect
                  value={activeFolder}
                  onChange={(v) => handleFolderChange(v as MediaFolder)}
                  options={[
                    { value: "all", label: "All Folders" },
                    { value: "images", label: "Website Images" },
                    { value: "portfolio", label: "Portfolio Projects" },
                    { value: "videos", label: "Videos" },
                    { value: "documents", label: "Documents" },
                    { value: "logos", label: "Logos & Icons" },
                    { value: "backgrounds", label: "Backgrounds" },
                    { value: "other", label: "Other" },
                  ]}
                />
                <MediaSelect
                  value={sizeFilter}
                  onChange={(v) => setSizeFilter(v as MediaSizeFilter)}
                  options={[
                    { value: "all", label: "All Sizes" },
                    { value: "small", label: "Under 500 KB" },
                    { value: "medium", label: "500 KB – 5 MB" },
                    { value: "large", label: "Over 5 MB" },
                  ]}
                />
                <MediaSelect
                  value={sortBy}
                  onChange={(v) => setSortBy(v as MediaSort)}
                  options={[
                    { value: "newest", label: "Date Modified" },
                    { value: "oldest", label: "Oldest First" },
                    { value: "name", label: "Name" },
                    { value: "size", label: "Size" },
                  ]}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="admin-media-view-toggle">
                  <button
                    type="button"
                    title="Grid view"
                    onClick={() => setViewMode("grid")}
                    className={cn("admin-media-view-btn", viewMode === "grid" && "admin-media-view-btn-active")}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    title="List view"
                    onClick={() => setViewMode("list")}
                    className={cn("admin-media-view-btn", viewMode === "list" && "admin-media-view-btn-active")}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.008 5.25h.007v.008H3.758V12zm.008 5.25h.007v.008H3.766v-.008z" />
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  className={cn(
                    "admin-btn-ghost inline-flex items-center gap-1.5 px-3 py-2 text-xs",
                    bulkMode && "border-[var(--admin-gold)]/40 text-[var(--admin-gold-light)]",
                  )}
                  onClick={() => {
                    setBulkMode((v) => !v);
                    setSelected(new Set());
                  }}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  Bulk Select
                </button>
                {bulkMode && selected.size > 0 && (
                  <button type="button" className="admin-btn-ghost px-3 py-2 text-xs text-red-300" onClick={bulkDelete}>
                    Delete ({selected.size})
                  </button>
                )}
                <span className="text-xs text-[var(--admin-text-muted)]">
                  {filtered.length} {filtered.length === 1 ? "file" : "files"}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="admin-luxury-card h-48 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <AdminEmptyState
                title={files.length === 0 ? "No media uploaded yet" : "No files match your filters"}
                description={
                  files.length === 0
                    ? "Upload images, videos, and documents to use across your site and CMS."
                    : "Try a different folder, type tab, or search term."
                }
                actionLabel="+ Upload Files"
                onAction={() => uploadRef.current?.click()}
              />
            ) : viewMode === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {paginated.map((file) => (
                  <MediaFileCard
                    key={file.name}
                    file={file}
                    bulkMode={bulkMode}
                    selected={selected.has(file.name)}
                    onToggleSelect={() => toggleSelect(file.name)}
                    onCopyUrl={() => copyUrl(file.url)}
                    onDelete={() => deleteFile(file.name)}
                    deleting={deleting === file.name}
                    copied={copied === file.url}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {paginated.map((file) => (
                  <MediaFileListRow
                    key={file.name}
                    file={file}
                    bulkMode={bulkMode}
                    selected={selected.has(file.name)}
                    onToggleSelect={() => toggleSelect(file.name)}
                    onCopyUrl={() => copyUrl(file.url)}
                    onDelete={() => deleteFile(file.name)}
                    deleting={deleting === file.name}
                    copied={copied === file.url}
                  />
                ))}
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <MediaPagination
                page={page}
                perPage={perPage}
                total={filtered.length}
                onPageChange={setPage}
                onPerPageChange={setPerPage}
              />
            )}
          </div>

          <MediaSidebar
            files={files}
            activeFolder={activeFolder}
            onFolderChange={handleFolderChange}
            uploading={uploading}
            onUploadClick={() => uploadRef.current?.click()}
            onDropFiles={uploadFiles}
          />
        </div>

        <input
          ref={uploadRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={handleUploadInput}
          disabled={uploading}
        />
      </AdminPageContent>
    </div>
  );
}
