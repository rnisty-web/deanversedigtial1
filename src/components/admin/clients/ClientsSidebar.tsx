"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
import { StatsChart } from "@/components/admin/StatsChart";
import type { ClientRecord } from "@/lib/clients/utils";
import { isThisMonth, pct } from "@/lib/clients/utils";
import { cn } from "@/lib/utils";

type ClientsSidebarProps = {
  clients: ClientRecord[];
  onAddClient: () => void;
  onImport: (rows: { name: string; email: string; phone?: string; company?: string }[]) => void;
  onImportError: (message: string) => void;
  onSendEmail: () => void;
  onCreateInvoice: () => void;
};

const OVERVIEW_COLORS = ["#6f8f72", "#c9a962", "#ef4444"];

const INDUSTRY_ORDER = ["E-Commerce", "Technology", "Healthcare", "Real Estate", "Fitness", "Other"];

export function ClientsSidebar({
  clients,
  onAddClient,
  onImport,
  onImportError,
  onSendEmail,
  onCreateInvoice,
}: ClientsSidebarProps) {
  const importRef = useRef<HTMLInputElement>(null);

  const overview = useMemo(() => {
    const labels = ["Active", "On Hold", "Inactive"];
    const keys = ["active", "inactive", "archived"];
    const data = keys.map((k) => clients.filter((c) => c.status === k).length);
    return { labels, data, total: clients.length };
  }, [clients]);

  const byIndustry = useMemo(() => {
    const map = new Map<string, number>();
    clients.filter((c) => isThisMonth(c.created_at)).forEach((c) => {
      map.set(c.industry, (map.get(c.industry) ?? 0) + 1);
    });
    const sorted = INDUSTRY_ORDER.map((label) => [label, map.get(label) ?? 0] as const)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
    const max = Math.max(1, ...sorted.map(([, v]) => v));
    return { items: sorted, max };
  }, [clients]);

  const activity = useMemo(() => {
    return [...clients]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((client) => ({
        id: client.id,
        text:
          client.status === "archived"
            ? `${clientDisplay(client)} marked inactive`
            : client.project_count > 0
              ? `Project activity for ${clientDisplay(client)}`
              : `New client ${clientDisplay(client)} added`,
        date: client.created_at,
        tone: client.status === "active" ? "green" : client.status === "inactive" ? "amber" : "red",
      }));
  }, [clients]);

  function clientDisplay(c: ClientRecord) {
    return c.company?.trim() || c.name;
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) {
        onImportError("CSV must include a header row and at least one data row.");
        return;
      }
      const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());
      const nameIdx = headers.findIndex((h) => h === "name");
      const emailIdx = headers.findIndex((h) => h === "email");
      if (nameIdx < 0 || emailIdx < 0) {
        onImportError("CSV must include Name and Email columns.");
        return;
      }
      const phoneIdx = headers.findIndex((h) => h === "phone");
      const companyIdx = headers.findIndex((h) => h === "company");
      const rows = lines.slice(1).map((line) => {
        const cols = line.match(/("([^"]|"")*"|[^,]+)/g)?.map((c) => c.replace(/^"|"$/g, "").replace(/""/g, '"').trim()) ?? [];
        return {
          name: cols[nameIdx] ?? "",
          email: cols[emailIdx] ?? "",
          phone: phoneIdx >= 0 ? cols[phoneIdx] : undefined,
          company: companyIdx >= 0 ? cols[companyIdx] : undefined,
        };
      }).filter((r) => r.name && r.email);
      if (!rows.length) {
        onImportError("No valid rows found. Each row needs a name and email.");
        return;
      }
      onImport(rows);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <aside className="admin-clients-sidebar">
      <div className="admin-clients-sidebar-panel">
        <section className="admin-clients-sidebar-section">
          <h3 className="admin-clients-sidebar-title">Client Overview</h3>
          <div className="admin-clients-overview-chart">
            <StatsChart
              type="doughnut"
              labels={overview.labels}
              datasets={[{ label: "Clients", data: overview.data, backgroundColor: OVERVIEW_COLORS }]}
              height={180}
              emptyMessage="No clients yet."
              variant="luxury"
              hideLegend
            />
            <p className="admin-clients-overview-total">
              <span className="text-2xl font-bold text-[var(--admin-text)]">{overview.total}</span>
              <span className="block text-xs text-[var(--admin-text-muted)]">Total Clients</span>
            </p>
          </div>
          <ul className="admin-clients-overview-legend">
            {overview.labels.map((label, i) => (
              <li key={label}>
                <span className="admin-clients-legend-dot" style={{ background: OVERVIEW_COLORS[i] }} />
                <span className="text-[var(--admin-text-muted)]">{label}</span>
                <span className="ml-auto tabular-nums text-[var(--admin-text)]">
                  {overview.data[i]} <span className="text-[var(--admin-text-muted)]">({pct(overview.data[i], overview.total)})</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="admin-clients-sidebar-divider" />

        <section className="admin-clients-sidebar-section">
          <div className="admin-clients-sidebar-heading">
            <h3>Clients by Industry</h3>
            <span className="text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)]">This Month</span>
          </div>
          {byIndustry.items.length === 0 ? (
            <p className="text-xs text-[var(--admin-text-muted)]">No new clients this month.</p>
          ) : (
            <ul className="admin-clients-industry-list">
              {byIndustry.items.map(([label, count]) => (
                <li key={label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-[var(--admin-text-muted)]">{label}</span>
                    <span className="tabular-nums text-[var(--admin-text)]">{count}</span>
                  </div>
                  <div className="admin-clients-industry-bar">
                    <div className="admin-clients-industry-fill" style={{ width: `${(count / byIndustry.max) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="admin-clients-sidebar-divider" />

        <section className="admin-clients-sidebar-section">
          <h3 className="admin-clients-sidebar-title mb-3">Recent Client Activity</h3>
          {activity.length === 0 ? (
            <p className="text-xs text-[var(--admin-text-muted)]">No activity yet.</p>
          ) : (
            <ul className="admin-clients-activity-list">
              {activity.map((item) => (
                <li key={item.id} className="admin-clients-activity-item">
                  <span className={cn("admin-clients-activity-icon", `admin-clients-activity-icon-${item.tone}`)}>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-[var(--admin-text)]">{item.text}</p>
                    <p className="text-[10px] text-[var(--admin-text-muted)]">
                      {new Date(item.date).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="admin-clients-sidebar-divider" />

        <section className="admin-clients-sidebar-section">
          <h3 className="admin-clients-sidebar-title mb-3">Quick Actions</h3>
          <div className="admin-clients-quick-actions">
            <button type="button" onClick={onAddClient} className="admin-clients-quick-btn">+ Add Client</button>
            <button type="button" onClick={() => importRef.current?.click()} className="admin-clients-quick-btn">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Import Clients
            </button>
            <button type="button" onClick={onSendEmail} className="admin-clients-quick-btn">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.34 0l-7.5-4.615a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Send Email
            </button>
            <Link href="/admin/invoices" onClick={onCreateInvoice} className="admin-clients-quick-btn">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              Create Invoice
            </Link>
          </div>
          <input ref={importRef} type="file" accept=".csv" className="hidden" onChange={handleImportFile} />
        </section>
      </div>
    </aside>
  );
}
