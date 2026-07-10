"use client";

import Link from "next/link";
import { AdminCard } from "@/components/admin/AdminCard";

const links = [
  { href: "/admin/leads", label: "Leads", desc: "Pipeline & follow-ups" },
  { href: "/admin/projects", label: "Projects", desc: "Deadlines & delivery" },
  { href: "/admin/calendar", label: "Calendar", desc: "Schedule & events" },
  { href: "/admin/users", label: "Users", desc: "Team & presence" },
  { href: "/admin/content", label: "Content", desc: "Site copy & CMS" },
  { href: "/admin/invoices", label: "Invoices", desc: "Billing & payments" },
];

export function DashboardQuickNav() {
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
        {links.map((item) => (
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
