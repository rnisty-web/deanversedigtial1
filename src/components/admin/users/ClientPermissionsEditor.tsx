"use client";

import { cn } from "@/lib/utils";
import {
  CLIENT_PERMISSION_META,
  ALL_CLIENT_PERMISSIONS,
  type ClientPermission,
} from "@/lib/roles/client-permissions";

type ClientPermissionsEditorProps = {
  value: ClientPermission[];
  onChange: (permissions: ClientPermission[]) => void;
  disabled?: boolean;
  compact?: boolean;
  showSelectAll?: boolean;
};

export function ClientPermissionsEditor({
  value,
  onChange,
  disabled = false,
  compact = false,
  showSelectAll = true,
}: ClientPermissionsEditorProps) {
  const selected = new Set(value);

  function toggle(permission: ClientPermission) {
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
            Choose which client portal sections users with this role can access.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="admin-permissions-quick-btn"
              disabled={disabled}
              onClick={() => onChange([...ALL_CLIENT_PERMISSIONS])}
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

      <div className="admin-permissions-grid">
        {CLIENT_PERMISSION_META.map((item) => {
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
    </div>
  );
}
