import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type AdminEmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  icon?: React.ReactNode;
  className?: string;
};

export function AdminEmptyState({
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  icon,
  className,
}: AdminEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] px-6 py-16 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--admin-emerald)]/15 text-[var(--admin-gold-light)]">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-[var(--admin-text)]">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--admin-text-muted)]">
          {description}
        </p>
      )}
      {actionLabel && (onAction || actionHref) && (
        <div className="mt-6">
          {actionHref ? (
            <Button href={actionHref} size="sm" className="admin-btn-gold">
              {actionLabel}
            </Button>
          ) : (
            <Button size="sm" className="admin-btn-gold" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
