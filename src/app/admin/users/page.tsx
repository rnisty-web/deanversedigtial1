"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminField } from "@/components/admin/AdminField";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import { AdminSearchInput, AdminToolbar } from "@/components/admin/AdminToolbar";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { PresenceIndicator, PresenceLegend } from "@/components/admin/PresenceIndicator";
import { ActivityStatusBadge } from "@/components/admin/ActivityStatusPicker";
import { Button } from "@/components/ui/Button";
import { RoleBadges } from "@/components/ui/RoleBadges";
import { RoleMultiSelect } from "@/components/ui/RoleMultiSelect";
import { siteConfig } from "@/lib/constants";
import {
  formatRolesLabel,
  isFounderRole,
  isStaffRole,
  toAssignableRoles,
  type UserRole,
} from "@/lib/roles";
import { getPresenceStatus } from "@/lib/presence";
import { cn } from "@/lib/utils";

type User = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  roles: UserRole[];
  company: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  last_seen_at: string | null;
  activity_status: string | null;
};

type CreateForm = {
  email: string;
  password: string;
  full_name: string;
  roles: UserRole[];
};

type EditForm = {
  full_name: string;
  email: string;
  phone: string;
  company: string;
  avatar_url: string;
  roles: UserRole[];
};

const emptyCreateForm: CreateForm = {
  email: "",
  password: "",
  full_name: "",
  roles: ["customer"],
};

function isProtectedFounderAccount(user: User, founderEmail: string): boolean {
  return (
    isFounderRole(user) ||
    user.email.trim().toLowerCase() === founderEmail.trim().toLowerCase()
  );
}

function canEditUserRole(
  user: User,
  founderEmail: string,
  viewerIsFounder: boolean,
): boolean {
  if (!isProtectedFounderAccount(user, founderEmail)) return true;
  return viewerIsFounder;
}

