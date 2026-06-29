export function DashboardSkeleton() {
  return (
    <div className="admin-dashboard-page space-y-6">
      <div className="admin-dashboard-kpi-grid">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="admin-stat-card h-28 animate-pulse" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-12">
        <div className="admin-luxury-card h-[380px] animate-pulse xl:col-span-7" />
        <div className="flex flex-col gap-6 xl:col-span-5">
          <div className="admin-luxury-card h-52 animate-pulse" />
          <div className="admin-luxury-card h-52 animate-pulse" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="admin-luxury-card h-64 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
