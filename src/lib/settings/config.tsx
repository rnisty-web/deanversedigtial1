import type { ReactNode } from "react";

export type SettingsCategory = {
  id: string;
  section: "Personal" | "Platform";
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
    title: "My Account",
    description: "Profile, email, password, activity status, and how your team sees your availability.",
    href: "/admin/settings/my-account",
    cta: "Open my account",
    statLabel: "Signed in as",
    statFallback: "Your account",
    tags: ["profile", "account", "email", "password", "avatar", "notifications", "status", "security"],
    tone: "gold",
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    id: "appearance",
    section: "Platform",
    title: "Dashboard Appearance",
    description: "Switch between luxury color palettes for the admin and client portals.",
    href: "/admin/settings/appearance",
    cta: "Choose theme",
    statLabel: "Theme",
    statFallback: "Gold & Emerald",
    tags: ["appearance", "theme", "colors", "dashboard", "portal", "ui"],
    tone: "gold",
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.897 2.13l-.002.003a2.252 2.252 0 01-.88-1.823V8.25A2.25 2.25 0 016 6h12a2.25 2.25 0 012.25 2.25v8.568a2.252 2.252 0 01-.88 1.823l-.002.003a2.25 2.25 0 01-2.897-2.13 3 3 0 00-5.78-1.128" />
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
    tags: ["integrations", "supabase", "resend", "stripe", "vercel", "api", "webhooks"],
    tone: "emerald",
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
  },
];

export const settingsSections = ["Personal", "Platform"] as const;

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
