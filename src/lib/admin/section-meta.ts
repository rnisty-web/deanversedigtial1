export type AdminSectionId =
  | "dashboard"
  | "content"
  | "portfolio"
  | "testimonials"
  | "media"
  | "leads"
  | "clients"
  | "projects"
  | "messages"
  | "invoices"
  | "calendar"
  | "analytics"
  | "users"
  | "settings"
  | "my-account"
  | "appearance";

export type AdminSectionMeta = {
  title: string;
  emoji: string;
  description: string;
  href: string;
};

export const ADMIN_SECTION_META: Record<AdminSectionId, AdminSectionMeta> = {
  dashboard: {
    title: "Dashboard",
    emoji: "✨",
    description: "Your command center — revenue, pipeline, and site health at a glance.",
    href: "/admin",
  },
  content: {
    title: "Site Content",
    emoji: "📝",
    description: "Edit copy, headings, and sections across your live website.",
    href: "/admin/content",
  },
  portfolio: {
    title: "Portfolio",
    emoji: "🖼️",
    description: "Showcase case studies and control which projects appear on the homepage.",
    href: "/admin/portfolio",
  },
  testimonials: {
    title: "Testimonials",
    emoji: "⭐",
    description: "Manage client quotes, ratings, and featured social proof.",
    href: "/admin/testimonials",
  },
  media: {
    title: "Media Library",
    emoji: "🗂️",
    description: "Upload, organize, and reuse images and files across your site.",
    href: "/admin/media",
  },
  leads: {
    title: "Leads",
    emoji: "📥",
    description: "Track inbound inquiries and move prospects through your pipeline.",
    href: "/admin/leads",
  },
  clients: {
    title: "Clients",
    emoji: "🤝",
    description: "Your client directory — linked to projects, invoices, and messages.",
    href: "/admin/clients",
  },
  projects: {
    title: "Projects",
    emoji: "📋",
    description: "Monitor active work, deadlines, budgets, and delivery status.",
    href: "/admin/projects",
  },
  messages: {
    title: "Messages",
    emoji: "💬",
    description: "Client conversations and internal threads in one inbox.",
    href: "/admin/messages",
  },
  invoices: {
    title: "Invoices",
    emoji: "🧾",
    description: "Create, send, and track billing across your client base.",
    href: "/admin/invoices",
  },
  calendar: {
    title: "Calendar",
    emoji: "📅",
    description: "Meetings, milestones, and deadlines in month, week, or day view.",
    href: "/admin/calendar",
  },
  analytics: {
    title: "Analytics",
    emoji: "📊",
    description: "Traffic, conversions, and growth metrics for your business.",
    href: "/admin/analytics",
  },
  users: {
    title: "Users",
    emoji: "👥",
    description: "Team accounts, roles, and access across the portal.",
    href: "/admin/users",
  },
  settings: {
    title: "Settings",
    emoji: "⚙️",
    description: "Workspace preferences, integrations, and platform configuration.",
    href: "/admin/settings",
  },
  "my-account": {
    title: "My Account",
    emoji: "👤",
    description: "Profile, security, and personal preferences.",
    href: "/admin/settings/my-account",
  },
  appearance: {
    title: "Appearance",
    emoji: "🎨",
    description: "Customize your dashboard theme and visual style.",
    href: "/admin/settings/appearance",
  },
};

export function getAdminSectionMeta(section: AdminSectionId): AdminSectionMeta {
  return ADMIN_SECTION_META[section];
}

export function getAdminSearchShortcutLabel() {
  if (typeof navigator === "undefined") return "Ctrl K";
  return /Mac|iPhone|iPad/i.test(navigator.platform) ? "⌘ K" : "Ctrl K";
}
