"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AdminField } from "@/components/admin/AdminField";
import { AdminModal } from "@/components/admin/AdminModal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type MediaFile = {
  name: string;
  url: string;
  created_at: string;
};

type MediaPickerProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
};

export function MediaPicker({ label, value, onChange, hint }: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/media");
    if (!res.ok) {
      setError("Failed to load media");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setFiles(data.files ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) fetchFiles();
  }, [open, fetchFiles]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/media", { method: "POST", body: formData });
    setUploading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Upload failed");
      return;
    }

    const data = await res.json();
    onChange(data.url);
    fetchFiles();
    e.target.value = "";
  }

  function selectFile(url: string) {
    onChange(url);
    setOpen(false);
  }

  const isImage = value && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(value);

  return (
    <div>
      <AdminField label={label} value={value} onChange={onChange} hint={hint} placeholder="/images/..." />

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" className="admin-btn-ghost" onClick={() => setOpen(true)}>
          Browse Media
        </Button>
        <label className="cursor-pointer">
          <span className="admin-btn-gold inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm">
            {uploading ? "Uploading…" : "Upload New"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {isImage && (
        <div className="relative mt-3 h-24 w-24 overflow-hidden rounded-lg border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)]">
          <Image src={value} alt="Preview" fill className="object-cover" unoptimized />
        </div>
      )}

      <AdminModal
        open={open}
        onClose={() => setOpen(false)}
        title="Media Library"
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" className="admin-btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        }
      >
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="cursor-pointer">
            <span className="admin-btn-gold inline-flex items-center justify-center rounded-full px-4 py-2 text-sm">
              {uploading ? "Uploading…" : "Upload Image"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {loading ? (
          <p className="text-sm text-[var(--admin-text-muted)]">Loading media…</p>
        ) : files.length === 0 ? (
          <p className="text-sm text-[var(--admin-text-muted)]">No files uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {files.map((file) => (
              <button
                key={file.name}
                type="button"
                onClick={() => selectFile(file.url)}
                className={cn(
                  "group overflow-hidden rounded-lg border text-left transition-colors",
                  value === file.url
                    ? "border-[var(--admin-emerald)] ring-2 ring-[var(--admin-emerald)]/50"
                    : "border-[var(--admin-border-subtle)] hover:border-[var(--admin-gold)]/50",
                )}
              >
                <div className="relative aspect-square bg-[var(--admin-panel)]">
                  <Image
                    src={file.url}
                    alt={file.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <p className="truncate px-2 py-1.5 text-xs text-[var(--admin-text-muted)] group-hover:text-[var(--admin-text)]">
                  {file.name}
                </p>
              </button>
            ))}
          </div>
        )}
      </AdminModal>
    </div>
  );
}
