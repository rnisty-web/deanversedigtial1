import { cn } from "@/lib/utils";
import { getRoleLabel, getRoleStyle, type UserRole } from "@/lib/roles";

type RoleBadgeProps = {
  role: UserRole | string;
  size?: "sm" | "md";
  showDot?: boolean;
  className?: string;
};

export function RoleBadge({
  role,
  size = "sm",
  showDot = true,
  className,
}: RoleBadgeProps) {
  const style = getRoleStyle(role);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium backdrop-blur-sm",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
        style.badge,
        className,
      )}
    >
      {showDot && <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", style.dot)} />}
      {getRoleLabel(role)}
    </span>
  );
}
