import { cn } from "@/lib/utils";
import {
  DEFAULT_ROLE_CATALOG,
  getRoleDefinition,
  type RoleDefinition,
} from "@/lib/roles/catalog";
import { getRoleLabel, getRoleStyle, type UserRole } from "@/lib/roles";

type RoleBadgeProps = {
  role: UserRole | string;
  size?: "sm" | "md";
  showDot?: boolean;
  className?: string;
  catalogOverride?: RoleDefinition[];
};

export function RoleBadge({
  role,
  size = "sm",
  showDot = true,
  className,
  catalogOverride,
}: RoleBadgeProps) {
  const catalog = catalogOverride ?? DEFAULT_ROLE_CATALOG;
  const style = getRoleStyle(role, catalog);
  const definition = getRoleDefinition(catalog, role);

  if (style.color && definition) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full font-medium backdrop-blur-sm ring-1",
          size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
          className,
        )}
        style={{
          backgroundColor: `${definition.color}22`,
          color: definition.color,
          borderColor: `${definition.color}55`,
          boxShadow: `0 0 20px -8px ${definition.color}66`,
        }}
      >
        {showDot ? (
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: definition.color, boxShadow: `0 0 8px ${definition.color}` }}
          />
        ) : null}
        {getRoleLabel(role, catalog)}
      </span>
    );
  }

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
      {getRoleLabel(role, catalog)}
    </span>
  );
}
