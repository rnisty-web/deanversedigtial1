import { DashboardPageHero } from "@/components/dashboard/DashboardPageHero";

export function PortalPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <DashboardPageHero
      portalLabel="Client Portal"
      title={title}
      subtitle={subtitle}
      actions={actions}
    />
  );
}
