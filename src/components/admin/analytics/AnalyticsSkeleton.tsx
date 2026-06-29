export function AnalyticsSkeleton() {
  return (
    <div className="admin-analytics-page space-y-6">
      <div className="admin-luxury-card h-24 animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="admin-stat-card h-28 animate-pulse" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-12">
        <div className="admin-luxury-card h-80 animate-pulse xl:col-span-8" />
        <div className="space-y-6 xl:col-span-4">
          <div className="admin-luxury-card h-56 animate-pulse" />
          <div className="admin-luxury-card h-56 animate-pulse" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="admin-luxury-card h-64 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
