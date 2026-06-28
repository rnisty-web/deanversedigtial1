export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-14 animate-pulse rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)]"
        />
      ))}
    </div>
  );
}
