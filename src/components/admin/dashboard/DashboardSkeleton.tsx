export function DashboardSkeleton() {
  return (
    <div className="admin-dashboard-page space-y-10">
      <div className="admin-dashboard-kpi-grid">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="admin-dashboard-skeleton-kpi animate-pulse" />
        ))}
      </div>

      <div className="admin-dashboard-featured-grid">
        <div className="admin-dashboard-skeleton-panel admin-dashboard-skeleton-panel--tall animate-pulse" />
        <div className="admin-dashboard-skeleton-panel animate-pulse" />
      </div>

      <div className="admin-dashboard-widget-grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="admin-dashboard-skeleton-panel animate-pulse" />
        ))}
      </div>

      <div className="admin-dashboard-widget-grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="admin-dashboard-skeleton-panel animate-pulse" />
        ))}
      </div>
    </div>
  );
}
