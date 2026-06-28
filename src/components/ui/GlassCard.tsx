import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  as?: "div" | "article" | "section";
  variant?: "default" | "strong";
}

const paddingMap = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

export function GlassCard({
  children,
  className,
  hover = true,
  padding = "md",
  as: Component = "div",
  variant = "default",
}: GlassCardProps) {
  return (
    <Component
      className={cn(
        "rounded-2xl",
        variant === "strong" ? "liquid-glass-strong" : "liquid-glass",
        hover &&
          "transition-all duration-500 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_35%,transparent)] hover:shadow-[0_24px_48px_-16px_var(--glass-shadow)]",
        paddingMap[padding],
        className,
      )}
    >
      {children}
    </Component>
  );
}
