import { AdminCard } from "@/components/admin/AdminCard";
import { cn } from "@/lib/utils";

export function PortalCard({
  children,
  className,
  hover = false,
  padding = "md",
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  variant?: "default" | "strong";
}) {
  return (
    <AdminCard hover={hover} padding={padding} className={className}>
      {children}
    </AdminCard>
  );
}

export function PortalSectionCard({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("portal-section-card admin-luxury-card scroll-mt-28 p-5 sm:p-6", className)}>
      {children}
    </section>
  );
}
