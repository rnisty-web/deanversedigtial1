"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import type { ClientRecord } from "@/lib/clients/utils";
import {
  clientDisplayName,
  contactSubtitle,
  formatCurrencyDetailed,
  initials,
  statusStyle,
  CLIENT_STATUSES,
} from "@/lib/clients/utils";
import { cn } from "@/lib/utils";

export function ClientStatusBadge({ status }: { status: string }) {
  const style = statusStyle(status);
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${style.bg} ${style.text} ${style.border}`}>
      {style.label}
    </span>
  );
}

type MenuState = {
  client: ClientRecord;
  top: number;
  left: number;
};

type ClientsTableProps = {
  clients: ClientRecord[];
  loading: boolean;
  viewMode: "list" | "grid";
  onView: (client: ClientRecord) => void;
  onEdit: (client: ClientRecord) => void;
  onDelete: (id: string) => void;
  onStatusChange: (client: ClientRecord, status: string) => void;
};

const MENU_WIDTH = 192;
const MENU_ESTIMATED_HEIGHT = 320;

function getMenuPosition(button: HTMLElement) {
  const rect = button.getBoundingClientRect();
  const left = Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8));
  let top = rect.bottom + 6;

  if (top + MENU_ESTIMATED_HEIGHT > window.innerHeight - 8) {
    top = Math.max(8, rect.top - MENU_ESTIMATED_HEIGHT - 6);
  }

  return { top, left };
}

export function ClientsTable({
  clients,
  loading,
  viewMode,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: ClientsTableProps) {
  const [menuState, setMenuState] = useState<MenuState | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuState) return;

    function close(e: MouseEvent) {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
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

  if (loading) return <AdminTableSkeleton />;

  if (clients.length === 0) {
    return (
      <div className="admin-clients-empty flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-[var(--admin-text)]">No clients match your filters</p>
        <p className="mt-1 text-xs text-[var(--admin-text-muted)]">Try clearing filters or add a new client.</p>
      </div>
    );
  }

  const menuPortal =
    menuState &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        ref={menuRef}
        className="admin-clients-menu admin-clients-menu-floating"
        role="menu"
        style={{ top: menuState.top, left: menuState.left, width: MENU_WIDTH }}
      >
        <button
          type="button"
          onClick={() => {
            onView(menuState.client);
            setMenuState(null);
          }}
        >
          View details
        </button>
        <button
          type="button"
          onClick={() => {
            onEdit(menuState.client);
            setMenuState(null);
          }}
        >
          Edit client
        </button>
        <Link href={`/admin/projects?client=${menuState.client.id}`} className="admin-clients-menu-link">
          View projects
        </Link>
        <Link href={`/admin/invoices?client=${menuState.client.id}`} className="admin-clients-menu-link">
          View invoices
        </Link>
        <a href={`mailto:${menuState.client.email}`} className="admin-clients-menu-link">
          Send email
        </a>
        {CLIENT_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              onStatusChange(menuState.client, s);
              setMenuState(null);
            }}
            className={cn(menuState.client.status === s && "text-[var(--admin-gold-light)]")}
          >
            Mark as {statusStyle(s).label}
          </button>
        ))}
        <button
          type="button"
          className="text-red-300"
          onClick={() => {
            onDelete(menuState.client.id);
            setMenuState(null);
          }}
        >
          Delete
        </button>
      </div>,
      document.body,
    );

  if (viewMode === "grid") {
    return (
      <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => (
            <article key={client.id} className="admin-clients-card">
              <div className="flex items-start gap-3">
                <div className="admin-clients-avatar admin-clients-avatar-company">{initials(clientDisplayName(client))}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-[var(--admin-text)]">{clientDisplayName(client)}</p>
                    {client.is_vip && <span className="admin-clients-vip-badge">VIP</span>}
                  </div>
                  <p className="truncate text-xs text-[var(--admin-text-muted)]">{contactSubtitle(client)}</p>
                </div>
                <ClientStatusBadge status={client.status} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[var(--admin-text-muted)]">
                <div><span className="block text-[var(--admin-text)]">{client.project_count}</span>Projects</div>
                <div><span className="block text-[var(--admin-gold-light)]">{formatCurrencyDetailed(client.revenue)}</span>Revenue</div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => onView(client)} className="admin-clients-action-btn admin-clients-action-btn-text">
                  View
                </button>
                <button type="button" onClick={() => onEdit(client)} className="admin-clients-action-btn admin-clients-action-btn-text">
                  Edit
                </button>
                <Link href={`/admin/projects?client=${client.id}`} className="admin-clients-action-btn admin-clients-action-btn-text">
                  Projects
                </Link>
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
      <div className="admin-clients-table-wrap overflow-x-auto">
        <table className="admin-clients-table w-full min-w-[820px] text-sm">
          <thead>
            <tr className="text-left text-[11px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">
              <th className="px-3 py-3">Client</th>
              <th className="px-3 py-3">Contact</th>
              <th className="hidden px-3 py-3 lg:table-cell">Phone</th>
              <th className="px-3 py-3">Projects</th>
              <th className="px-3 py-3">Revenue</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="admin-clients-table-row">
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="admin-clients-avatar admin-clients-avatar-company">{initials(clientDisplayName(client))}</div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-[var(--admin-text)]">{clientDisplayName(client)}</p>
                        {client.is_vip && <span className="admin-clients-vip-badge">VIP</span>}
                      </div>
                      <p className="truncate text-xs text-[var(--admin-text-muted)]">{client.industry}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="admin-clients-avatar !h-8 !w-8 text-[10px]">{initials(client.name)}</div>
                    <div className="min-w-0">
                      <p className="truncate text-[var(--admin-text)]">{client.name}</p>
                      <p className="truncate text-xs text-[var(--admin-text-muted)]">{client.email}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden px-3 py-3 text-[var(--admin-text-muted)] lg:table-cell">{client.phone ?? "—"}</td>
                <td className="px-3 py-3">
                  <p className="font-medium text-[var(--admin-text)]">{client.project_count}</p>
                  <Link href={`/admin/projects?client=${client.id}`} className="text-xs text-[var(--admin-gold-light)] hover:underline">View</Link>
                </td>
                <td className="px-3 py-3 font-medium tabular-nums text-[var(--admin-gold-light)]">{formatCurrencyDetailed(client.revenue)}</td>
                <td className="px-3 py-3"><ClientStatusBadge status={client.status} /></td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button type="button" onClick={() => onView(client)} className="admin-clients-action-btn" aria-label={`View ${clientDisplayName(client)}`}>
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
                          current?.client.id === client.id
                            ? null
                            : { client, ...getMenuPosition(button) },
                        );
                      }}
                      className="admin-clients-action-btn"
                      aria-label="More actions"
                      aria-expanded={menuState?.client.id === client.id}
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {menuPortal}
    </>
  );
}
