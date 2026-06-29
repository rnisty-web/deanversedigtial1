import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";

export function PortalStatCard({
  label,
  value,
  hint,
  href,
  accent = "primary",
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  accent?: "primary" | "accent" | "warning" | "neutral";
  icon?: React.ReactNode;
}) {
  return (
    <DashboardStatCard
      label={label}
      value={value}
      hint={hint}
      href={href}
      accent={accent}
      icon={icon}
      variant="admin"
    />
  );
}
