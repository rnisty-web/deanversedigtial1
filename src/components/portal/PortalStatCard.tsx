import Link from "next/link";
import { cn } from "@/lib/utils";

type Accent = "primary" | "accent" | "warning" | "neutral";

const valueTone: Record<Accent, string> = {
  primary: "text-[var(--admin-gold-light)]",
  accent: "text-[var(--admin-gold-light)]",
  warning: "text-amber-200",
  neutral: "text-[var(--admin-text)]",
};

export function PortalStatCard({
  label,
  value,
  hint,
  href,
  accent = "primary",
  icon,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  accent?: Accent;
  icon?: React.ReactNode;
  className?: string;
}) {
  const card = (
    <div className={cn("admin-portal-stat-card portal-stat-card", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">
            {label}
          </p>
          <p className={cn("mt-1 text-2xl font-bold tabular-nums", valueTone[accent])}>{value}</p>
          {hint ? <p className="mt-1.5 text-xs text-[var(--admin-text-muted)]">{hint}</p> : null}
        </div>
        {icon ? (
          <div className="admin-stat-icon-glow !h-10 !w-10 [&>svg]:h-[18px] [&>svg]:w-[18px]">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {card}
      </Link>
    );
  }

  return card;
}
