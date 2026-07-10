"use client";

import { useMemo, useState } from "react";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminField } from "@/components/admin/AdminField";
import { AdminModal } from "@/components/admin/AdminModal";
import { PermissionsEditor } from "@/components/admin/users/PermissionsEditor";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { Button } from "@/components/ui/Button";
import {
  ROLE_COLOR_PRESETS,
  normalizeHexColor,
  type RoleDefinition,
} from "@/lib/roles/catalog";
import {
  ALL_ADMIN_PERMISSIONS,
  formatPermissionsLabel,
  getRolePermissions,
  type AdminPermission,
} from "@/lib/roles/permissions";
import { cn } from "@/lib/utils";

type RolesManagerProps = {
  catalog: RoleDefinition[];
  canManage: boolean;
  viewerIsFounder: boolean;
  onCatalogChange: (catalog: RoleDefinition[]) => void;
};

type RoleForm = {
  label: string;
  color: string;
  isStaff: boolean;
  permissions: AdminPermission[];
};

const emptyForm: RoleForm = {
  label: "",
  color: "#c9a962",
  isStaff: false,
  permissions: ["dashboard", "messages"],
};

function RoleColorPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}) {
  const color = normalizeHexColor(value);

  return (
    <div className="admin-roles-color-picker">
      <div className="admin-roles-color-presets">
        {ROLE_COLOR_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            disabled={disabled}
            aria-label={`Use ${preset}`}
            onClick={() => onChange(preset)}
            className={cn(
              "admin-roles-color-swatch",
              color === preset && "admin-roles-color-swatch-active",
            )}
            style={{ backgroundColor: preset }}
          />
        ))}
      </div>
      <div className="admin-roles-color-input-row">
        <input
          type="color"
          value={color}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="admin-roles-color-input"
          aria-label="Pick role color"
        />
        <input
          type="text"
          value={color}
          disabled={disabled}
          onChange={(event) => onChange(normalizeHexColor(event.target.value, color))}
          className="admin-input font-mono text-sm uppercase"
          aria-label="Role color hex value"
        />
        <span
          className="admin-roles-color-preview"
          style={{ backgroundColor: color, boxShadow: `0 0 24px ${color}55` }}
          aria-hidden
        />
      </div>
    </div>
  );
}

