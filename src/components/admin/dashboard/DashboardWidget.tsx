import Link from "next/link";
import { AdminCard } from "@/components/admin/AdminCard";
import { cn } from "@/lib/utils";

export function DashboardWidget({
  title,
  subtitle,
  actionHref,
  actionLabel = "View all",
  children,
  className,
  padding = "md",
}: {
  title: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}) {
  return (
    <AdminCard hover={false} padding={padding} className={cn("admin-dashboard-widget h-full", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[var(--admin-text)]">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-xs text-[var(--admin-text-muted)]">{subtitle}</p> : null}
        </div>
        {actionHref ? (
          <Link href={actionHref} className="admin-dashboard-link shrink-0">
            {actionLabel} →
          </Link>
        ) : null}
      </div>
      {children}
    </AdminCard>
  );
}

export function DashboardWidgetLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "admin-dashboard-list-item block transition-colors hover:border-[var(--admin-gold)]/30 hover:bg-[var(--admin-gold-soft)]",
        className,
      )}
    >
      {children}
    </Link>
  );
}
