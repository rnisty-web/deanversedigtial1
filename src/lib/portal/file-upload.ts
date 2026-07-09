export const PORTAL_MAX_FILE_BYTES = 50 * 1024 * 1024;

const BLOCKED_MIME_TYPES = new Set([
  "application/x-msdownload",
  "application/x-msdos-program",
  "application/x-executable",
  "application/vnd.microsoft.portable-executable",
]);

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

  return null;
}
