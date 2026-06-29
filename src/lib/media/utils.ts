export type MediaFileType = "image" | "video" | "document" | "other";

export type MediaTab = "all" | MediaFileType;

export type MediaFolder =
  | "all"
  | "images"
  | "videos"
  | "documents"
  | "logos"
  | "backgrounds"
  | "portfolio"
  | "other";

export type MediaFile = {
  name: string;
  url: string;
  created_at: string;
  size: number;
};

export type MediaSort = "newest" | "oldest" | "name" | "size";

export type MediaSizeFilter = "all" | "small" | "medium" | "large";

export const STORAGE_LIMIT_BYTES = 50 * 1024 * 1024 * 1024;
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

export const MEDIA_TABS: { id: MediaTab; label: string }[] = [
  { id: "all", label: "All Media" },
  { id: "image", label: "Images" },
  { id: "video", label: "Videos" },
  { id: "document", label: "Documents" },
  { id: "other", label: "Other" },
];

export const MEDIA_FOLDERS: { id: MediaFolder; label: string }[] = [
  { id: "all", label: "All Files" },
  { id: "images", label: "Website Images" },
  { id: "portfolio", label: "Portfolio Projects" },
  { id: "videos", label: "Videos" },
  { id: "documents", label: "Documents" },
  { id: "logos", label: "Logos & Icons" },
  { id: "backgrounds", label: "Backgrounds" },
  { id: "other", label: "Other" },
];

export function getExtension(name: string) {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

export function getFileType(name: string): MediaFileType {
  const ext = getExtension(name);
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "avif", "bmp"].includes(ext)) {
    return "image";
  }
  if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) {
    return "video";
  }
  if (["pdf", "doc", "docx", "txt", "csv", "xls", "xlsx"].includes(ext)) {
    return "document";
  }
  return "other";
}

export function fileMatchesFolder(file: MediaFile, folder: MediaFolder) {
  if (folder === "all") return true;
  const type = getFileType(file.name);
  const name = file.name.toLowerCase();

  switch (folder) {
    case "images":
      return type === "image" && !/logo|icon|favicon|bg|background|hero|portfolio|project/.test(name);
    case "portfolio":
      return /portfolio|project|case|mockup/.test(name) || (type === "image" && /shot|preview/.test(name));
    case "videos":
      return type === "video";
    case "documents":
      return type === "document";
    case "logos":
      return /logo|icon|favicon|brand/.test(name);
    case "backgrounds":
      return /bg|background|hero|banner/.test(name);
    case "other":
      return type === "other";
    default:
      return true;
  }
}

export function formatBytes(bytes: number) {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatMediaDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function pct(part: number, total: number) {
  if (total === 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

export function monthGrowthHint(files: MediaFile[]) {
  const now = new Date();
  const thisMonth = files.filter((f) => {
    const d = new Date(f.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  if (thisMonth === 0) return "No uploads this month";
  return `+ ${thisMonth} this month`;
}

export function matchesSizeFilter(size: number, filter: MediaSizeFilter) {
  if (filter === "all") return true;
  if (filter === "small") return size < 500 * 1024;
  if (filter === "medium") return size >= 500 * 1024 && size < 5 * 1024 * 1024;
  return size >= 5 * 1024 * 1024;
}

export function folderCount(files: MediaFile[], folder: MediaFolder) {
  return files.filter((f) => fileMatchesFolder(f, folder)).length;
}

export type MediaStats = {
  total: number;
  images: number;
  videos: number;
  documents: number;
  other: number;
};

export type MediaTabCounts = Record<MediaTab, number>;

export function computeMediaStats(files: MediaFile[]): MediaStats {
  const total = files.length;
  const images = files.filter((f) => getFileType(f.name) === "image").length;
  const videos = files.filter((f) => getFileType(f.name) === "video").length;
  const documents = files.filter((f) => getFileType(f.name) === "document").length;
  const other = files.filter((f) => getFileType(f.name) === "other").length;
  return { total, images, videos, documents, other };
}

export function computeMediaTabCounts(files: MediaFile[]): MediaTabCounts {
  return {
    all: files.length,
    image: files.filter((f) => getFileType(f.name) === "image").length,
    video: files.filter((f) => getFileType(f.name) === "video").length,
    document: files.filter((f) => getFileType(f.name) === "document").length,
    other: files.filter((f) => getFileType(f.name) === "other").length,
  };
}

export function filterMediaFiles(
  files: MediaFile[],
  opts: {
    search: string;
    activeTab: MediaTab;
    activeFolder: MediaFolder;
    sizeFilter: MediaSizeFilter;
    sortBy: MediaSort;
  },
) {
  const q = opts.search.trim().toLowerCase();
  let list = files.filter((f) => fileMatchesFolder(f, opts.activeFolder));

  if (opts.activeTab !== "all") {
    list = list.filter((f) => getFileType(f.name) === opts.activeTab);
  }

  list = list.filter((f) => matchesSizeFilter(f.size, opts.sizeFilter));

  if (q) {
    list = list.filter((f) => f.name.toLowerCase().includes(q));
  }

  return [...list].sort((a, b) => {
    if (opts.sortBy === "name") return a.name.localeCompare(b.name);
    if (opts.sortBy === "size") return b.size - a.size;
    if (opts.sortBy === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
