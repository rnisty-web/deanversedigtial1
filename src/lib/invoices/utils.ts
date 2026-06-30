import type { InvoiceLineItem } from "@/types";
import { invoiceStatuses } from "@/lib/constants";

export type ClientRef = { id: string; name: string; email: string };
export type ProjectRef = { id: string; title: string; client_id: string };

export type InvoiceRecord = {
  id: string;
  client_id: string;
  project_id: string | null;
  invoice_number: string;
  amount: number;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  line_items: InvoiceLineItem[] | null;
  notes: string | null;
  created_at: string;
  clients?: ClientRef | ClientRef[] | null;
  projects?: { id: string; title: string } | { id: string; title: string }[] | null;
};

export type InvoiceStats = {
  totalCount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  draftAmount: number;
  monthGrowth: number;
};

export { invoiceStatuses };

export function joinClientName(clients: InvoiceRecord["clients"]) {
  if (!clients) return "—";
  const c = Array.isArray(clients) ? clients[0] : clients;
  return c?.name ?? "—";
}

export function joinClientEmail(clients: InvoiceRecord["clients"]) {
  if (!clients) return "";
  const c = Array.isArray(clients) ? clients[0] : clients;
  return c?.email ?? "";
}

export function joinProjectTitle(projects: InvoiceRecord["projects"]) {
  if (!projects) return "—";
  const p = Array.isArray(projects) ? projects[0] : projects;
  return p?.title ?? "—";
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCurrencyCompact(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function pct(part: number, total: number) {
  if (total <= 0) return "0%";
  return `${Math.round((part / total) * 1000) / 10}%`;
}

export function isThisMonth(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

export function monthRangeLocal() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export function allTimeRangeLocal() {
  const now = new Date();
  const from = new Date(2000, 0, 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export function isInDateRange(dateStr: string, from: string, to: string) {
  const day = dateStr.slice(0, 10);
  return day >= from && day <= to;
}

export function computeInvoiceStats(invoices: InvoiceRecord[]): InvoiceStats {
  const thisMonth = invoices.filter((inv) => isThisMonth(inv.created_at));
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonth = invoices.filter((inv) => {
    const d = new Date(inv.created_at);
    return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
  });

  const growth =
    lastMonth.length === 0
      ? thisMonth.length > 0
        ? 100
        : 0
      : Math.round(((thisMonth.length - lastMonth.length) / lastMonth.length) * 1000) / 10;

  let paidAmount = 0;
  let pendingAmount = 0;
  let overdueAmount = 0;
  let draftAmount = 0;

  invoices.forEach((inv) => {
    const amount = Number(inv.amount) || 0;
    if (inv.status === "paid") paidAmount += amount;
    else if (inv.status === "sent") pendingAmount += amount;
    else if (inv.status === "overdue") overdueAmount += amount;
    else if (inv.status === "draft") draftAmount += amount;
  });

  return {
    totalCount: invoices.length,
    paidAmount,
    pendingAmount,
    overdueAmount,
    draftAmount,
    monthGrowth: growth,
  };
}

export function statusStyle(status: string) {
  switch (status) {
    case "paid":
      return {
        label: "Paid",
        bg: "bg-emerald-500/10",
        text: "text-emerald-300",
        border: "border-emerald-400/30",
        dot: "#34d399",
      };
    case "sent":
      return {
        label: "Pending",
        bg: "bg-[var(--admin-gold-soft)]",
        text: "text-[var(--admin-gold-light)]",
        border: "border-[var(--admin-gold)]/35",
        dot: "#c9a962",
      };
    case "overdue":
      return {
        label: "Overdue",
        bg: "bg-red-500/10",
        text: "text-red-300",
        border: "border-red-400/30",
        dot: "#ef4444",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        bg: "bg-white/5",
        text: "text-[var(--admin-text-muted)]",
        border: "border-[var(--admin-border-subtle)]",
        dot: "#6b7280",
      };
    default:
      return {
        label: "Draft",
        bg: "bg-white/5",
        text: "text-[var(--admin-text-muted)]",
        border: "border-[var(--admin-border-subtle)]",
        dot: "#9ca3af",
      };
  }
}

export function tabForStatus(status: string) {
  if (status === "sent") return "pending";
  return status;
}

export function filterByTab(invoice: InvoiceRecord, tab: string) {
  if (tab === "all") return true;
  if (tab === "pending") return invoice.status === "sent";
  return invoice.status === tab;
}

export function buildActivityFeed(invoices: InvoiceRecord[]) {
  return [...invoices]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)
    .map((inv) => {
      let message = `Invoice ${inv.invoice_number} created`;
      if (inv.status === "paid" && inv.paid_at) {
        message = `Payment received — ${inv.invoice_number}`;
      } else if (inv.status === "paid") {
        message = `Invoice ${inv.invoice_number} marked as paid`;
      } else if (inv.status === "sent") {
        message = `Invoice ${inv.invoice_number} sent to ${joinClientName(inv.clients)}`;
      } else if (inv.status === "overdue") {
        message = `Invoice ${inv.invoice_number} is overdue`;
      }
      return {
        id: inv.id,
        message,
        timestamp: inv.paid_at ?? inv.created_at,
        tone: inv.status,
      };
    });
}

export function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

export function exportInvoicesCsv(invoices: InvoiceRecord[]) {
  const header = ["Invoice", "Client", "Email", "Project", "Amount", "Status", "Due Date", "Created"];
  const rows = invoices.map((inv) => [
    inv.invoice_number,
    joinClientName(inv.clients),
    joinClientEmail(inv.clients),
    joinProjectTitle(inv.projects),
    String(inv.amount),
    inv.status,
    inv.due_date ?? "",
    inv.created_at,
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function computeTotal(items: InvoiceLineItem[]) {
  return items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
}

export const emptyLineItem = (): InvoiceLineItem => ({
  description: "",
  quantity: 1,
  unit_price: 0,
  total: 0,
});

export const emptyInvoiceForm = {
  client_id: "",
  project_id: "",
  invoice_number: "",
  status: "draft",
  due_date: "",
  notes: "",
  line_items: [emptyLineItem()] as InvoiceLineItem[],
};