function UserAvatar({ user, className }: { user: User; className?: string }) {
  const initial = (user.full_name ?? user.email).charAt(0).toUpperCase();

  if (user.avatar_url) {
    return (
      <Image
        src={user.avatar_url}
        alt=""
        width={44}
        height={44}
        className={cn("rounded-full object-cover ring-2 ring-white/10", className)}
        unoptimized
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)]/30 to-[var(--accent)]/10 text-sm font-semibold text-[var(--admin-gold-light)] ring-2 ring-white/10",
        className ?? "h-11 w-11",
      )}
    >
      {initial}
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [canManageUsers, setCanManageUsers] = useState(false);
  const [viewerIsFounder, setViewerIsFounder] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "error" | "info">("success");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [creating, setCreating] = useState(false);

  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const displayFounderEmail = ownerEmail || siteConfig.email;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/users");
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to load users");
      setLoading(false);
      return;
    }

    const data = await res.json();
    setUsers(data.users ?? []);
    setCanManageUsers(Boolean(data.canManageUsers));
    setViewerIsFounder(Boolean(data.isFounder));
    setOwnerEmail(data.ownerEmail ?? "");
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 60_000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  function showFeedback(text: string, tone: "success" | "error" | "info" = "success") {
    setMessage(text);
    setMessageTone(tone);
  }

  function openEdit(user: User) {
    setEditUser(user);
    setEditForm({
      full_name: user.full_name ?? "",
      email: user.email,
      phone: user.phone ?? "",
      company: user.company ?? "",
      avatar_url: user.avatar_url ?? "",
      roles: toAssignableRoles(user),
    });
    setEditError(null);
  }

  function closeEdit() {
    setEditUser(null);
    setEditForm(null);
    setEditError(null);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser || !editForm) return;

    setSavingEdit(true);
    setEditError(null);

    const payload: Record<string, unknown> = {
      id: editUser.id,
      full_name: editForm.full_name,
      email: editForm.email,
      phone: editForm.phone,
      company: editForm.company,
      avatar_url: editForm.avatar_url,
    };

    if (canEditUserRole(editUser, displayFounderEmail, viewerIsFounder)) {
      payload.roles = editForm.roles;
    }

    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSavingEdit(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setEditError(data.error ?? "Failed to update user");
      return;
    }

    const data = await res.json();
    closeEdit();
    showFeedback(
      data.emailUpdated
        ? `${editForm.full_name || editForm.email} updated. Email change applied immediately.`
        : `${editForm.full_name || editForm.email} updated successfully`,
      "success",
    );
    fetchUsers();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setDeleting(true);

    const res = await fetch(`/api/admin/users?id=${deleteTarget.id}`, { method: "DELETE" });

    setDeleting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setDeleteTarget(null);
      showFeedback(data.error ?? "Failed to remove user", "error");
      return;
    }

    const email = deleteTarget.email;
    setDeleteTarget(null);
    showFeedback(`${email} was removed`, "success");
    fetchUsers();
  }

  async function updateUserRoles(user: User, roles: UserRole[]) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id: user.id, roles }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showFeedback(data.error ?? "Failed to update roles", "error");
      fetchUsers();
      return;
    }

    showFeedback(
      `${user.full_name ?? user.email} roles updated to ${formatRolesLabel(roles)}`,
    );
    fetchUsers();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });

    setCreating(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      showFeedback(data.error ?? "Failed to create user", "error");
      return;
    }

    setShowCreateForm(false);
    setCreateForm(emptyCreateForm);
    showFeedback("User created successfully");
    fetchUsers();
  }

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const aFounder = isProtectedFounderAccount(a, displayFounderEmail);
      const bFounder = isProtectedFounderAccount(b, displayFounderEmail);
      if (aFounder && !bFounder) return -1;
      if (!aFounder && bFounder) return 1;
      return 0;
    });
  }, [users, displayFounderEmail]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedUsers;
    return sortedUsers.filter((user) =>
      [user.full_name, user.email, user.company, user.phone, formatRolesLabel(user.roles ?? user.role)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [sortedUsers, search]);

  const selectedUser =
    filteredUsers.find((user) => user.id === selectedId) ?? filteredUsers[0] ?? null;

  useEffect(() => {
    if (filteredUsers.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filteredUsers.some((user) => user.id === selectedId)) {
      setSelectedId(filteredUsers[0].id);
    }
  }, [filteredUsers, selectedId]);

  const onlineCount = users.filter((u) => getPresenceStatus(u.last_seen_at) === "online").length;
  const awayCount = users.filter((u) => getPresenceStatus(u.last_seen_at) === "away").length;
  const staffCount = users.filter((u) => isStaffRole(u.roles ?? u.role)).length;

  return (
    <>
      <AdminHeader title="Users" subtitle="Manage accounts, roles, and live status" />

      <AdminPageContent>
        {error && (
          <div className="mb-4">
            <AdminAlert tone="error">{error}</AdminAlert>
          </div>
        )}

        {message && (
          <div className="mb-4">
            <AdminAlert tone={messageTone}>{message}</AdminAlert>
          </div>
        )}

        {!loading && !canManageUsers && (
          <div className="mb-4">
            <AdminAlert tone="info">
              You need a staff account to manage users. Ask the founder to set your profile role,
              or log in as {displayFounderEmail}.
            </AdminAlert>
          </div>
        )}

        {!loading && users.length > 0 && (
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <div className="admin-luxury-card rounded-2xl border border-[var(--admin-border-subtle)] px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-text-muted)]">
                Total accounts
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--admin-text)]">{users.length}</p>
            </div>
            <div className="admin-luxury-card rounded-2xl border border-[var(--admin-border-subtle)] px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-text-muted)]">
                Live now
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--admin-text)]">
                {onlineCount}
                {awayCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-[var(--admin-text-muted)]">· {awayCount} away</span>
                )}
              </p>
            </div>
            <div className="admin-luxury-card rounded-2xl border border-[var(--admin-border-subtle)] px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-text-muted)]">
                Staff & team
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--admin-text)]">{staffCount}</p>
            </div>
          </div>
        )}

        <AdminToolbar>
          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, company, or role…"
          />
          {canManageUsers && (
            <Button size="sm" className="admin-btn-gold" onClick={() => setShowCreateForm(true)}>
              + Add user
            </Button>
          )}
        </AdminToolbar>

        {loading ? (
          <AdminTableSkeleton />
        ) : users.length === 0 ? (
          <AdminEmptyState
            title="No users yet"
            description="Create the first account to start managing roles, presence, and portal access."
            actionLabel={canManageUsers ? "Add user" : undefined}
            onAction={canManageUsers ? () => setShowCreateForm(true) : undefined}
          />
        ) : filteredUsers.length === 0 ? (
          <AdminEmptyState
            title="No matches"
            description="Try a different name, email, company, or role."
            className="py-12"
          />
        ) : (
          <div className="grid gap-6 xl:grid-cols-5">
            <div className="admin-luxury-card overflow-hidden rounded-3xl xl:col-span-2">
              <div className="border-b border-[var(--admin-border-subtle)] px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-text-muted)]">
                    Directory
                  </p>
                  <PresenceLegend />
                </div>
              </div>
              <ul className="max-h-[min(70vh,640px)] divide-y divide-white/[0.06] overflow-y-auto">
                {filteredUsers.map((user) => {
                  const isFounder = isProtectedFounderAccount(user, displayFounderEmail);
                  const isSelected = selectedUser?.id === user.id;

                  return (
                    <li key={user.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(user.id)}
                        className={cn(
                          "flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--admin-panel-hover)]",
                          isSelected &&
                            "bg-[color-mix(in_srgb,var(--primary)_12%,transparent)]",
                          isFounder && !isSelected && "bg-rose-500/[0.03]",
                        )}
                      >
                        <div className="relative shrink-0">
                          <UserAvatar user={user} className="h-10 w-10" />
                          <span className="absolute -bottom-0.5 -right-0.5">
                            <PresenceIndicator
                              lastSeenAt={user.last_seen_at}
                              size="sm"
                              prominent={isFounder}
                            />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium text-[var(--admin-text)]">
                              {user.full_name ?? "Unnamed user"}
                            </p>
                            {isFounder && (
                              <span className="shrink-0 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-200/90">
                                Founder
                              </span>
                            )}
                          </div>
                          <p className="truncate text-xs text-[var(--admin-text-muted)]">{user.email}</p>
                          <div className="mt-2">
                            <RoleBadges roles={user.roles ?? user.role} size="sm" />
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="admin-luxury-card rounded-3xl p-6 xl:col-span-3">
              {selectedUser ? (
                (() => {
                  const isFounder = isProtectedFounderAccount(selectedUser, displayFounderEmail);
                  const roleEditable =
                    canManageUsers &&
                    canEditUserRole(selectedUser, displayFounderEmail, viewerIsFounder);

                  return (
                    <div className="space-y-6">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                          <UserAvatar user={selectedUser} className="h-16 w-16 text-lg" />
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--admin-gold-light)]">
                              Selected user
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--admin-text)]">
                              {selectedUser.full_name ?? "Unnamed user"}
                            </h2>
                            <p className="mt-1 text-sm text-[var(--admin-text-muted)]">{selectedUser.email}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              <PresenceIndicator
                                lastSeenAt={selectedUser.last_seen_at}
                                showLabel
                                showLastSeen
                                size={isFounder ? "lg" : "md"}
                                prominent={isFounder}
                              />
                              <ActivityStatusBadge
                                status={selectedUser.activity_status ?? "Available"}
                              />
                            </div>
                          </div>
                        </div>
                        {canManageUsers && (
                          <div className="flex shrink-0 flex-wrap gap-2">
                            <Button size="sm" variant="secondary" className="admin-btn-ghost" onClick={() => openEdit(selectedUser)}>
                              Edit profile
                            </Button>
                            {!isFounder && (
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => setDeleteTarget(selectedUser)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] p-4">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-text-muted)]">
                            Company
                          </p>
                          <p className="mt-2 text-sm text-[var(--admin-text)]">
                            {selectedUser.company ?? "Not provided"}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] p-4">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-text-muted)]">
                            Phone
                          </p>
                          <p className="mt-2 text-sm text-[var(--admin-text)]">
                            {selectedUser.phone ?? "Not provided"}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] p-4">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-text-muted)]">
                            Joined
                          </p>
                          <p className="mt-2 text-sm text-[var(--admin-text)]">
                            {new Date(selectedUser.created_at).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] p-4">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-text-muted)]">
                            Portal access
                          </p>
                          <p className="mt-2 text-sm text-[var(--admin-text)]">
                            {isStaffRole(selectedUser.roles ?? selectedUser.role)
                              ? "Admin + client portals"
                              : "Client portal only"}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-text-muted)]">
                              Roles
                            </p>
                            <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
                              {roleEditable
                                ? "Toggle roles below. At least one role is required."
                                : isFounder
                                  ? "Founder role is protected."
                                  : "You cannot edit this account's roles."}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4">
                          {roleEditable ? (
                            <RoleMultiSelect
                              value={selectedUser.roles ?? selectedUser.role}
                              onChange={(roles) => updateUserRoles(selectedUser, roles)}
                              assignerIsFounder={viewerIsFounder}
                            />
                          ) : (
                            <RoleBadges roles={selectedUser.roles ?? selectedUser.role} size="md" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <AdminEmptyState
                  title="Select a user"
                  description="Choose someone from the directory to review profile details, roles, and live status."
                  className="border-none bg-transparent py-8"
                />
              )}
            </div>
          </div>
        )}

        <AdminModal
          open={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          title="Add User"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <AdminField
              label="Full name"
              value={createForm.full_name}
              onChange={(v) => setCreateForm({ ...createForm, full_name: v })}
            />
            <AdminField
              label="Email"
              type="email"
              value={createForm.email}
              onChange={(v) => setCreateForm({ ...createForm, email: v })}
            />
            <AdminField
              label="Temporary password"
              type="password"
              value={createForm.password}
              onChange={(v) => setCreateForm({ ...createForm, password: v })}
              hint="At least 8 characters. Share this securely with the user."
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">Roles</label>
              <RoleMultiSelect
                value={createForm.roles}
                onChange={(roles) => setCreateForm({ ...createForm, roles })}
                assignerIsFounder={viewerIsFounder}
              />
              <p className="mt-1.5 text-xs text-[var(--admin-text-muted)]">
                Select one or more roles. Users with any staff role can access the admin portal.
              </p>
            </div>
            <div className="flex justify-end gap-2 border-t border-[var(--admin-border-subtle)] pt-4">
              <Button variant="ghost" size="sm" className="admin-btn-ghost" type="button" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button size="sm" className="admin-btn-gold" type="submit" disabled={creating}>
                {creating ? "Creating…" : "Create User"}
              </Button>
            </div>
          </form>
        </AdminModal>

        <AdminModal
          open={Boolean(editUser && editForm)}
          onClose={closeEdit}
          title={editUser ? `Edit — ${editUser.full_name ?? editUser.email}` : "Edit User"}
          size="lg"
        >
          {editForm && editUser && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              {editError && <AdminAlert tone="error">{editError}</AdminAlert>}

              <AdminField
                label="Full name"
                value={editForm.full_name}
                onChange={(v) => setEditForm({ ...editForm, full_name: v })}
              />
              <AdminField
                label="Email"
                type="email"
                value={editForm.email}
                onChange={(v) => setEditForm({ ...editForm, email: v })}
              />
              <AdminField
                label="Phone number"
                type="tel"
                value={editForm.phone}
                onChange={(v) => setEditForm({ ...editForm, phone: v })}
                placeholder="+1 (555) 000-0000"
              />
              <AdminField
                label="Company"
                value={editForm.company}
                onChange={(v) => setEditForm({ ...editForm, company: v })}
              />
              <MediaPicker
                label="Avatar"
                value={editForm.avatar_url}
                onChange={(v) => setEditForm({ ...editForm, avatar_url: v })}
                hint="Paste a URL or upload an image from the media library."
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">Roles</label>
                {canEditUserRole(editUser, displayFounderEmail, viewerIsFounder) ? (
                  <>
                    <RoleMultiSelect
                      value={editForm.roles}
                      onChange={(roles) => setEditForm({ ...editForm, roles })}
                      assignerIsFounder={viewerIsFounder}
                    />
                    <p className="mt-1.5 text-xs text-[var(--admin-text-muted)]">
                      Toggle roles on or off. At least one role is required.
                    </p>
                  </>
                ) : (
                  <>
                    <RoleBadges roles={editUser.roles ?? editUser.role} size="md" />
                    <p className="mt-1.5 text-xs text-[var(--admin-text-muted)]">
                      Only the founder can change Founder role assignments.
                    </p>
                  </>
                )}
              </div>
              <div className="flex justify-end gap-2 border-t border-[var(--admin-border-subtle)] pt-4">
                <Button variant="ghost" size="sm" className="admin-btn-ghost" type="button" onClick={closeEdit}>
                  Cancel
                </Button>
                <Button size="sm" className="admin-btn-gold" type="submit" disabled={savingEdit}>
                  {savingEdit ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </AdminModal>

        <AdminModal
          open={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Remove User"
          size="sm"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" className="admin-btn-ghost" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Removing…" : "Remove User"}
              </Button>
            </div>
          }
        >
          {deleteTarget && (
            <div className="space-y-3">
              <p className="text-sm text-[var(--admin-text)]">
                Permanently remove{" "}
                <span className="font-medium text-[var(--admin-text)]">
                  {deleteTarget.full_name ?? deleteTarget.email}
                </span>{" "}
                ({deleteTarget.email})?
              </p>
              <p className="text-sm text-[var(--admin-text-muted)]">
                This deletes their login and profile. This action cannot be undone.
              </p>
            </div>
          )}
        </AdminModal>
      </AdminPageContent>
    </>
  );
}
