export type ClientRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  notes: string | null;
  status: string;
  profile_id: string | null;
  created_at: string;
  project_count: number;
  projects_in_progress: number;
  revenue: number;
  outstanding: number;
  industry: string;
  is_vip: boolean;
};

export type ClientStats = {
  totalClients: number;
  activeClients: number;
  projectsInProgress: number;
  outstandingInvoices: number;
  outstandingTotal: number;
  totalRevenue: number;
};

export const CLIENT_STATUSES = ["active", "inactive", "archived"] as const;

export const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  active: { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/25", label: "Active" },
  inactive: { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/25", label: "On Hold" },
  archived: { bg: "bg-red-500/10", text: "text-red-300", border: "border-red-500/25", label: "Inactive" },
};

const INDUSTRY_KEYWORDS: [string, string][] = [
  ["ecommerce", "E-Commerce"],
  ["e-commerce", "E-Commerce"],
  ["shop", "E-Commerce"],
  ["retail", "E-Commerce"],
  ["tech", "Technology"],
  ["software", "Technology"],
  ["digital", "Technology"],
  ["health", "Healthcare"],
  ["medical", "Healthcare"],
  ["clinic", "Healthcare"],
  ["real estate", "Real Estate"],
  ["realty", "Real Estate"],
  ["property", "Real Estate"],
  ["fitness", "Fitness"],
  ["gym", "Fitness"],
  ["wellness", "Fitness"],
];

export function statusStyle(status: string) {
  return STATUS_STYLES[status] ?? {
    bg: "bg-white/5",
    text: "text-[var(--admin-text-muted)]",
    border: "border-[var(--admin-border-subtle)]",
    label: status,
  };
}

export function clientDisplayName(client: ClientRecord) {
  return client.company?.trim() || client.name;
}

export function contactTitle(client: ClientRecord) {
  if (client.company && client.name) return client.name;
  return client.name;
}

export function contactSubtitle(client: ClientRecord) {
  if (client.company && client.name !== client.company) {
    const fromNotes = client.notes?.split("\n")[0]?.trim();
    if (fromNotes && fromNotes.length < 48) return fromNotes;
    return "Primary contact";
  }
  return client.email;
}

export function initials(text: string) {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

export function formatCurrencyDetailed(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function pct(part: number, total: number) {
  if (total === 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

export function inferIndustry(company: string | null, projectTitles: string[]) {
  const haystack = [company ?? "", ...projectTitles].join(" ").toLowerCase();
  for (const [keyword, label] of INDUSTRY_KEYWORDS) {
    if (haystack.includes(keyword)) return label;
  }
  return "Other";
}

export function isVipClient(revenue: number, notes: string | null) {
  if (notes?.toLowerCase().includes("vip")) return true;
  return revenue >= 25000;
}

export function localDateInputValue(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function allTimeRangeLocal() {
  return { from: "2020-01-01", to: localDateInputValue(new Date()) };
}

export function monthRangeLocal() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { from: localDateInputValue(from), to: localDateInputValue(to) };
}

export function isInDateRange(createdAt: string, from: string, to: string) {
  if (!from && !to) return true;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return true;
  let start = from ? new Date(`${from}T00:00:00`) : null;
  let end = to ? new Date(`${to}T23:59:59.999`) : null;
  if (start && end && start > end) [start, end] = [end, start];
  if (start && created < start) return false;
  if (end && created > end) return false;
  return true;
}

export function isThisMonth(createdAt: string) {
  const d = new Date(createdAt);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export function monthGrowthHint(clients: ClientRecord[], match?: (c: ClientRecord) => boolean) {
  const now = new Date();
  const thisMonth = clients.filter((c) => {
    const d = new Date(c.created_at);
    if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
    return match ? match(c) : true;
  }).length;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = clients.filter((c) => {
    const d = new Date(c.created_at);
    if (d.getMonth() !== lastMonthDate.getMonth() || d.getFullYear() !== lastMonthDate.getFullYear()) return false;
    return match ? match(c) : true;
  }).length;
  if (lastMonth === 0) return thisMonth > 0 ? `+${thisMonth} this month` : "No change this month";
  const growth = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
  return `${growth >= 0 ? "+" : ""}${growth}% this month`;
}

export function exportClientsCsv(clients: ClientRecord[]) {
  const headers = ["Company", "Contact", "Email", "Phone", "Projects", "Revenue", "Status", "Industry"];
  const rows = clients.map((c) =>
    [
      clientDisplayName(c),
      c.name,
      c.email,
      c.phone ?? "",
      c.project_count,
      c.revenue,
      statusStyle(c.status).label,
      c.industry,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `clients-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
