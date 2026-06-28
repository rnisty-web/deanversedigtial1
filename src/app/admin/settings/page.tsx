"use client";

import { AdminCard } from "@/components/admin/AdminCard";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import { Button } from "@/components/ui/Button";

const settingsLinks = [
  {
    href: "/admin/settings/my-account",
    title: "My Account",
    description: "Profile, email, phone, avatar, password, and activity status.",
    cta: "Manage account",
  },
  {
    href: "/admin/users",
    title: "Users & Roles",
    description: "Invite team members, assign roles, and manage access.",
    cta: "Manage users",
  },
  {
    href: "/admin/content",
    title: "Site & Branding",
    description: "Update site copy, SEO metadata, and global theme settings.",
    cta: "Edit content",
  },
];

export default function AdminSettingsPage() {
  return (
    <>
      <AdminHeader title="Settings" subtitle="Manage your account and workspace preferences." />

      <AdminPageContent>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {settingsLinks.map((item) => (
            <AdminCard key={item.href} padding="lg" hover>
              <h2 className="text-lg font-semibold text-[var(--admin-text)]">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--admin-text-muted)]">
                {item.description}
              </p>
              <Button href={item.href} className="mt-6 admin-btn-gold" size="sm">
                {item.cta}
              </Button>
            </AdminCard>
          ))}
        </div>
      </AdminPageContent>
    </>
  );
}