export function RolesManager({
  catalog,
  canManage,
  viewerIsFounder,
  onCatalogChange,
}: RolesManagerProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<RoleForm>(emptyForm);
  const [creating, setCreating] = useState(false);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<RoleForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const sortedCatalog = useMemo(
    () => [...catalog].sort((a, b) => a.sortOrder - b.sortOrder),
    [catalog],
  );

  function showFeedback(text: string, tone: "success" | "error" = "success") {
    setMessage(text);
    setMessageTone(tone);
  }

  async function persistOrder(nextOrder: RoleDefinition[]) {
    setReordering(true);
    const res = await fetch("/api/admin/roles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ orderedSlugs: nextOrder.map((role) => role.slug) }),
    });
    setReordering(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showFeedback(data.error ?? "Failed to reorder roles", "error");
      return;
    }

    const data = await res.json();
    onCatalogChange(data.catalog ?? []);
    showFeedback("Role order updated");
  }

  function moveRole(slug: string, direction: -1 | 1) {
    const index = sortedCatalog.findIndex((role) => role.slug === slug);
    const target = index + direction;
    if (index === -1 || target < 0 || target >= sortedCatalog.length) return;
    const next = [...sortedCatalog];
    [next[index], next[target]] = [next[target], next[index]];
    void persistOrder(next);
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);

    const res = await fetch("/api/admin/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        label: createForm.label,
        color: createForm.color,
        isStaff: createForm.isStaff,
      }),
    });

    setCreating(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showFeedback(data.error ?? "Failed to create role", "error");
      return;
    }

    const data = await res.json();
    let nextCatalog = data.catalog ?? [];

    if (createForm.isStaff && createForm.permissions.length > 0 && data.role?.slug) {
      const patchRes = await fetch("/api/admin/roles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          slug: data.role.slug,
          permissions: createForm.permissions,
        }),
      });
      if (patchRes.ok) {
        const patchData = await patchRes.json();
        nextCatalog = patchData.catalog ?? nextCatalog;
      }
    }

    onCatalogChange(nextCatalog);
    setCreateOpen(false);
    setCreateForm(emptyForm);
    showFeedback(`Role "${data.role?.label ?? createForm.label}" created`);
  }

  function openEdit(role: RoleDefinition) {
    if (role.founderOnly && !viewerIsFounder) return;
    setEditSlug(role.slug);
    setEditForm({
      label: role.label,
      color: role.color,
      isStaff: role.isStaff,
      permissions: role.isStaff ? getRolePermissions(role) : [],
    });
  }

  async function handleSaveEdit(event: React.FormEvent) {
    event.preventDefault();
    if (!editSlug || !editForm) return;

    setSaving(true);
    const res = await fetch("/api/admin/roles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        slug: editSlug,
        label: editForm.label,
        color: editForm.color,
        isStaff: editForm.isStaff,
        permissions: editForm.isStaff ? editForm.permissions : [],
      }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showFeedback(data.error ?? "Failed to update role", "error");
      return;
    }

    const data = await res.json();
    onCatalogChange(data.catalog ?? []);
    setEditSlug(null);
    setEditForm(null);
    showFeedback("Role updated");
  }

  async function handleDelete(slug: string) {
    setDeletingSlug(slug);
    const res = await fetch(`/api/admin/roles?slug=${encodeURIComponent(slug)}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    setDeletingSlug(null);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showFeedback(data.error ?? "Failed to delete role", "error");
      return;
    }

    const data = await res.json();
    onCatalogChange(data.catalog ?? []);
    showFeedback("Role removed");
  }

  return (
    <div className="admin-roles-manager">
      <div className="admin-roles-manager-header">
        <div>
          <h2 className="admin-heading-serif text-xl text-[var(--admin-text)]">Role definitions</h2>
          <p className="mt-1 text-sm text-[var(--admin-text-muted)]">
            Reorder how roles appear, set badge colors, and define what each role can access in the admin portal.
          </p>
        </div>
        {canManage ? (
          <button type="button" className="admin-btn-gold px-4 py-2.5 text-sm" onClick={() => setCreateOpen(true)}>
            + Create Role
          </button>
        ) : null}
      </div>

      {message ? (
        <AdminAlert tone={messageTone} className="mt-4">
          {message}
        </AdminAlert>
      ) : null}

      <div className="admin-roles-list mt-6">
        {sortedCatalog.map((role, index) => {
          const editable = canManage && (!role.founderOnly || viewerIsFounder);
          const permissions = getRolePermissions(role);
          return (
            <article key={role.slug} className="admin-roles-list-item">
              <div className="admin-roles-list-order">
                <button
                  type="button"
                  className="admin-roles-order-btn"
                  disabled={!editable || reordering || index === 0}
                  onClick={() => moveRole(role.slug, -1)}
                  aria-label={`Move ${role.label} up`}
                >
                  ↑
                </button>
                <span className="admin-roles-order-index">{index + 1}</span>
                <button
                  type="button"
                  className="admin-roles-order-btn"
                  disabled={!editable || reordering || index === sortedCatalog.length - 1}
                  onClick={() => moveRole(role.slug, 1)}
                  aria-label={`Move ${role.label} down`}
                >
                  ↓
                </button>
              </div>

              <div className="admin-roles-list-main min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <RoleBadge role={role.slug} size="md" catalogOverride={catalog} />
                  <span
                    className="admin-roles-card-dot"
                    style={{ backgroundColor: role.color, boxShadow: `0 0 16px ${role.color}88` }}
                    aria-hidden
                  />
                </div>

                <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div className="flex items-center justify-between gap-2 sm:justify-start sm:gap-4">
                    <span className="text-[var(--admin-text-muted)]">Portal access</span>
                    <span className="font-medium text-[var(--admin-text)]">
                      {role.isStaff ? "Staff (admin)" : "Client only"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 sm:justify-start sm:gap-4">
                    <span className="text-[var(--admin-text-muted)]">Type</span>
                    <span className="font-medium text-[var(--admin-text)]">
                      {role.isSystem ? "System" : "Custom"}
                    </span>
                  </div>
                </div>

                {role.isStaff ? (
                  <p className="mt-3 text-xs text-[var(--admin-text-muted)]">
                    <span className="font-medium text-[var(--admin-gold-light)]">Permissions: </span>
                    {formatPermissionsLabel(permissions)}
                  </p>
                ) : null}
              </div>

              {editable ? (
                <div className="admin-roles-list-actions">
                  <button type="button" className="admin-btn-ghost px-3 py-1.5 text-xs" onClick={() => openEdit(role)}>
                    Edit
                  </button>
                  {!role.isSystem && viewerIsFounder ? (
                    <button
                      type="button"
                      className="admin-btn-ghost px-3 py-1.5 text-xs text-[var(--admin-danger)]"
                      disabled={deletingSlug === role.slug}
                      onClick={() => handleDelete(role.slug)}
                    >
                      {deletingSlug === role.slug ? "Removing…" : "Remove"}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <AdminModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Role"
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" className="admin-btn-ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="create-role-form" size="sm" className="admin-btn-gold" disabled={creating}>
              {creating ? "Creating…" : "Create Role"}
            </Button>
          </div>
        }
      >
        <form id="create-role-form" onSubmit={handleCreate} className="space-y-4">
          <AdminField
            label="Role name"
            value={createForm.label}
            onChange={(value) => setCreateForm({ ...createForm, label: value })}
            placeholder="e.g. Sales Manager"
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">Badge color</label>
            <RoleColorPicker
              value={createForm.color}
              onChange={(color) => setCreateForm({ ...createForm, color })}
            />
          </div>
          <label className="admin-roles-toggle">
            <input
              type="checkbox"
              checked={createForm.isStaff}
              onChange={(event) =>
                setCreateForm({
                  ...createForm,
                  isStaff: event.target.checked,
                  permissions: event.target.checked ? ["dashboard", "messages"] : [],
                })
              }
            />
            <span>
              <strong className="block text-sm text-[var(--admin-text)]">Staff role</strong>
              <span className="text-xs text-[var(--admin-text-muted)]">
                Users with this role can access the admin portal.
              </span>
            </span>
          </label>
          {createForm.isStaff ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--admin-text-muted)]">
                Admin portal permissions
              </label>
              <PermissionsEditor
                value={createForm.permissions}
                onChange={(permissions) => setCreateForm({ ...createForm, permissions })}
                compact
              />
            </div>
          ) : null}
        </form>
      </AdminModal>

      <AdminModal
        open={Boolean(editSlug && editForm)}
        onClose={() => {
          setEditSlug(null);
          setEditForm(null);
        }}
        title="Edit Role"
        size="lg"
        footer={
          editForm ? (
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="admin-btn-ghost"
                onClick={() => {
                  setEditSlug(null);
                  setEditForm(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" form="edit-role-form" size="sm" className="admin-btn-gold" disabled={saving}>
                {saving ? "Saving…" : "Save Role"}
              </Button>
            </div>
          ) : null
        }
      >
        {editForm ? (
          <form id="edit-role-form" onSubmit={handleSaveEdit} className="space-y-4">
            <AdminField
              label="Role name"
              value={editForm.label}
              onChange={(value) => setEditForm({ ...editForm, label: value })}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">Badge color</label>
              <RoleColorPicker
                value={editForm.color}
                onChange={(color) => setEditForm({ ...editForm, color })}
              />
            </div>
            {!editSlug || editSlug !== "admin" ? (
              <label className="admin-roles-toggle">
                <input
                  type="checkbox"
                  checked={editForm.isStaff}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      isStaff: event.target.checked,
                      permissions: event.target.checked ? editForm.permissions : [],
                    })
                  }
                />
                <span>
                  <strong className="block text-sm text-[var(--admin-text)]">Staff role</strong>
                  <span className="text-xs text-[var(--admin-text-muted)]">
                    Users with this role can access the admin portal.
                  </span>
                </span>
              </label>
            ) : null}
            {editForm.isStaff ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--admin-text-muted)]">
                  Admin portal permissions
                </label>
                <PermissionsEditor
                  value={
                    editSlug === "admin" && editForm.permissions.length === 0
                      ? ALL_ADMIN_PERMISSIONS
                      : editForm.permissions
                  }
                  onChange={(permissions) => setEditForm({ ...editForm, permissions })}
                  disabled={editSlug === "admin"}
                  compact
                />
                {editSlug === "admin" ? (
                  <p className="mt-2 text-xs text-[var(--admin-text-muted)]">
                    The Founder role always has full admin access.
                  </p>
                ) : null}
              </div>
            ) : null}
          </form>
        ) : null}
      </AdminModal>
    </div>
  );
}
