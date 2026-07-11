import { PortalPageShell } from "@/components/portal/PortalPageShell";

export default function PortalLoading() {
  return (
    <PortalPageShell>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="admin-luxury-card h-40 animate-pulse" />
        ))}
      </div>
    </PortalPageShell>
  );
}
