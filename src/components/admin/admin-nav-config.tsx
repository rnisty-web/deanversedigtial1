import type { ReactNode } from "react";

export type AdminNavItem = {
  id: string;
  href: string;
  label: string;
  icon: ReactNode;
};

const iconClass = "h-5 w-5 shrink-0";

const icons = {
  dashboard: (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  ),
  projects: (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12.75V6A2.25 2.25 0 014.5 3.75h4.379a2.25 2.25 0 011.59.659l2.122 2.122a2.25 2.25 0 001.59.659H19.5A2.25 2.25 0 0121.75 9v10.5A2.25 2.25 0 0119.5 21.75h-15A2.25 2.25 0 012.25 19.5v-6.75z"
      />
    </svg>
  ),
  clients: (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5l1.1 2.2 2.4.35-1.75 1.7.42 2.45L12 9.9l-2.17 1.3.42-2.45-1.75-1.7 2.4-.35L12 4.5z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 11.25a3.75 3.75 0 11-7.5 0M4.501 20.118a7.5 7.5 0 0115 0"
      />
    </svg>
  ),
  leads: (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="8.25" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 7.5l.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2L9.1 9.6l2-.3.9-1.8z"
      />
    </svg>
  ),
  services: (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.75l7.5 4.33v8.67L12 21 4.5 16.75V8.08L12 3.75z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12l7.5-4.33M12 12v9M12 12L4.5 7.67" />
    </svg>
  ),
  invoices: (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  ),
  payments: (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="8.25" />
      <path strokeLinecap="round" d="M12 8.25v7.5M8.25 12h7.5" />
    </svg>
  ),
  team: (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  ),
  messages: (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H5.25a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H5.25a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0l-7.5-4.615a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  ),
  calendar: (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  ),
  analytics: (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5v-7.5M9.75 19.5v-12M15 19.5V9M19.5 19.5V4.5" />
    </svg>
  ),
  formsLeads: (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6.11L3 7.5h5.25M9 3.75h6m-6 16.5h6m2.25-13.5H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  settings: (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

/** Flat sidebar order matching the reference design */
export const adminNavItems: AdminNavItem[] = [
  { id: "dashboard", href: "/admin", label: "Dashboard", icon: icons.dashboard },
  { id: "projects", href: "/admin/projects", label: "Projects", icon: icons.projects },
  { id: "clients", href: "/admin/clients", label: "Clients", icon: icons.clients },
  { id: "leads", href: "/admin/leads", label: "Leads", icon: icons.leads },
  { id: "services", href: "/admin/content", label: "Services", icon: icons.services },
  { id: "invoices", href: "/admin/invoices", label: "Invoices", icon: icons.invoices },
  { id: "payments", href: "/admin/invoices", label: "Payments", icon: icons.payments },
  { id: "team", href: "/admin/users", label: "Team", icon: icons.team },
  { id: "messages", href: "/admin/messages", label: "Messages", icon: icons.messages },
  { id: "calendar", href: "/admin/calendar", label: "Calendar", icon: icons.calendar },
  { id: "analytics", href: "/admin/analytics", label: "Analytics", icon: icons.analytics },
  { id: "forms-leads", href: "/admin/leads", label: "Forms & Leads", icon: icons.formsLeads },
  { id: "settings", href: "/admin/settings", label: "Settings", icon: icons.settings },
];

export const quickActionItems = adminNavItems.filter((item) => item.href !== "/admin");
