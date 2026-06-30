"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { Button } from "@/components/ui/Button";
import { PortalPageContent } from "@/components/portal/PortalPageContent";
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { PortalCard } from "@/components/portal/PortalCard";
import { cn } from "@/lib/utils";

type ProjectFile = {
  id: string;
  name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  project_id: string;
  created_at: string;
};

type Project = { id: string; title: string };

type UploadState = {
  filename: string;
  progress: number;
} | null;

function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileTypeIcon({ mime }: { mime: string | null }) {
  const className = "h-8 w-8 shrink-0 text-[var(--admin-gold-light)]";

  if (mime?.startsWith("image/")) {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
      </svg>
    );
  }

  if (mime?.includes("pdf")) {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    );
  }

  if (mime?.includes("zip") || mime?.includes("archive")) {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    );
  }

  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.051-.44h-4.757a1.5 1.5 0 00-1.051.44l-2.12 2.12A1.5 1.5 0 003.75 12.75v7.5A1.5 1.5 0 005.25 21h13.5a1.5 1.5 0 001.5-1.5v-7.5a1.5 1.5 0 00-.44-1.06z" />
    </svg>
  );
}

function uploadWithProgress(
  url: string,
  formData: FormData,
  onProgress: (percent: number) => void,
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.withCredentials = true;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      const response = new Response(xhr.responseText, {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: { "Content-Type": xhr.getResponseHeader("Content-Type") ?? "application/json" },
      });
      resolve(response);
    };

    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(formData);
  });
}

function PortalFilesInner() {
  const searchParams = useSearchParams();
  const initialProject = searchParams.get("project") ?? "";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectFilter, setProjectFilter] = useState(initialProject);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const query = projectFilter ? `?project_id=${projectFilter}` : "";
    const res = await fetch(`/api/portal/files${query}`, { credentials: "same-origin" });
    if (res.ok) {
      const data = await res.json();
      setFiles(data.files ?? []);
      setProjects(data.projects ?? []);
      if (!projectFilter && data.projects?.length === 1) {
        setProjectFilter(data.projects[0].id);
      }
    } else {
      const data = await res.json().catch(() => ({}));
      setLoadError(data.error ?? "Failed to load files");
    }
    setLoading(false);
  }, [projectFilter]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => f.name.toLowerCase().includes(q));
  }, [files, search]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !projectFilter) {
      setUploadError("Select a project before uploading.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    setUploadState({ filename: file.name, progress: 0 });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("project_id", projectFilter);

    try {
      const res = await uploadWithProgress("/api/portal/files", formData, (progress) => {
        setUploadState({ filename: file.name, progress });
      });

      if (res.ok) {
        setUploadSuccess(`"${file.name}" uploaded successfully.`);
        await fetchFiles();
      } else {
        const data = await res.json().catch(() => ({}));
        setUploadError(data.error ?? "Upload failed");
      }
    } catch {
      setUploadError("Upload failed");
    } finally {
      setUploading(false);
      setUploadState(null);
      e.target.value = "";
    }
  }

  async function handleDownload(filePath: string) {
    setDownloadError(null);
    const res = await fetch(`/api/portal/files?download=${encodeURIComponent(filePath)}`, {
      credentials: "same-origin",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setDownloadError(data.error ?? "Download failed");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filePath.split("/").pop() ?? "download";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PortalPageContent>
      <PortalPageHeader
        title="Project files"
        subtitle="Secure deliverables hub — upload assets, download proofs, and share project materials."
        breadcrumb={[
          { label: "Dashboard", href: "/portal" },
          { label: "Files" },
        ]}
      />

      <PortalCard padding="md" className="mb-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            {projects.length > 1 && (
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="admin-entity-select w-full sm:max-w-xs"
              >
                <option value="">All projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            )}
            <input
              type="search"
              placeholder="Search files…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input flex-1"
            />
          </div>

          <label
            className={cn(
              "inline-flex cursor-pointer items-center justify-center",
              (uploading || projects.length === 0) && "pointer-events-none opacity-50",
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading || projects.length === 0}
            />
            <span className="admin-btn-gold inline-flex h-10 items-center px-4 text-sm">
              {uploading ? "Uploading…" : "Upload file"}
            </span>
          </label>
        </div>

        {uploadState && (
          <div className="mt-4 rounded-[var(--admin-radius)] border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <p className="truncate text-[var(--admin-text)]">{uploadState.filename}</p>
              <span className="shrink-0 tabular-nums text-[var(--admin-text-muted)]">{uploadState.progress}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--admin-panel-hover)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--admin-emerald)] to-[var(--admin-gold)] transition-all duration-200"
                style={{ width: `${uploadState.progress}%` }}
              />
            </div>
          </div>
        )}

        {uploadSuccess && (
          <AdminAlert tone="success" className="mt-3">
            {uploadSuccess}
          </AdminAlert>
        )}

        {projects.length === 0 && (
          <AdminAlert tone="warning" className="mt-3">
            No projects yet — message the team to get a project workspace set up.
          </AdminAlert>
        )}
        {uploadError && (
          <AdminAlert tone="error" className="mt-3">
            {uploadError}
          </AdminAlert>
        )}
        {loadError && (
          <AdminAlert tone="error" className="mt-3">
            {loadError}{" "}
            <button type="button" className="underline" onClick={() => void fetchFiles()}>
              Try again
            </button>
          </AdminAlert>
        )}
        {downloadError && (
          <AdminAlert tone="error" className="mt-3">
            {downloadError}
          </AdminAlert>
        )}
      </PortalCard>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="admin-luxury-card h-32 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <PortalCard padding="lg" className="text-center">
          <p className="text-[var(--admin-text-muted)]">No files found.</p>
          <p className="mt-2 text-sm text-[var(--admin-text-muted)]">
            Upload brand assets, content, or reference materials for your project.
          </p>
        </PortalCard>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((file) => (
            <PortalCard key={file.id} padding="md" hover>
              <div className="flex items-start gap-3">
                <FileTypeIcon mime={file.mime_type} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[var(--admin-text)]">{file.name}</p>
                  <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
                    {formatBytes(file.file_size)} · {new Date(file.created_at).toLocaleDateString()}
                  </p>
                  <Button
                    size="sm"
                    className="admin-btn-ghost mt-3 px-3 py-1.5 text-xs"
                    onClick={() => handleDownload(file.file_path)}
                  >
                    Download
                  </Button>
                </div>
              </div>
            </PortalCard>
          ))}
        </div>
      )}
    </PortalPageContent>
  );
}

export default function PortalFilesPage() {
  return (
    <Suspense
      fallback={
        <PortalPageContent>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="admin-luxury-card h-32 animate-pulse" />
            ))}
          </div>
        </PortalPageContent>
      }
    >
      <PortalFilesInner />
    </Suspense>
  );
}
