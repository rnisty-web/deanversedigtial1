import Link from "next/link";
import { AdminCard } from "@/components/admin/AdminCard";
import { cn } from "@/lib/utils";

export function DashboardWidget({
  title,
  subtitle,
  eyebrow,
  actionHref,
  actionLabel = "View all",
  children,
  className,
  padding = "md",
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actionHref?: string;
  actionLabel?: string;
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}) {
  return (
    <AdminCard hover padding={padding} className={cn("admin-dashboard-widget h-full", className)}>
      <div className="admin-dashboard-widget-shine" aria-hidden />
      <div className="admin-dashboard-widget-header">
        <div className="min-w-0">
          {eyebrow ? <p className="admin-dashboard-widget-eyebrow">{eyebrow}</p> : null}
          <h3 className="admin-dashboard-widget-title">{title}</h3>
          {subtitle ? <p className="admin-dashboard-widget-subtitle">{subtitle}</p> : null}
        </div>
        {actionHref ? (
          <Link href={actionHref} className="admin-dashboard-link shrink-0">
            {actionLabel} →
          </Link>
        ) : null}
      </div>
      <div className="admin-dashboard-widget-body">{children}</div>
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
    <Link href={href} className={cn("admin-dashboard-list-item block", className)}>
      {children}
    </Link>
  );
}

export function DashboardSectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="admin-dashboard-section-header">
      <p className="admin-dashboard-section-eyebrow">{eyebrow}</p>
      <h2 className="admin-dashboard-section-title admin-heading-serif">{title}</h2>
      {subtitle ? <p className="admin-dashboard-section-subtitle">{subtitle}</p> : null}
    </div>
  );
}
