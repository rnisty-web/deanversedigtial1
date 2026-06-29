"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminAlert } from "@/components/admin/AdminAlert";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminField } from "@/components/admin/AdminField";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminPageContent } from "@/components/admin/AdminPageContent";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { MediaPicker } from "@/components/admin/MediaPicker";
import {
  UsersAdminHeader,
  UsersStatCard,
} from "@/components/admin/users/UsersAdminHeader";
import { UsersDetailPanel } from "@/components/admin/users/UsersDetailPanel";
import { UsersDirectory } from "@/components/admin/users/UsersDirectory";
import { UsersSidebar } from "@/components/admin/users/UsersSidebar";
import { Button } from "@/components/ui/Button";
import { RoleBadges } from "@/components/ui/RoleBadges";
import { RoleMultiSelect } from "@/components/ui/RoleMultiSelect";
import { formatRolesLabel, toAssignableRoles, type UserRole } from "@/lib/roles";
import {
  canEditUserRole,
  computeUserStats,
  defaultFounderEmail,
  filterUsers,
  sortUsers,
  type UserFilterTab,
  type UserRecord,
} from "@/lib/users/utils";

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

const statIcons = {
  total: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  live: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.008H12V12z" />
    </svg>
  ),
  staff: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  ),
  clients: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.375M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  ),
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
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

  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<UserFilterTab>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const displayFounderEmail = defaultFounderEmail(ownerEmail);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/users", { credentials: "same-origin" });
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

  function openEdit(user: UserRecord) {
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
      credentials: "same-origin",
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

    const res = await fetch(`/api/admin/users?id=${deleteTarget.id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });

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

  async function updateUserRoles(user: UserRecord, roles: UserRole[]) {
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

    showFeedback(`${user.full_name ?? user.email} roles updated to ${formatRolesLabel(roles)}`);
    fetchUsers();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
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

  const sortedUsers = useMemo(
    () => sortUsers(users, displayFounderEmail),
    [users, displayFounderEmail],
  );

  const stats = useMemo(() => computeUserStats(users), [users]);

  const filteredUsers = useMemo(
    () => filterUsers(sortedUsers, search, tab),
    [sortedUsers, search, tab],
  );

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

  function handleSelect(id: string) {
    setSelectedId(id);
    setMobileDetailOpen(true);
  }

  const tabCounts = {
    all: sortedUsers.length,
    staff: stats.staffCount,
    clients: stats.clientCount,
    online: stats.onlineCount + stats.awayCount,
  };

  return (
    <div className="admin-users-page">
      <UsersAdminHeader
        search={search}
        onSearchChange={setSearch}
        tab={tab}
        onTabChange={setTab}
        counts={tabCounts}
        canManage={canManageUsers}
        onInviteUser={() => setShowCreateForm(true)}
      />

      <AdminPageContent className="admin-users-content">
        {error ? (
          <AdminAlert tone="error" className="mb-6">
            {error}
          </AdminAlert>
        ) : null}

        {message ? (
          <AdminAlert tone={messageTone} className="mb-6">
            {message}
          </AdminAlert>
        ) : null}

        {!loading && !canManageUsers ? (
          <AdminAlert tone="info" className="mb-6">
            You need a staff account to manage users. Ask the founder to set your profile role, or
            log in as {displayFounderEmail}.
          </AdminAlert>
        ) : null}

        {!loading && users.length > 0 ? (
          <div className="admin-users-stats">
            <UsersStatCard label="Total accounts" value={stats.total} icon={statIcons.total} />
            <UsersStatCard
              label="Live now"
              value={stats.onlineCount}
              hint={stats.awayCount > 0 ? `${stats.awayCount} away` : "Active sessions"}
              icon={statIcons.live}
            />
            <UsersStatCard label="Staff & team" value={stats.staffCount} icon={statIcons.staff} />
            <UsersStatCard label="Client accounts" value={stats.clientCount} icon={statIcons.clients} />
          </div>
        ) : null}

        {loading ? (
          <AdminTableSkeleton />
        ) : users.length === 0 ? (
          <AdminEmptyState
            title="No users yet"
            description="Create the first account to start managing roles, presence, and portal access."
            actionLabel={canManageUsers ? "Invite user" : undefined}
            onAction={canManageUsers ? () => setShowCreateForm(true) : undefined}
          />
        ) : filteredUsers.length === 0 ? (
          <AdminEmptyState
            title="No matches"
            description="Try a different name, email, company, role, or filter tab."
          />
        ) : (
          <div className="admin-users-layout">
            <UsersDirectory
              users={filteredUsers}
              selectedId={selectedUser?.id ?? null}
              founderEmail={displayFounderEmail}
              onSelect={handleSelect}
              hidden={mobileDetailOpen}
            />
            <UsersDetailPanel
              user={selectedUser}
              founderEmail={displayFounderEmail}
              canManageUsers={canManageUsers}
              viewerIsFounder={viewerIsFounder}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onRoleChange={updateUserRoles}
              onBack={() => setMobileDetailOpen(false)}
              hidden={!mobileDetailOpen}
            />
            <UsersSidebar
              users={users}
              canManageUsers={canManageUsers}
              onInviteUser={() => setShowCreateForm(true)}
            />
          </div>
        )}
      </AdminPageContent>

      <AdminModal open={showCreateForm} onClose={() => setShowCreateForm(false)} title="Invite User">
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
            <Button
              variant="ghost"
              size="sm"
              className="admin-btn-ghost"
              type="button"
              onClick={() => setShowCreateForm(false)}
            >
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
        {editForm && editUser ? (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            {editError ? <AdminAlert tone="error">{editError}</AdminAlert> : null}

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
        ) : null}
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
        {deleteTarget ? (
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
        ) : null}
      </AdminModal>
    </div>
  );
}
