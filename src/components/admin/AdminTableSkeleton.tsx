export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2.5" aria-hidden>
      <div className="admin-skeleton h-11 rounded-xl" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="admin-skeleton h-14"
          style={{ animationDelay: `${i * 90}ms`, opacity: 1 - i * 0.08 }}
        />
      ))}
    </div>
  );
}
