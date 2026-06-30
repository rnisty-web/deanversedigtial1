"use client";

import { RoleBadge } from "@/components/ui/RoleBadge";
import { useRoleCatalog } from "@/components/providers/RoleCatalogProvider";
import { parseUserRoles, type UserRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

type RoleBadgesProps = {
  roles: UserRole | UserRole[] | string | string[] | null | undefined;
  size?: "sm" | "md";
  className?: string;
  max?: number;
};

export function RoleBadges({
  roles,
  size = "sm",
  className,
  max,
}: RoleBadgesProps) {
  const catalog = useRoleCatalog();
  const parsed = parseUserRoles(roles);
  const visible = max ? parsed.slice(0, max) : parsed;
  const overflow = max && parsed.length > max ? parsed.length - max : 0;

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      {visible.map((role) => (
        <RoleBadge key={role} role={role} size={size} catalogOverride={catalog} />
      ))}
      {overflow > 0 && (
        <span className="text-xs font-medium text-white/40">+{overflow}</span>
      )}
    </span>
  );
}
