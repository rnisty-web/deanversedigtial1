import type { LeadStatus } from "@/types";

export type LeadRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  service_interest: string | null;
  budget: string | null;
  project_type: string | null;
  status: string;
  source: string | null;
  notes: string | null;
  created_at: string;
};

export const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
];

export const STAT_CARDS = [
  { id: "new", label: "New Leads", statuses: ["new"] as string[] },
  { id: "contacted", label: "Contacted", statuses: ["contacted"] },
  { id: "qualified", label: "Qualified", statuses: ["qualified"] },
  { id: "converted", label: "Won", statuses: ["converted"] },
  { id: "lost", label: "Lost", statuses: ["lost"], negative: true },
] as const;

export const SOURCE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  website: { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/25" },
  referral: { bg: "bg-violet-500/10", text: "text-violet-300", border: "border-violet-500/25" },
  "google ads": { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/25" },
  linkedin: { bg: "bg-sky-500/10", text: "text-sky-300", border: "border-sky-500/25" },
  facebook: { bg: "bg-blue-500/10", text: "text-blue-300", border: "border-blue-500/25" },
  "google organic": { bg: "bg-teal-500/10", text: "text-teal-300", border: "border-teal-500/25" },
};

export const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  new: { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/25", label: "New" },
  contacted: { bg: "bg-sky-500/10", text: "text-sky-300", border: "border-sky-500/25", label: "Contacted" },
  qualified: { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/25", label: "Qualified" },
  converted: { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/25", label: "Won" },
  lost: { bg: "bg-red-500/10", text: "text-red-300", border: "border-red-500/25", label: "Lost" },
};

const DEFAULT_SOURCE = { bg: "bg-white/5", text: "text-[var(--admin-text-muted)]", border: "border-[var(--admin-border-subtle)]" };

export function sourceStyle(source: string | null) {
  if (!source) return DEFAULT_SOURCE;
  return SOURCE_STYLES[source.toLowerCase()] ?? DEFAULT_SOURCE;
}

export function statusStyle(status: string) {
  return STATUS_STYLES[status] ?? {
    bg: "bg-white/5",
    text: "text-[var(--admin-text-muted)]",
    border: "border-[var(--admin-border-subtle)]",
    label: status,
  };
}

export function localDateInputValue(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function monthRangeLocal() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: localDateInputValue(from), to: localDateInputValue(to) };
}

export function allTimeRangeLocal() {
  return { from: "2020-01-01", to: localDateInputValue(new Date()) };
}

export function normalizeSource(source: string | null) {
  return source?.trim().toLowerCase() ?? "";
}

export function sourcesMatch(a: string | null, b: string) {
  if (b === "all") return true;
  return normalizeSource(a) === normalizeSource(b);
}

export function isInDateRange(createdAt: string, from: string, to: string) {
  if (!from && !to) return true;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return true;

  let start = from ? new Date(`${from}T00:00:00`) : null;
  let end = to ? new Date(`${to}T23:59:59.999`) : null;

  if (start && end && start > end) {
    [start, end] = [end, start];
  }

  if (start && created < start) return false;
  if (end && created > end) return false;
  return true;
}

export function isThisMonth(createdAt: string) {
  const d = new Date(createdAt);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return parts
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatLeadDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function pct(part: number, total: number) {
  if (total === 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

export function monthGrowthHint(leads: LeadRecord[], statuses?: readonly string[], match?: (l: LeadRecord) => boolean) {
  const now = new Date();
  const thisMonth = leads.filter((l) => {
    const d = new Date(l.created_at);
    if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
    if (match) return match(l);
    if (statuses) return statuses.includes(l.status);
    return true;
  }).length;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = leads.filter((l) => {
    const d = new Date(l.created_at);
    if (d.getMonth() !== lastMonthDate.getMonth() || d.getFullYear() !== lastMonthDate.getFullYear()) return false;
    if (match) return match(l);
    if (statuses) return statuses.includes(l.status);
    return true;
  }).length;
  if (lastMonth === 0) return thisMonth > 0 ? `+ ${thisMonth} this month` : "No change this month";
  const growth = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
  const sign = growth >= 0 ? "+" : "";
  return `${sign} ${growth}% this month`;
}

export function statCount(leads: LeadRecord[], card: (typeof STAT_CARDS)[number]) {
  const statuses = card.statuses as readonly string[];
  return leads.filter((l) => statuses.includes(l.status)).length;
}

export function serviceLabel(lead: LeadRecord) {
  const parts = [lead.project_type, lead.service_interest].filter(Boolean);
  return parts.length ? parts.join(" / ") : "—";
}

export function exportLeadsCsv(leads: LeadRecord[]) {
  const headers = ["Name", "Email", "Phone", "Company", "Source", "Service", "Status", "Budget", "Date"];
  const rows = leads.map((l) =>
    [
      l.name,
      l.email,
      l.phone ?? "",
      l.company ?? "",
      l.source ?? "",
      serviceLabel(l),
      l.status,
      l.budget ?? "",
      formatLeadDate(l.created_at),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
