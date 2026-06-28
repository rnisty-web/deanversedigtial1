"use client";

import {
  canAssignRole,
  getAssignableRolesForUser,
  getRoleLabel,
  getRoleStyle,
  toAssignableRoles,
  type UserRole,
} from "@/lib/roles";
import { cn } from "@/lib/utils";

type RoleMultiSelectProps = {
  value: UserRole | UserRole[] | string | null | undefined;
  onChange: (roles: UserRole[]) => void;
  assignerIsFounder: boolean;
  className?: string;
  size?: "sm" | "md";
  disabled?: boolean;
};

export function RoleMultiSelect({
  value,
  onChange,
  assignerIsFounder,
  className,
  size = "md",
  disabled = false,
}: RoleMultiSelectProps) {
  const available = getAssignableRolesForUser(assignerIsFounder);
  const selected = toAssignableRoles(value);

  function toggle(role: UserRole) {
    if (disabled || !canAssignRole(role, assignerIsFounder)) return;

    const next = selected.includes(role)
      ? selected.filter((r) => r !== role)
      : [...selected, role];

    onChange(next.length > 0 ? next : ["customer"]);
  }

  return (
    <div
      className={cn(
        "liquid-glass flex flex-wrap gap-2 rounded-xl p-2",
        size === "sm" && "gap-1.5 p-1.5",
        className,
      )}
      role="group"
      aria-label="User roles"
    >
      {available.map((role) => {
        const active = selected.includes(role);
        const style = getRoleStyle(role);

        return (
          <button
            key={role}
            type="button"
            disabled={disabled}
            onClick={() => toggle(role)}
            aria-pressed={active}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border font-medium backdrop-blur-sm transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
              active
                ? cn(style.badge, "border-transparent shadow-sm")
                : "border-white/10 bg-white/[0.03] text-white/45 hover:border-white/20 hover:bg-white/[0.06] hover:text-white/70",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full transition-opacity",
                active ? style.dot : "bg-white/25",
              )}
            />
            {getRoleLabel(role)}
          </button>
        );
      })}
    </div>
  );
}
