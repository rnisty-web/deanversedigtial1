"use client";

import { cn } from "@/lib/utils";
import { AdminPageContent } from "@/components/admin/AdminPageContent";

type AdminEntityLayoutProps = {
  pageClassName: string;
  contentClassName?: string;
  header: React.ReactNode;
  alerts?: React.ReactNode;
  stats?: React.ReactNode;
  main: React.ReactNode;
  sidebar: React.ReactNode;
};

export function AdminEntityLayout({
  pageClassName,
  contentClassName,
  header,
  alerts,
  stats,
  main,
  sidebar,
}: AdminEntityLayoutProps) {
  return (
    <div className={pageClassName}>
      {header}
      <AdminPageContent className={cn("admin-entity-content", contentClassName)}>
        {alerts}
        {stats ? <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{stats}</div> : null}
        <div className="admin-entity-layout">
          <div className="admin-entity-main">{main}</div>
          {sidebar}
        </div>
      </AdminPageContent>
    </div>
  );
}
