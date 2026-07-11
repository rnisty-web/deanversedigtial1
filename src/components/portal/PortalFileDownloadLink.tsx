"use client";

import { useState } from "react";

export function PortalFileDownloadLink({
  filePath,
  displayName,
  className,
}: {
  filePath: string;
  displayName: string;
  className?: string;
}) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch(`/api/portal/files?download=${encodeURIComponent(filePath)}`, {
        credentials: "same-origin",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Download failed");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = displayName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Download failed");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <span className="flex flex-col items-end gap-1">
      <button type="button" onClick={handleDownload} disabled={downloading} className={className}>
        {downloading ? "Downloading…" : "Download"}
      </button>
      {error ? <span className="text-[10px] text-[var(--admin-danger)]">{error}</span> : null}
    </span>
  );
}
