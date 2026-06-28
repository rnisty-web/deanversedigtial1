import Link from "next/link";
import { AdminCard } from "@/components/admin/AdminCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { DashboardSectionHeader } from "@/components/dashboard/DashboardSectionHeader";
import { cn } from "@/lib/utils";

export type DashboardTheme = "portal" | "admin";

export function DashboardPanel({
  eyebrow,
  title,
  subtitle,
  action,
  actionHref,
  actionLabel,
  children,
  className,
  padding = "lg",
  variant = "default",
  theme = "portal",
  headerExtra,
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  variant?: "default" | "featured";
  theme?: DashboardTheme;
  headerExtra?: React.ReactNode;
}) {
  const isAdmin = theme === "admin";
  const isFeatured = variant === "featured";

  const cardClassName = cn(
    "h-full",
    isAdmin &&
      isFeatured &&
      "border-[color-mix(in_srgb,var(--admin-gold)_25%,transparent)] bg-gradient-to-br from-[var(--admin-gold-soft)] via-transparent to-transparent",
    !isAdmin &&
      isFeatured &&
      "border-[color-mix(in_srgb,var(--primary)_25%,transparent)] bg-gradient-to-br from-[var(--primary)]/8 via-transparent to-transparent",
    className,
  );

  const header = (title || headerExtra) && (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      {title ? (
        <DashboardSectionHeader
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          action={action}
          actionHref={actionHref}
          actionLabel={actionLabel}
          className="mb-0"
          theme={theme}
        />
      ) : (
        headerExtra
      )}
      {title && headerExtra}
    </div>
  );

  if (isAdmin) {
    return (
      <AdminCard hover={false} padding={padding} className={cardClassName}>
        {header}
        {children}
      </AdminCard>
    );
  }

  return (
    <GlassCard
      hover={false}
      padding={padding}
      variant={isFeatured ? "strong" : "default"}
      className={cardClassName}
    >
      {header}
      {children}
    </GlassCard>
  );
}

export function DashboardMetricRow({
  label,
  value,
  href,
  highlight = false,
  suffix,
  theme = "portal",
}: {
  label: string;
  value: number | string;
  href: string;
  highlight?: boolean;
  suffix?: string;
  theme?: DashboardTheme;
}) {
  const isAdmin = theme === "admin";

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition-all duration-200",
        isAdmin
          ? "admin-luxury-card hover:border-[color-mix(in_srgb,var(--admin-gold)_25%,transparent)]"
          : "liquid-glass hover:border-[color-mix(in_srgb,var(--accent)_25%,transparent)]",
        highlight &&
          (isAdmin
            ? "border-[color-mix(in_srgb,var(--admin-gold)_30%,transparent)] bg-[var(--admin-gold-soft)]"
            : "border-[color-mix(in_srgb,var(--primary)_30%,transparent)] bg-[var(--primary)]/8"),
      )}
    >
      <span className={cn("text-sm", isAdmin ? "text-[var(--admin-text-muted)]" : "text-white/70")}>
        {label}
      </span>
      <span
        className={cn(
          "text-lg font-semibold tabular-nums",
          highlight
            ? isAdmin
              ? "text-[var(--admin-gold-light)]"
              : "text-[var(--accent)]"
            : isAdmin
              ? "text-[var(--admin-text)]"
              : "text-white",
        )}
      >
        {value}
        {suffix && (
          <span
            className={cn(
              "text-xs font-normal",
              isAdmin ? "text-[var(--admin-text-muted)]" : "text-white/40",
            )}
          >
            {suffix}
          </span>
        )}
      </span>
    </Link>
  );
}

export function DashboardListRow({
  children,
  className,
  featured = false,
  theme = "portal",
}: {
  children: React.ReactNode;
  className?: string;
  featured?: boolean;
  theme?: DashboardTheme;
}) {
  const isAdmin = theme === "admin";

  return (
    <div
      className={cn(
        "rounded-xl px-4 py-3 transition-all duration-200",
        isAdmin ? "admin-luxury-card" : "liquid-glass",
        featured &&
          (isAdmin
            ? "border-[color-mix(in_srgb,var(--admin-gold)_30%,transparent)] bg-[var(--admin-gold-soft)]"
            : "liquid-glass-strong border-rose-400/25 bg-rose-500/[0.04]"),
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DashboardEmptyState({
  message,
  hint,
  theme = "portal",
}: {
  message: string;
  hint?: string;
  theme?: DashboardTheme;
}) {
  const isAdmin = theme === "admin";

  return (
    <div
      className={cn(
        "rounded-xl border border-dashed py-10 text-center",
        isAdmin
          ? "border-[var(--admin-border-subtle)] bg-[var(--admin-panel)]"
          : "liquid-glass border-white/10",
      )}
    >
      <p className={cn("text-sm", isAdmin ? "text-[var(--admin-text-muted)]" : "text-white/40")}>
        {message}
      </p>
      {hint && (
        <p className={cn("mt-1 text-xs", isAdmin ? "text-[var(--admin-text-muted)]" : "text-white/30")}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function DashboardProgressRow({
  label,
  count,
  href,
  target,
  suffix = " items",
  theme = "portal",
}: {
  label: string;
  count: number;
  href: string;
  target: number;
  suffix?: string;
  theme?: DashboardTheme;
}) {
  const isAdmin = theme === "admin";
  const pct = Math.min(100, Math.round((count / target) * 100));

  return (
    <Link href={href} className="group block">
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span
          className={cn(
            "font-medium group-hover:text-[var(--admin-text)]",
            isAdmin ? "text-[var(--admin-text-muted)]" : "text-white/75 group-hover:text-white",
          )}
        >
          {label}
        </span>
        <span className={isAdmin ? "text-[var(--admin-text-muted)]" : "text-white/45"}>
          {count}
          {suffix}
        </span>
      </div>
      <div
        className={cn(
          "h-1.5 overflow-hidden rounded-full",
          isAdmin ? "bg-[var(--admin-panel-hover)]" : "bg-white/[0.06]",
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isAdmin
              ? "bg-gradient-to-r from-[var(--admin-emerald)] to-[var(--admin-gold)]"
              : "bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </Link>
  );
}
