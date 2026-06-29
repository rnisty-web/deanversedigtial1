import { projectStatuses } from "@/lib/constants";

export type ProjectClient = {
  name: string;
  email: string;
  company?: string | null;
};

export type ProjectRecord = {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: string;
  budget: number | null;
  deadline: string | null;
  created_at: string;
  clients?: ProjectClient | null;
};

export type ProjectStats = {
  total: number;
  inProgress: number;
  completed: number;
  onHold: number;
  overdue: number;
};

export const PROJECT_CATEGORIES = [
  "Web Design",
  "Web Development",
  "Branding",
  "E-Commerce",
  "SEO & Marketing",
  "Other",
] as const;

const CATEGORY_KEYWORDS: [string, string][] = [
  ["ecommerce", "E-Commerce"],
  ["e-commerce", "E-Commerce"],
  ["shop", "E-Commerce"],
  ["brand", "Branding"],
  ["logo", "Branding"],
  ["seo", "SEO & Marketing"],
  ["marketing", "SEO & Marketing"],
  ["develop", "Web Development"],
  ["app", "Web Development"],
  ["web design", "Web Design"],
  ["website", "Web Design"],
  ["landing", "Web Design"],
];

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; border: string; label: string; bar: string }
> = {
  draft: {
    bg: "bg-white/5",
    text: "text-[var(--admin-text-muted)]",
    border: "border-[var(--admin-border-subtle)]",
    label: "Draft",
    bar: "bg-white/30",
  },
  planning: {
    bg: "bg-blue-500/10",
    text: "text-blue-300",
    border: "border-blue-500/25",
    label: "Planning",
    bar: "bg-blue-400",
  },
  in_progress: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    border: "border-emerald-500/30",
    label: "In Progress",
    bar: "bg-emerald-400",
  },
  review: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-300",
    border: "border-cyan-500/25",
    label: "In Review",
    bar: "bg-cyan-400",
  },
  completed: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-200",
    border: "border-emerald-500/40",
    label: "Completed",
    bar: "bg-emerald-300",
  },
  on_hold: {
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    border: "border-amber-500/30",
    label: "On Hold",
    bar: "bg-amber-400",
  },
  cancelled: {
    bg: "bg-red-500/10",
    text: "text-red-300",
    border: "border-red-500/25",
    label: "Cancelled",
    bar: "bg-red-400",
  },
};

const PROGRESS_BY_STATUS: Record<string, number> = {
  draft: 10,
  planning: 25,
  in_progress: 75,
  review: 90,
  completed: 100,
  on_hold: 50,
  cancelled: 0,
};

export function statusStyle(status: string) {
  return (
    STATUS_STYLES[status] ?? {
      bg: "bg-white/5",
      text: "text-[var(--admin-text-muted)]",
      border: "border-[var(--admin-border-subtle)]",
      label: status.replace(/_/g, " "),
      bar: "bg-white/30",
    }
  );
}

export function progressForStatus(status: string) {
  return PROGRESS_BY_STATUS[status] ?? 0;
}

export function inferCategory(title: string, description: string | null) {
  const haystack = `${title} ${description ?? ""}`.toLowerCase();
  for (const [keyword, label] of CATEGORY_KEYWORDS) {
    if (haystack.includes(keyword)) return label;
  }
  return "Web Design";
}

export function isOverdue(project: ProjectRecord) {
  if (!project.deadline) return false;
  if (project.status === "completed" || project.status === "cancelled") return false;
  const deadline = new Date(`${project.deadline}T23:59:59`);
  return deadline.getTime() < Date.now();
}

export function isInProgressStatus(status: string) {
  return status === "in_progress" || status === "planning" || status === "review";
}

export function computeProjectStats(projects: ProjectRecord[]): ProjectStats {
  return {
    total: projects.length,
    inProgress: projects.filter((p) => isInProgressStatus(p.status)).length,
    completed: projects.filter((p) => p.status === "completed").length,
    onHold: projects.filter((p) => p.status === "on_hold").length,
    overdue: projects.filter((p) => isOverdue(p)).length,
  };
}

export function formatCurrency(amount: number | null) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function formatCurrencyDetailed(amount: number | null) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function formatDeadline(deadline: string | null) {
  if (!deadline) return "—";
  return new Date(`${deadline}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function deadlineCountdown(deadline: string | null, status: string) {
  if (!deadline) return null;
  if (status === "completed" || status === "cancelled") return null;

  const end = new Date(`${deadline}T23:59:59`);
  const now = new Date();
  const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: `${Math.abs(diffDays)} days overdue`, tone: "danger" as const };
  if (diffDays === 0) return { label: "Due today", tone: "warning" as const };
  if (diffDays === 1) return { label: "1 day left", tone: "warning" as const };
  if (diffDays <= 7) return { label: `${diffDays} days left`, tone: "warning" as const };
  return { label: `${diffDays} days left`, tone: "neutral" as const };
}

export function clientDisplayName(project: ProjectRecord) {
  return project.clients?.company?.trim() || project.clients?.name || "Unknown client";
}

export function contactName(project: ProjectRecord) {
  if (project.clients?.company && project.clients.name) return project.clients.name;
  return project.clients?.email ?? "";
}

export function initials(text: string) {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export function pct(part: number, total: number) {
  if (total === 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

export function monthGrowthHint(projects: ProjectRecord[], match?: (p: ProjectRecord) => boolean) {
  const now = new Date();
  const thisMonth = projects.filter((p) => {
    const d = new Date(p.created_at);
    if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
    return match ? match(p) : true;
  }).length;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = projects.filter((p) => {
    const d = new Date(p.created_at);
    if (d.getMonth() !== lastMonthDate.getMonth() || d.getFullYear() !== lastMonthDate.getFullYear()) {
      return false;
    }
    return match ? match(p) : true;
  }).length;
  if (lastMonth === 0) return thisMonth > 0 ? `+${thisMonth} this month` : "No change this month";
  const growth = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
  return `${growth >= 0 ? "+" : ""}${growth}% this month`;
}

export function isThisMonth(createdAt: string) {
  const d = new Date(createdAt);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function projectTags(project: ProjectRecord) {
  const tags: string[] = [];
  if ((project.budget ?? 0) >= 10000) tags.push("High Budget");
  if (project.description?.toLowerCase().includes("priority")) tags.push("Priority");
  if (isOverdue(project)) tags.push("Overdue");
  return tags;
}

export function exportProjectsCsv(projects: ProjectRecord[]) {
  const headers = ["Project", "Client", "Status", "Progress", "Deadline", "Budget", "Category"];
  const rows = projects.map((p) =>
    [
      p.title,
      clientDisplayName(p),
      statusStyle(p.status).label,
      `${progressForStatus(p.status)}%`,
      p.deadline ?? "",
      p.budget ?? "",
      inferCategory(p.title, p.description),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `projects-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export { projectStatuses };
