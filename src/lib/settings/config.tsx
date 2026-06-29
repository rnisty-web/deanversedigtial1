import type { ReactNode } from "react";

export type SettingsCategory = {
  id: string;
  section: "Personal" | "Organization" | "Platform";
  title: string;
  description: string;
  href: string;
  cta: string;
  statLabel: string;
  statFallback: string;
  tags: string[];
  icon: ReactNode;
  tone?: "gold" | "emerald" | "neutral";
};

const iconClass = "h-5 w-5";

export const settingsCategories: SettingsCategory[] = [
  {
    id: "profile",
    section: "Personal",
    title: "Profile",
    description: "Name, avatar, phone, email, and password for your admin account.",
    href: "/admin/settings/my-account",
    cta: "Manage profile",
    statLabel: "Signed in as",
    statFallback: "Your account",
    tags: ["profile", "account", "email", "password", "avatar"],
    tone: "gold",
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    id: "notifications",
    section: "Personal",
    title: "Notifications & Status",
    description: "Activity status, team visibility, and how clients see your availability.",
    href: "/admin/settings/my-account",
    cta: "Update status",
    statLabel: "Presence",
    statFallback: "Configurable",
    tags: ["notifications", "status", "activity", "presence"],
    tone: "emerald",
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
  },
  {
    id: "company",
    section: "Organization",
    title: "Company & Branding",
    description: "Site copy, SEO metadata, hero sections, and global theme content.",
    href: "/admin/content",
    cta: "Edit site content",
    statLabel: "CMS",
    statFallback: "Live site",
    tags: ["company", "branding", "content", "seo", "site"],
    tone: "gold",
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008H17.25v-.008z" />
      </svg>
    ),
  },
  {
    id: "team",
    section: "Organization",
    title: "Team & Roles",
    description: "Invite staff, assign roles, and manage who can access the admin portal.",
    href: "/admin/users",
    cta: "Manage users",
    statLabel: "Team members",
    statFallback: "—",
    tags: ["team", "users", "roles", "permissions", "invite"],
    tone: "emerald",
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    id: "billing",
    section: "Organization",
    title: "Billing & Invoices",
    description: "Invoice settings, payment tracking, and client billing workflows.",
    href: "/admin/invoices",
    cta: "Open invoices",
    statLabel: "Billing",
    statFallback: "Active",
    tags: ["billing", "invoices", "payments", "stripe"],
    tone: "gold",
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  },
  {
    id: "security",
    section: "Platform",
    title: "Security",
    description: "Password policies, session hygiene, and account protection for your workspace.",
    href: "/admin/settings/my-account",
    cta: "Review security",
    statLabel: "Auth",
    statFallback: "Supabase",
    tags: ["security", "password", "auth", "sessions"],
    tone: "emerald",
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    id: "integrations",
    section: "Platform",
    title: "Integrations",
    description: "Connected services powering auth, email, payments, and hosting.",
    href: "/admin/settings#integrations",
    cta: "View connections",
    statLabel: "Services",
    statFallback: "4 connected",
    tags: ["integrations", "supabase", "resend", "stripe", "vercel"],
    tone: "gold",
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
  },
  {
    id: "storage",
    section: "Platform",
    title: "Storage & Media",
    description: "Media library usage, uploads, and asset organization for your site.",
    href: "/admin/media",
    cta: "Open media library",
    statLabel: "Assets",
    statFallback: "—",
    tags: ["storage", "media", "files", "uploads"],
    tone: "emerald",
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
  },
  {
    id: "api",
    section: "Platform",
    title: "API & Automation",
    description: "Admin API routes, webhooks, and automation endpoints used by your stack.",
    href: "/admin/analytics",
    cta: "View analytics API",
    statLabel: "Endpoints",
    statFallback: "26 routes",
    tags: ["api", "webhooks", "automation", "advanced"],
    tone: "neutral",
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
  },
  {
    id: "advanced",
    section: "Platform",
    title: "Advanced",
    description: "Analytics, performance insights, and workspace-level reporting.",
    href: "/admin/analytics",
    cta: "Open analytics",
    statLabel: "Insights",
    statFallback: "Dashboard",
    tags: ["advanced", "analytics", "reports", "performance"],
    tone: "gold",
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    ),
  },
];

export const settingsSections = ["Personal", "Organization", "Platform"] as const;

export const connectedIntegrations = [
  { name: "Supabase", detail: "Auth, database & storage", status: "Connected" },
  { name: "Vercel", detail: "Hosting & deployments", status: "Connected" },
  { name: "Resend", detail: "Transactional email", status: "Connected" },
  { name: "Stripe", detail: "Client invoice checkout", status: "Optional" },
] as const;

export function filterSettingsCategories(categories: SettingsCategory[], search: string) {
  const q = search.trim().toLowerCase();
  if (!q) return categories;
  return categories.filter((item) =>
    [item.title, item.description, item.section, ...item.tags]
      .some((value) => value.toLowerCase().includes(q)),
  );
}

export function groupSettingsBySection(categories: SettingsCategory[]) {
  return settingsSections
    .map((section) => ({
      section,
      items: categories.filter((item) => item.section === section),
    }))
    .filter((group) => group.items.length > 0);
}
