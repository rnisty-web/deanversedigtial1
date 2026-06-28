import Link from "next/link";
import { AdminCard } from "@/components/admin/AdminCard";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

type Accent = "primary" | "accent" | "warning" | "neutral";

const portalAccentStyles: Record<Accent, { glow: string; icon: string; value: string }> = {
  primary: {
    glow: "bg-[var(--primary)]/10",
    icon: "border-[color-mix(in_srgb,var(--primary)_30%,transparent)] bg-[var(--primary)]/15 text-[var(--accent)]",
    value: "text-[var(--accent)]",
  },
  accent: {
    glow: "bg-[var(--accent)]/10",
    icon: "border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[var(--accent)]/10 text-[var(--accent)]",
    value: "text-white",
  },
  warning: {
    glow: "bg-amber-500/10",
    icon: "border-amber-400/25 bg-amber-500/10 text-amber-300",
    value: "text-amber-200",
  },
  neutral: {
    glow: "bg-white/5",
    icon: "border-white/10 bg-white/5 text-white/60",
    value: "text-white/80",
  },
};

const adminAccentStyles: Record<Accent, { glow: string; icon: string; value: string }> = {
  primary: {
    glow: "bg-[var(--admin-emerald)]/10",
    icon:
      "border-[color-mix(in_srgb,var(--admin-emerald)_30%,transparent)] bg-[var(--admin-emerald)]/15 text-[var(--admin-gold-light)]",
    value: "text-[var(--admin-gold-light)]",
  },
  accent: {
    glow: "bg-[var(--admin-gold)]/10",
    icon:
      "border-[color-mix(in_srgb,var(--admin-gold)_30%,transparent)] bg-[var(--admin-gold-soft)] text-[var(--admin-gold-light)]",
    value: "text-[var(--admin-gold-light)]",
  },
  warning: {
    glow: "bg-amber-500/10",
    icon: "border-amber-400/25 bg-amber-500/10 text-amber-300",
    value: "text-amber-200",
  },
  neutral: {
    glow: "bg-white/5",
    icon: "border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] text-[var(--admin-text-muted)]",
    value: "text-[var(--admin-text)]",
  },
};

export function DashboardStatCard({
  label,
  value,
  hint,
  href,
  icon,
  accent = "primary",
  variant = "portal",
  trend,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  icon?: React.ReactNode;
  accent?: Accent;
  variant?: "portal" | "admin";
  trend?: string;
  className?: string;
}) {
  const isAdmin = variant === "admin";
  const styles = isAdmin ? adminAccentStyles[accent] : portalAccentStyles[accent];

  const inner = (
    <>
      <div
        className={cn(
          "pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl",
          styles.glow,
        )}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                "text-xs font-medium uppercase tracking-wider",
                isAdmin ? "text-[var(--admin-text-muted)]" : "text-white/45",
              )}
            >
              {label}
            </p>
            {trend && (
              <span className={isAdmin ? "admin-trend-up" : "inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300"}>
                {trend.startsWith("+") || trend.startsWith("-") ? trend : `+${trend}`}
              </span>
            )}
          </div>
          <p className={cn("mt-2 text-3xl font-bold tracking-tight", styles.value)}>{value}</p>
          {hint && (
            <p className={cn("mt-1 text-xs", isAdmin ? "text-[var(--admin-text-muted)]" : "text-white/40")}>
              {hint}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              isAdmin
                ? "admin-stat-icon-glow"
                : "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
              !isAdmin && styles.icon,
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </>
  );

  const content = isAdmin ? (
    <AdminCard hover={!!href} padding="md" className={cn("relative overflow-hidden", className)}>
      {inner}
    </AdminCard>
  ) : (
    <GlassCard hover={!!href} padding="md" className={cn("relative overflow-hidden", className)}>
      {inner}
    </GlassCard>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
