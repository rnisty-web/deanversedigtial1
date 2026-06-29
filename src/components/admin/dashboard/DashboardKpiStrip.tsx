"use client";

import Link from "next/link";
import { AdminStatCard } from "@/components/admin/AdminPageHeader";

const icons = {
  revenue: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.242 0l.879.659m0-3.182V6.75A2.25 2.25 0 0010.5 4.5h-3A2.25 2.25 0 005.25 6.75v.659m0 3.182V12" />
    </svg>
  ),
  projects: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  clients: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  leads: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 15.75a6 6 0 11-12 0 6 6 0 0112 0zm0 0v.008M12 12.75h.008v.008H12v-.008z" />
    </svg>
  ),
  traffic: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
};

type DashboardKpiStripProps = {
  revenue: string;
  revenueHint?: string;
  activeProjects: number;
  totalProjects: number;
  clients: number;
  leadsThisMonth: number;
  websiteTraffic: number;
  conversionRate: number;
};

export function DashboardKpiStrip({
  revenue,
  revenueHint,
  activeProjects,
  totalProjects,
  clients,
  leadsThisMonth,
  websiteTraffic,
  conversionRate,
}: DashboardKpiStripProps) {
  const cards = [
    {
      label: "Total Revenue",
      value: revenue,
      hint: revenueHint ?? "Paid invoices to date",
      icon: icons.revenue,
      href: "/admin/invoices",
      goldValue: true,
    },
    {
      label: "Active Projects",
      value: activeProjects,
      hint: `${totalProjects} total projects`,
      icon: icons.projects,
      href: "/admin/projects",
    },
    {
      label: "Total Clients",
      value: clients,
      hint: "Active relationships",
      icon: icons.clients,
      href: "/admin/clients",
    },
    {
      label: "Leads This Month",
      value: leadsThisMonth,
      hint: "New inquiries",
      icon: icons.leads,
      href: "/admin/leads",
    },
    {
      label: "Website Traffic",
      value: websiteTraffic.toLocaleString(),
      hint: `${conversionRate}% conversion · 7 days`,
      icon: icons.traffic,
      href: "/admin/analytics",
    },
  ];

  return (
    <div className="admin-dashboard-kpi-grid">
      {cards.map((card) => (
        <Link key={card.label} href={card.href} className="block">
          <AdminStatCard
            label={card.label}
            value={card.value}
            hint={card.hint}
            icon={card.icon}
            goldValue={card.goldValue}
          />
        </Link>
      ))}
    </div>
  );
}
