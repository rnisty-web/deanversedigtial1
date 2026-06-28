import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

export function DashboardQuickAction({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <GlassCard hover padding="sm" className="h-full">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--primary)_25%,transparent)] bg-[var(--primary)]/15 text-[var(--accent)]">
            {icon}
          </span>
          <span className="text-sm font-medium text-white/85">{label}</span>
        </div>
      </GlassCard>
    </Link>
  );
}

export function DashboardPageHero({
  portalLabel,
  title,
  subtitle,
  actions,
}: {
  portalLabel: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="liquid-glass-strong mb-8 rounded-2xl px-5 py-6 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            {portalLabel}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}
