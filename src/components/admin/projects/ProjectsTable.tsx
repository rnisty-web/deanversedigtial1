"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import type { ProjectRecord } from "@/lib/projects/utils";
import {
  clientDisplayName,
  contactName,
  deadlineCountdown,
  formatCurrencyDetailed,
  formatDeadline,
  inferCategory,
  initials,
  isInProgressStatus,
  isOverdue,
  progressForStatus,
  projectStatuses,
  statusStyle,
} from "@/lib/projects/utils";
import { cn } from "@/lib/utils";

export function ProjectStatusBadge({ status }: { status: string }) {
  const style = statusStyle(status);
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${style.bg} ${style.text} ${style.border}`}>
      {style.label}
    </span>
  );
}

function ProjectThumb() {
  return (
    <div className="admin-projects-thumb" aria-hidden>
      <svg className="h-4 w-4 text-[var(--admin-gold-light)]/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
      </svg>
    </div>
  );
}

function ProjectProgress({ status }: { status: string }) {
  const value = progressForStatus(status);
  const style = statusStyle(status);
  return (
    <div className="min-w-[88px]">
      <p className="mb-1 text-xs font-medium tabular-nums text-[var(--admin-text)]">{value}%</p>
      <div className="admin-projects-progress-track">
        <div className={cn("admin-projects-progress-fill", style.bar)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function TeamAvatars({ project }: { project: ProjectRecord }) {
  return (
    <div className="admin-projects-team">
      <span className="admin-projects-team-avatar">{initials(clientDisplayName(project)).slice(0, 1)}</span>
      <span className="admin-projects-team-avatar admin-projects-team-avatar-alt">AD</span>
    </div>
  );
}

type MenuState = { project: ProjectRecord; top: number; left: number };

const MENU_WIDTH = 192;
const MENU_ESTIMATED_HEIGHT = 280;

function getMenuPosition(button: HTMLElement) {
  const rect = button.getBoundingClientRect();
  const left = Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8));
  let top = rect.bottom + 6;
  if (top + MENU_ESTIMATED_HEIGHT > window.innerHeight - 8) {
    top = Math.max(8, rect.top - MENU_ESTIMATED_HEIGHT - 6);
  }
  return { top, left };
}

type ProjectsTableProps = {
  projects: ProjectRecord[];
  loading: boolean;
  listDisplay: "table" | "grid";
  onView: (project: ProjectRecord) => void;
  onEdit: (project: ProjectRecord) => void;
  onDelete: (id: string) => void;
  onStatusChange: (project: ProjectRecord, status: string) => void;
};

export function ProjectsTable({
  projects,
  loading,
  listDisplay,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: ProjectsTableProps) {
  const [menuState, setMenuState] = useState<MenuState | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuState) return;
    function close(e: MouseEvent) {
      if (menuRef.current?.contains(e.target as Node)) return;
      setMenuState(null);
    }
    function closeOnEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuState(null);
    }
    function closeOnScroll() {
      setMenuState(null);
    }
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("scroll", closeOnScroll, true);
    window.addEventListener("resize", closeOnScroll);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("scroll", closeOnScroll, true);
      window.removeEventListener("resize", closeOnScroll);
    };
  }, [menuState]);

  const menuPortal =
    menuState &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        ref={menuRef}
        className="admin-projects-menu admin-projects-menu-floating"
        role="menu"
        style={{ top: menuState.top, left: menuState.left, width: MENU_WIDTH }}
      >
        <button type="button" onClick={() => { onView(menuState.project); setMenuState(null); }}>View details</button>
        <button type="button" onClick={() => { onEdit(menuState.project); setMenuState(null); }}>Edit project</button>
        <Link href={`/portal/projects/${menuState.project.id}`} className="admin-projects-menu-link">Portal view</Link>
        <Link href={`/admin/invoices?client=${menuState.project.client_id}`} className="admin-projects-menu-link">View invoices</Link>
        {projectStatuses.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { onStatusChange(menuState.project, s); setMenuState(null); }}
            className={cn(menuState.project.status === s && "text-[var(--admin-gold-light)]")}
          >
            Mark as {statusStyle(s).label}
          </button>
        ))}
        <button type="button" className="text-red-300" onClick={() => { onDelete(menuState.project.id); setMenuState(null); }}>Delete</button>
      </div>,
      document.body,
    );

  if (loading) return <AdminTableSkeleton />;

  if (projects.length === 0) {
    return (
      <div className="admin-projects-empty flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-[var(--admin-text)]">No projects match your filters</p>
        <p className="mt-1 text-xs text-[var(--admin-text-muted)]">Try clearing filters or create a new project.</p>
      </div>
    );
  }

  if (listDisplay === "grid") {
    return (
      <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <article key={project.id} className="admin-projects-card">
              <div className="flex items-start gap-3">
                <ProjectThumb />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[var(--admin-text)]">{project.title}</p>
                  <p className="truncate text-xs text-[var(--admin-text-muted)]">{inferCategory(project.title, project.description)}</p>
                </div>
                <ProjectStatusBadge status={project.status} />
              </div>
              <p className="mt-3 text-xs text-[var(--admin-text-muted)]">{clientDisplayName(project)}</p>
              <div className="mt-4"><ProjectProgress status={project.status} /></div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => onView(project)} className="admin-projects-action-btn admin-projects-action-btn-text">View</button>
                <button type="button" onClick={() => onEdit(project)} className="admin-projects-action-btn admin-projects-action-btn-text">Edit</button>
              </div>
            </article>
          ))}
        </div>
        {menuPortal}
      </>
    );
  }

  return (
    <>
      <div className="admin-projects-table-wrap overflow-x-auto">
        <table className="admin-projects-table w-full min-w-[1080px] text-sm">
          <thead>
            <tr className="text-left text-[11px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">
              <th className="px-3 py-3">Project</th>
              <th className="px-3 py-3">Client</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Progress</th>
              <th className="px-3 py-3">Deadline</th>
              <th className="px-3 py-3">Budget</th>
              <th className="px-3 py-3">Team</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const countdown = deadlineCountdown(project.deadline, project.status);
              return (
                <tr key={project.id} className="admin-projects-table-row">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <ProjectThumb />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[var(--admin-text)]">{project.title}</p>
                        <p className="truncate text-xs text-[var(--admin-text-muted)]">{inferCategory(project.title, project.description)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="admin-projects-avatar">{initials(clientDisplayName(project))}</div>
                      <div className="min-w-0">
                        <p className="truncate text-[var(--admin-text)]">{clientDisplayName(project)}</p>
                        <p className="truncate text-xs text-[var(--admin-text-muted)]">{contactName(project)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3"><ProjectStatusBadge status={project.status} /></td>
                  <td className="px-3 py-3"><ProjectProgress status={project.status} /></td>
                  <td className="px-3 py-3">
                    <p className="text-[var(--admin-text)]">{formatDeadline(project.deadline)}</p>
                    {countdown ? (
                      <p className={cn("text-xs", countdown.tone === "danger" ? "text-red-300" : countdown.tone === "warning" ? "text-amber-300" : "text-[var(--admin-gold-light)]")}>
                        {countdown.label}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 font-medium tabular-nums text-[var(--admin-text)]">{formatCurrencyDetailed(project.budget)}</td>
                  <td className="px-3 py-3"><TeamAvatars project={project} /></td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button type="button" onClick={() => onView(project)} className="admin-projects-action-btn" aria-label={`View ${project.title}`}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const button = e.currentTarget;
                          setMenuState((current) =>
                            current?.project.id === project.id ? null : { project, ...getMenuPosition(button) },
                          );
                        }}
                        className="admin-projects-action-btn"
                        aria-label="More actions"
                        aria-expanded={menuState?.project.id === project.id}
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {menuPortal}
    </>
  );
}

type ProjectsKanbanProps = {
  projects: ProjectRecord[];
  loading: boolean;
  onView: (project: ProjectRecord) => void;
};

const KANBAN_COLUMNS = [
  { key: "overdue", label: "Overdue", match: (p: ProjectRecord) => isOverdue(p) },
  { key: "on_hold", label: "On Hold", match: (p: ProjectRecord) => p.status === "on_hold" },
  { key: "completed", label: "Completed", match: (p: ProjectRecord) => p.status === "completed" },
  { key: "in_progress", label: "In Progress", match: (p: ProjectRecord) => isInProgressStatus(p.status) },
] as const;

export function ProjectsKanban({ projects, loading, onView }: ProjectsKanbanProps) {
  if (loading) return <AdminTableSkeleton />;

  const assigned = new Set<string>();
  const bucket = (match: (p: ProjectRecord) => boolean) =>
    projects.filter((project) => {
      if (assigned.has(project.id)) return false;
      if (!match(project)) return false;
      assigned.add(project.id);
      return true;
    });

  const columns = KANBAN_COLUMNS.map((column) => ({
    ...column,
    items: bucket(column.match),
  }));

  return (
    <div className="admin-projects-kanban">
      {columns.map((column) => {
        const items = column.items;
        return (
          <section key={column.key} className="admin-projects-kanban-column">
            <header className="admin-projects-kanban-header">
              <h3>{column.label}</h3>
              <span>{items.length}</span>
            </header>
            <div className="admin-projects-kanban-cards">
              {items.length === 0 ? (
                <p className="px-2 py-4 text-center text-xs text-[var(--admin-text-muted)]">No projects</p>
              ) : (
                items.map((project) => (
                  <button key={project.id} type="button" onClick={() => onView(project)} className="admin-projects-kanban-card">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-left text-sm font-medium text-[var(--admin-text)]">{project.title}</p>
                      <ProjectStatusBadge status={project.status} />
                    </div>
                    <p className="mt-2 text-left text-xs text-[var(--admin-text-muted)]">{clientDisplayName(project)}</p>
                    <div className="mt-3"><ProjectProgress status={project.status} /></div>
                    <p className="mt-2 text-left text-xs tabular-nums text-[var(--admin-gold-light)]">{formatCurrencyDetailed(project.budget)}</p>
                  </button>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

