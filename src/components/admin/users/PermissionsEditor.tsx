"use client";

import { cn } from "@/lib/utils";
import {
  ADMIN_PERMISSION_META,
  ALL_ADMIN_PERMISSIONS,
  type AdminPermission,
} from "@/lib/roles/permissions";

type PermissionsEditorProps = {
  value: AdminPermission[];
  onChange: (permissions: AdminPermission[]) => void;
  disabled?: boolean;
  compact?: boolean;
  showSelectAll?: boolean;
};

const ADMIN_GROUPS = ["Overview", "Content", "Business", "System"] as const;

export function PermissionsEditor({
  value,
  onChange,
  disabled = false,
  compact = false,
  showSelectAll = true,
}: PermissionsEditorProps) {
  const selected = new Set(value);

  function toggle(permission: AdminPermission) {
    if (disabled) return;
    const next = selected.has(permission)
      ? value.filter((item) => item !== permission)
      : [...value, permission];
    onChange(next);
  }

  return (
    <div className={cn("admin-permissions-editor", compact && "admin-permissions-editor-compact")}>
      {showSelectAll ? (
        <div className="admin-permissions-toolbar">
          <p className="text-xs text-[var(--admin-text-muted)]">
            Choose which admin sections this role or user can access.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="admin-permissions-quick-btn"
              disabled={disabled}
              onClick={() => onChange([...ALL_ADMIN_PERMISSIONS])}
            >
              Select all
            </button>
            <button
              type="button"
              className="admin-permissions-quick-btn"
              disabled={disabled}
              onClick={() => onChange([])}
            >
              Clear all
            </button>
          </div>
        </div>
      ) : null}

      <div className="admin-permissions-groups">
        {ADMIN_GROUPS.map((group) => {
          const items = ADMIN_PERMISSION_META.filter((item) => item.group === group);
          if (items.length === 0) return null;

          return (
            <section key={group} className="admin-permissions-group">
              <h4 className="admin-permissions-group-title">{group}</h4>
              <div className="admin-permissions-grid">
                {items.map((item) => {
                  const active = selected.has(item.key);
                  return (
                    <label
                      key={item.key}
                      className={cn(
                        "admin-permissions-item",
                        active && "admin-permissions-item-active",
                        disabled && "admin-permissions-item-disabled",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        disabled={disabled}
                        onChange={() => toggle(item.key)}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-[var(--admin-text)]">{item.label}</span>
                        <span className="mt-0.5 block text-xs text-[var(--admin-text-muted)]">{item.description}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
