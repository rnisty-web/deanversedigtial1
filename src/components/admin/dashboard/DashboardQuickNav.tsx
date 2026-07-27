"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminCard } from "@/components/admin/AdminCard";
import type { AdminPermission } from "@/lib/roles/permissions";

const links: { href: string; label: string; desc: string; permission: AdminPermission }[] = [
  { href: "/workspace/leads", label: "Leads", desc: "Pipeline & follow-ups", permission: "leads" },
  { href: "/workspace/projects", label: "Projects", desc: "Deadlines & delivery", permission: "projects" },
  { href: "/workspace/calendar", label: "Calendar", desc: "Schedule & events", permission: "calendar" },
  { href: "/workspace/users", label: "Users", desc: "Team & presence", permission: "users" },
  { href: "/workspace/content", label: "Content", desc: "Site copy & CMS", permission: "site_content" },
  { href: "/workspace/invoices", label: "Invoices", desc: "Billing & payments", permission: "invoices" },
];

export function DashboardQuickNav() {
  const [permissions, setPermissions] = useState<AdminPermission[] | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/dashboard", { credentials: "same-origin" });
        if (!res.ok) {
          setPermissions([]);
          return;
        }
        const data = await res.json().catch(() => ({}));
        setPermissions(Array.isArray(data.permissions) ? data.permissions : []);
      } catch {
        setPermissions([]);
      }
    })();
  }, []);

  const visibleLinks = useMemo(() => {
    if (!permissions) return [];
    return links.filter((item) => permissions.includes(item.permission));
  }, [permissions]);

  // Skeleton while permissions resolve so unauthorized links never flash.
  if (permissions === null) {
    return <div className="admin-luxury-card h-full min-h-[180px] animate-pulse" aria-hidden />;
  }

  if (visibleLinks.length === 0) return null;

  return (
    <AdminCard hover={false} padding="md" className="admin-dashboard-quick-nav h-full">
      <div className="admin-dashboard-widget-header">
        <div className="min-w-0">
          <p className="admin-dashboard-widget-eyebrow">Workspace</p>
          <h3 className="admin-dashboard-widget-title">Quick navigation</h3>
          <p className="admin-dashboard-widget-subtitle">Jump straight to each area</p>
        </div>
      </div>
      <ul className="admin-dashboard-quick-nav-grid">
        {visibleLinks.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="admin-dashboard-quick-nav-item">
              <span className="admin-dashboard-quick-nav-label">{item.label}</span>
              <span className="admin-dashboard-quick-nav-desc">{item.desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </AdminCard>
  );
}
