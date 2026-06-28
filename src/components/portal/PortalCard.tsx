import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

export function PortalCard({
  children,
  className,
  hover = false,
  padding = "md",
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  variant?: "default" | "strong";
}) {
  return (
    <GlassCard
      hover={hover}
      padding={padding}
      variant={variant}
      className={cn("rounded-2xl", className)}
    >
      {children}
    </GlassCard>
  );
}
