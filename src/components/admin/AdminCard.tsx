import { cn } from "@/lib/utils";

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  as?: "div" | "article" | "section";
}

const paddingMap = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

export function AdminCard({
  children,
  className,
  hover = false,
  padding = "md",
  as: Component = "div",
}: AdminCardProps) {
  return (
    <Component
      className={cn(
        "admin-luxury-card",
        hover && "admin-luxury-card-hover",
        paddingMap[padding],
        className,
      )}
    >
      {children}
    </Component>
  );
}
