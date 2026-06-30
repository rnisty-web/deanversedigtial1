"use client";

import { useMemo, useState } from "react";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminField } from "@/components/admin/AdminField";
import { AdminModal } from "@/components/admin/AdminModal";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { Button } from "@/components/ui/Button";
import {
  ROLE_COLOR_PRESETS,
  normalizeHexColor,
  type RoleDefinition,
} from "@/lib/roles/catalog";
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
};

const emptyForm: RoleForm = {
  label: "",
  color: "#c9a962",
  isStaff: false,
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

  const sortedCatalog = useMemo(
    () => [...catalog].sort((a, b) => a.sortOrder - b.sortOrder),
    [catalog],
  );

  function showFeedback(text: string, tone: "success" | "error" = "success") {
    setMessage(text);
    setMessageTone(tone);
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);

    const res = await fetch("/api/admin/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(createForm),
    });

    setCreating(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showFeedback(data.error ?? "Failed to create role", "error");
      return;
    }

    const data = await res.json();
    onCatalogChange(data.catalog ?? []);
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
      body: JSON.stringify({ slug: editSlug, ...editForm }),
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
            Create custom roles, choose badge colors, and control admin portal access.
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

      <div className="admin-roles-grid mt-6">
        {sortedCatalog.map((role) => {
          const editable = canManage && (!role.founderOnly || viewerIsFounder);
          return (
            <article key={role.slug} className="admin-roles-card">
              <div className="flex items-start justify-between gap-3">
                <RoleBadge role={role.slug} size="md" catalogOverride={catalog} />
                <span
                  className="admin-roles-card-dot"
                  style={{ backgroundColor: role.color, boxShadow: `0 0 16px ${role.color}88` }}
                  aria-hidden
                />
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[var(--admin-text-muted)]">Portal access</span>
                  <span className="font-medium text-[var(--admin-text)]">
                    {role.isStaff ? "Staff (admin)" : "Client only"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[var(--admin-text-muted)]">Type</span>
                  <span className="font-medium text-[var(--admin-text)]">
                    {role.isSystem ? "System" : "Custom"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[var(--admin-text-muted)]">Key</span>
                  <code className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-[var(--admin-gold-light)]">
                    {role.slug}
                  </code>
                </div>
              </div>

              {editable ? (
                <div className="mt-4 flex flex-wrap gap-2">
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

      <AdminModal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Role">
        <form onSubmit={handleCreate} className="space-y-4">
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
              onChange={(event) => setCreateForm({ ...createForm, isStaff: event.target.checked })}
            />
            <span>
              <strong className="block text-sm text-[var(--admin-text)]">Staff role</strong>
              <span className="text-xs text-[var(--admin-text-muted)]">
                Users with this role can access the admin portal.
              </span>
            </span>
          </label>
          <div className="flex justify-end gap-2 border-t border-[var(--admin-border-subtle)] pt-4">
            <Button type="button" variant="ghost" size="sm" className="admin-btn-ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="admin-btn-gold" disabled={creating}>
              {creating ? "Creating…" : "Create Role"}
            </Button>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        open={Boolean(editSlug && editForm)}
        onClose={() => {
          setEditSlug(null);
          setEditForm(null);
        }}
        title="Edit Role"
      >
        {editForm ? (
          <form onSubmit={handleSaveEdit} className="space-y-4">
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
                  onChange={(event) => setEditForm({ ...editForm, isStaff: event.target.checked })}
                />
                <span>
                  <strong className="block text-sm text-[var(--admin-text)]">Staff role</strong>
                  <span className="text-xs text-[var(--admin-text-muted)]">
                    Users with this role can access the admin portal.
                  </span>
                </span>
              </label>
            ) : null}
            <div className="flex justify-end gap-2 border-t border-[var(--admin-border-subtle)] pt-4">
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
              <Button type="submit" size="sm" className="admin-btn-gold" disabled={saving}>
                {saving ? "Saving…" : "Save Role"}
              </Button>
            </div>
          </form>
        ) : null}
      </AdminModal>
    </div>
  );
}
