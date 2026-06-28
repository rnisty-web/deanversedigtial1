import Link from "next/link";
import type { DashboardTheme } from "@/components/dashboard/DashboardPanel";
import { cn } from "@/lib/utils";

export function DashboardSectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
  actionHref,
  actionLabel,
  className,
  theme = "portal",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
  theme?: DashboardTheme;
}) {
  const isAdmin = theme === "admin";

  return (
    <div className={cn("mb-4 flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.2em]",
              isAdmin ? "text-[var(--admin-gold)]" : "text-[var(--accent)]",
            )}
          >
            {eyebrow}
          </p>
        )}
        <h2
          className={cn(
            "font-semibold",
            isAdmin ? "text-[var(--admin-text)]" : "text-white",
            eyebrow ? "mt-1 text-lg" : "text-sm",
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={cn(
              isAdmin ? "text-[var(--admin-text-muted)]" : "text-white/40",
              eyebrow ? "mt-1 text-sm" : "mt-0.5 text-xs",
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action ??
        (actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className={cn(
              "text-xs font-medium transition-colors",
              isAdmin
                ? "text-[var(--admin-gold-light)] hover:text-[var(--admin-text)]"
                : "text-[var(--accent)] hover:text-white",
            )}
          >
            {actionLabel} →
          </Link>
        ) : null)}
    </div>
  );
}
