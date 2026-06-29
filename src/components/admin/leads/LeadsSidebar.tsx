"use client";

import { useMemo, useRef } from "react";
import { StatsChart } from "@/components/admin/StatsChart";
import type { LeadRecord } from "@/lib/leads/utils";
import { isThisMonth, pct, statusStyle } from "@/lib/leads/utils";

type LeadsSidebarProps = {
  leads: LeadRecord[];
  onAddLead: () => void;
  onImport: (rows: { name: string; email: string; phone?: string; company?: string; source?: string }[]) => void;
  onImportError: (message: string) => void;
  onAddNote: () => void;
  onSendEmail: () => void;
};

const PIPELINE_COLORS = ["#6f8f72", "#5b8fb9", "#c9a962", "#4ade80", "#ef4444"];

export function LeadsSidebar({ leads, onAddLead, onImport, onImportError, onAddNote, onSendEmail }: LeadsSidebarProps) {
  const importRef = useRef<HTMLInputElement>(null);

  const pipeline = useMemo(() => {
    const labels = ["New", "Contacted", "Qualified", "Won", "Lost"];
    const keys = ["new", "contacted", "qualified", "converted", "lost"];
    const data = keys.map((k) => leads.filter((l) => l.status === k).length);
    const total = leads.length;
    const hasData = total > 0 && data.some((n) => n > 0);
    return { labels, data, total, hasData };
  }, [leads]);

  const bySource = useMemo(() => {
    const map = new Map<string, number>();
    leads.filter((l) => isThisMonth(l.created_at)).forEach((l) => {
      const key = l.source?.trim() || "Unknown";
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    const sorted = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    return {
      labels: sorted.map(([k]) => k),
      data: sorted.map(([, v]) => v),
    };
  }, [leads]);

  const activity = useMemo(() => {
    return [...leads]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
      .map((lead) => {
        let text = `New lead ${lead.name} added`;
        if (lead.status === "converted") text = `${lead.name} marked as won`;
        else if (lead.status === "contacted") text = `${lead.name} was contacted`;
        else if (lead.status === "qualified" && lead.budget) text = `Proposal sent to ${lead.name}`;
        else if (lead.status === "qualified") text = `${lead.name} qualified`;
        else if (lead.status === "lost") text = `${lead.name} marked as lost`;
        return { id: lead.id, text, date: lead.created_at };
      });
  }, [leads]);

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
      const sourceIdx = headers.findIndex((h) => h === "source");
      const rows = lines.slice(1).map((line) => {
        const cols = line.match(/("([^"]|"")*"|[^,]+)/g)?.map((c) => c.replace(/^"|"$/g, "").replace(/""/g, '"').trim()) ?? [];
        return {
          name: cols[nameIdx] ?? "",
          email: cols[emailIdx] ?? "",
          phone: phoneIdx >= 0 ? cols[phoneIdx] : undefined,
          company: companyIdx >= 0 ? cols[companyIdx] : undefined,
          source: sourceIdx >= 0 ? cols[sourceIdx] : undefined,
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
    <aside className="admin-leads-sidebar">
      <div className="admin-leads-sidebar-panel">
        <section className="admin-leads-sidebar-section">
          <h3 className="admin-leads-sidebar-title">Lead Pipeline</h3>
          <div className="admin-leads-pipeline-chart">
            <StatsChart
              type="doughnut"
              labels={pipeline.labels}
              datasets={[{ label: "Leads", data: pipeline.data, backgroundColor: PIPELINE_COLORS }]}
              height={180}
              emptyMessage="No leads yet."
              variant="luxury"
              hideLegend
            />
            {pipeline.hasData ? (
              <p className="admin-leads-pipeline-total">
                <span className="text-2xl font-bold text-[var(--admin-text)]">{pipeline.total}</span>
                <span className="block text-xs text-[var(--admin-text-muted)]">Total Leads</span>
              </p>
            ) : null}
          </div>
          <ul className="admin-leads-pipeline-legend">
            {pipeline.labels.map((label, i) => (
              <li key={label}>
                <span className="admin-leads-legend-dot" style={{ background: PIPELINE_COLORS[i] }} />
                <span className="text-[var(--admin-text-muted)]">{label}</span>
                <span className="ml-auto tabular-nums text-[var(--admin-text)]">
                  {pipeline.data[i]} <span className="text-[var(--admin-text-muted)]">({pct(pipeline.data[i], pipeline.total)})</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="admin-leads-sidebar-divider" />

        <section className="admin-leads-sidebar-section">
          <div className="admin-leads-sidebar-heading">
            <h3>Leads by Source</h3>
            <span className="text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)]">This Month</span>
          </div>
          <StatsChart
            type="bar"
            labels={bySource.labels}
            datasets={[{ label: "Leads", data: bySource.data, backgroundColor: "rgba(201, 169, 98, 0.45)" }]}
            height={160}
            emptyMessage="No source data this month."
            variant="luxury"
            hideLegend
          />
        </section>

        <div className="admin-leads-sidebar-divider" />

        <section className="admin-leads-sidebar-section">
          <h3 className="admin-leads-sidebar-title mb-3">Recent Activity</h3>
          {activity.length === 0 ? (
            <p className="text-xs text-[var(--admin-text-muted)]">No activity yet.</p>
          ) : (
            <ul className="admin-leads-activity-list">
              {activity.map((item) => (
                <li key={item.id} className="admin-leads-activity-item">
                  <span className="admin-leads-activity-icon">
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

        <div className="admin-leads-sidebar-divider" />

        <section className="admin-leads-sidebar-section">
          <h3 className="admin-leads-sidebar-title mb-3">Quick Actions</h3>
          <div className="admin-leads-quick-actions">
            <button type="button" onClick={onAddLead} className="admin-leads-quick-btn">
              + Add Lead
            </button>
            <button type="button" onClick={() => importRef.current?.click()} className="admin-leads-quick-btn">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Import Leads
            </button>
            <button type="button" onClick={onAddNote} className="admin-leads-quick-btn">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Add Note
            </button>
            <button type="button" onClick={onSendEmail} className="admin-leads-quick-btn">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.34 0l-7.5-4.615a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Send Email
            </button>
          </div>
          <input ref={importRef} type="file" accept=".csv" className="hidden" onChange={handleImportFile} />
        </section>
      </div>
    </aside>
  );
}

export function LeadBadge({
  label,
  style,
}: {
  label: string;
  style: { bg: string; text: string; border: string };
}) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${style.bg} ${style.text} ${style.border}`}>
      {label}
    </span>
  );
}

export function LeadStatusBadge({ status }: { status: string }) {
  const style = statusStyle(status);
  return <LeadBadge label={style.label} style={style} />;
}
