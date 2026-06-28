import { cn } from "@/lib/utils";
import {
  getAssignableRolesForUser,
  getRoleLabel,
  getRoleSelectClass,
  toAssignableRole,
  type UserRole,
} from "@/lib/roles";

type RoleSelectProps = {
  value: UserRole | string;
  onChange: (role: UserRole) => void;
  assignerIsFounder: boolean;
  className?: string;
  size?: "sm" | "md";
  disabled?: boolean;
};

export function RoleSelect({
  value,
  onChange,
  assignerIsFounder,
  className,
  size = "md",
  disabled = false,
}: RoleSelectProps) {
  const roles = getAssignableRolesForUser(assignerIsFounder);
  const current = toAssignableRole(value);

  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value as UserRole)}
      disabled={disabled}
      className={cn(
        "rounded-xl border font-medium backdrop-blur-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25",
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "w-full px-4 py-2.5 text-sm",
        getRoleSelectClass(current),
        className,
      )}
    >
      {roles.map((role) => (
        <option key={role} value={role} className="bg-[var(--background)] text-white">
          {getRoleLabel(role)}
        </option>
      ))}
    </select>
  );
}
