const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "avif",
  "ico",
  "pdf",
  "mp4",
  "webm",
  "mov",
  "woff",
  "woff2",
  "ttf",
  "otf",
  "txt",
  "csv",
  "json",
]);

const BLOCKED_MIME_TYPES = new Set([
  "application/x-msdownload",
  "application/x-msdos-program",
  "application/x-executable",
  "application/vnd.microsoft.portable-executable",
]);

export function sanitizeMediaObjectName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed || trimmed.includes("/") || trimmed.includes("\\") || trimmed.includes("..")) {
    return null;
  }
  return trimmed;
}

export function validateAdminMediaUpload(file: File): string | null {
  if (file.size <= 0) {
    return "File is empty.";
  }

  if (file.size > 100 * 1024 * 1024) {
    return "File exceeds 100 MB limit.";
  }

  const mime = file.type.trim().toLowerCase();
  if (mime && BLOCKED_MIME_TYPES.has(mime)) {
    return "This file type is not allowed.";
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
    return "Unsupported file type. Upload images, PDFs, video, or web fonts.";
  }

  return null;
}
