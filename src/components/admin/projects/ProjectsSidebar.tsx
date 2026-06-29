"use client";

import Link from "next/link";
import { useMemo } from "react";
import { StatsChart } from "@/components/admin/StatsChart";
import type { ProjectRecord } from "@/lib/projects/utils";
import {
  deadlineCountdown,
  formatDeadline,
  inferCategory,
  isInProgressStatus,
  isOverdue,
  isThisMonth,
  pct,
} from "@/lib/projects/utils";

type ProjectsSidebarProps = {
  projects: ProjectRecord[];
  onNewProject: () => void;
  onExport: () => void;
};

const OVERVIEW_COLORS = ["#34d399", "#22c55e", "#fbbf24", "#ef4444"];
const OVERVIEW_KEYS = ["in_progress", "completed", "on_hold", "overdue"] as const;
const CATEGORY_ORDER = ["Web Design", "Web Development", "Branding", "E-Commerce", "SEO & Marketing", "Other"];

export function ProjectsSidebar({ projects, onNewProject, onExport }: ProjectsSidebarProps) {
  const overview = useMemo(() => {
    const labels = ["In Progress", "Completed", "On Hold", "Overdue"];
    const data = [
      projects.filter((p) => isInProgressStatus(p.status)).length,
      projects.filter((p) => p.status === "completed").length,
      projects.filter((p) => p.status === "on_hold").length,
      projects.filter((p) => isOverdue(p)).length,
    ];
    return { labels, data, total: projects.length };
  }, [projects]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    projects
      .filter((p) => isThisMonth(p.created_at))
      .forEach((p) => {
        const cat = inferCategory(p.title, p.description);
        map.set(cat, (map.get(cat) ?? 0) + 1);
      });
    const sorted = CATEGORY_ORDER.map((label) => [label, map.get(label) ?? 0] as const).filter(([, count]) => count > 0);
    const max = Math.max(1, ...sorted.map(([, v]) => v));
    return { items: sorted, max };
  }, [projects]);

  const upcoming = useMemo(() => {
    return [...projects]
      .filter((p) => p.deadline && p.status !== "completed" && p.status !== "cancelled")
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
      .slice(0, 4)
      .map((project) => ({
        id: project.id,
        title: project.title,
        date: project.deadline!,
        countdown: deadlineCountdown(project.deadline, project.status),
        tone: isOverdue(project) ? "red" : project.status === "on_hold" ? "amber" : "green",
      }));
  }, [projects]);

  return (
    <aside className="admin-projects-sidebar">
      <div className="admin-projects-sidebar-panel">
        <section className="admin-projects-sidebar-section">
          <h3 className="admin-projects-sidebar-title">Project Overview</h3>
          <div className="admin-projects-overview-chart">
            <StatsChart
              type="doughnut"
              labels={overview.labels}
              datasets={[{ label: "Projects", data: overview.data, backgroundColor: OVERVIEW_COLORS }]}
              height={180}
              emptyMessage="No projects yet."
              variant="luxury"
              hideLegend
            />
            <p className="admin-projects-overview-total">
              <span className="text-2xl font-bold text-[var(--admin-text)]">{overview.total}</span>
              <span className="block text-xs text-[var(--admin-text-muted)]">Total Projects</span>
            </p>
          </div>
          <ul className="admin-projects-overview-legend">
            {overview.labels.map((label, i) => (
              <li key={OVERVIEW_KEYS[i]}>
                <span className="admin-projects-legend-dot" style={{ background: OVERVIEW_COLORS[i] }} />
                <span className="text-[var(--admin-text-muted)]">{label}</span>
                <span className="ml-auto tabular-nums text-[var(--admin-text)]">
                  {overview.data[i]} <span className="text-[var(--admin-text-muted)]">({pct(overview.data[i], overview.total)})</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="admin-projects-sidebar-divider" />

        <section className="admin-projects-sidebar-section">
          <div className="admin-projects-sidebar-heading">
            <h3>Projects by Category</h3>
            <span className="text-[10px] uppercase tracking-wider text-[var(--admin-text-muted)]">This Month</span>
          </div>
          {byCategory.items.length === 0 ? (
            <p className="text-xs text-[var(--admin-text-muted)]">No new projects this month.</p>
          ) : (
            <ul className="admin-projects-industry-list">
              {byCategory.items.map(([label, count]) => (
                <li key={label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-[var(--admin-text-muted)]">{label}</span>
                    <span className="tabular-nums text-[var(--admin-text)]">{count}</span>
                  </div>
                  <div className="admin-projects-industry-bar">
                    <div className="admin-projects-industry-fill" style={{ width: `${(count / byCategory.max) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="admin-projects-sidebar-divider" />

        <section className="admin-projects-sidebar-section">
          <h3 className="admin-projects-sidebar-title mb-3">Upcoming Deadlines</h3>
          {upcoming.length === 0 ? (
            <p className="text-xs text-[var(--admin-text-muted)]">No upcoming deadlines.</p>
          ) : (
            <ul className="admin-projects-deadline-list">
              {upcoming.map((item) => (
                <li key={item.id} className="admin-projects-deadline-item">
                  <span className={`admin-projects-deadline-dot admin-projects-deadline-dot-${item.tone}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-[var(--admin-text)]">{item.title}</p>
                    <p className="text-[10px] text-[var(--admin-text-muted)]">
                      {formatDeadline(item.date)}
                      {item.countdown ? ` · ${item.countdown.label}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="admin-projects-sidebar-divider" />

        <section className="admin-projects-sidebar-section">
          <h3 className="admin-projects-sidebar-title mb-3">Quick Actions</h3>
          <div className="admin-projects-quick-actions">
            <button type="button" onClick={onNewProject} className="admin-projects-quick-btn">+ New Project</button>
            <Link href="/admin/portfolio" className="admin-projects-quick-btn">Project Templates</Link>
            <button type="button" onClick={onExport} className="admin-projects-quick-btn">Import Project</button>
            <button type="button" onClick={onExport} className="admin-projects-quick-btn">Project Report</button>
          </div>
        </section>
      </div>
    </aside>
  );
}
