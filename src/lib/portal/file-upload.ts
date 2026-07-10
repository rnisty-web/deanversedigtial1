export const PORTAL_MAX_FILE_BYTES = 50 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "avif",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "csv",
  "zip",
  "mp4",
  "webm",
  "mov",
]);

const BLOCKED_MIME_TYPES = new Set([
  "application/x-msdownload",
  "application/x-msdos-program",
  "application/x-executable",
  "application/vnd.microsoft.portable-executable",
  "image/svg+xml",
  "text/html",
  "application/javascript",
]);

export function sanitizePortalFileName(name: string): string {
  const base = name.trim().replace(/[/\\]/g, "_").replace(/\.\./g, "");
  const sanitized = base.replace(/[^\w.\-() ]+/g, "_").slice(0, 120);
  return sanitized || "upload";
}

export function safeContentDispositionFilename(name: string): string {
  const sanitized = sanitizePortalFileName(name).replace(/["\r\n]/g, "_");
  return `attachment; filename="${sanitized}"; filename*=UTF-8''${encodeURIComponent(sanitized)}`;
}

export function validatePortalUpload(file: File): string | null {
  if (file.size <= 0) {
    return "File is empty.";
  }

  if (file.size > PORTAL_MAX_FILE_BYTES) {
    return "File is too large. Maximum size is 50 MB.";
  }

  const mime = file.type.trim().toLowerCase();
  if (mime && BLOCKED_MIME_TYPES.has(mime)) {
    return "This file type is not allowed.";
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
    return "This file type is not allowed. Upload images, documents, or archives.";
  }

  return null;
}
