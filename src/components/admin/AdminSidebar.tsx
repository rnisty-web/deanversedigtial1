"use client";

import type { Profile } from "@/lib/auth";
import { AdminNavGroups } from "@/components/admin/AdminNavGroups";
import { AdminProfileCard } from "@/components/admin/AdminProfileCard";
import { AdminSidebarBrand } from "@/components/admin/AdminSidebarBrand";

type AdminSidebarProps = {
  profile: Profile;
  unreadMessagesCount?: number;
};

export function AdminSidebar({ profile, unreadMessagesCount = 0 }: AdminSidebarProps) {
  return (
    <aside className="admin-sidebar relative z-20 hidden h-screen shrink-0 flex-col lg:sticky lg:top-0 lg:flex">
      <div className="flex flex-col items-center px-5 pb-6 pt-8">
        <AdminSidebarBrand />
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
        <AdminNavGroups unreadMessagesCount={unreadMessagesCount} />
      </div>

      <div className="shrink-0 px-4 pb-5 pt-2">
        <AdminProfileCard profile={profile} />
      </div>
    </aside>
  );
}
