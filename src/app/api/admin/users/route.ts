import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { fetchAdminUserById, fetchAdminUsers } from "@/lib/supabase/profile-queries";
import {
  canManageUsers,
  getOwnerEmail,
  isFounder,
  verifyAdminApi,
  verifyUserManagementApi,
} from "@/lib/auth";
import {
  canAssignRoles,
  getPrimaryRole,
  persistRoles,
  type UserRole,
} from "@/lib/roles";
import { fetchRoleCatalog } from "@/lib/roles/catalog-server";
import { getActiveRoleCatalog } from "@/lib/roles/catalog";

function normalizeRolesInput(
  roles: UserRole[] | undefined,
  role: UserRole | undefined,
  catalog: Awaited<ReturnType<typeof fetchRoleCatalog>>,
) {
  if (roles?.length) return persistRoles(roles, undefined, catalog);
  if (role !== undefined) return persistRoles([role], undefined, catalog);
  return persistRoles(["customer"], undefined, catalog);
}

export async function GET() {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data: currentProfile } = await auth.supabase!
    .from("profiles")
    .select("email, role, roles")
    .eq("id", auth.user!.id)
    .single();

  const assignerIsFounder = isFounder(
    currentProfile,
    currentProfile?.email,
    auth.user!.email,
  );

  const canManage = canManageUsers(
    currentProfile,
    currentProfile?.email,
    auth.user!.email,
  );

  const { data: users, error } = await fetchAdminUsers(auth.supabase!);
  const roleCatalog = getActiveRoleCatalog(await fetchRoleCatalog(auth.supabase!));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    users: users ?? [],
    canManageUsers: canManage,
    isFounder: assignerIsFounder,
    ownerEmail: getOwnerEmail(),
    roleCatalog,
  });
}

export async function POST(request: Request) {
  const auth = await verifyUserManagementApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const assignerIsFounder = isFounder(
    auth.profile!,
    auth.profile!.email,
    auth.user!.email,
  );

  const body = await request.json();
  const { email, password, full_name, role, roles } = body as {
    email?: string;
    password?: string;
    full_name?: string;
    role?: UserRole;
    roles?: UserRole[];
  };

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const roleCatalog = await fetchRoleCatalog(auth.supabase!);
  const assignedRoles = normalizeRolesInput(roles, role, roleCatalog);

  if (!canAssignRoles(assignedRoles, assignerIsFounder, roleCatalog)) {
    return NextResponse.json(
      { error: "Only the founder can assign the Founder role" },
      { status: 403 },
    );
  }

  const adminSupabase = await createAdminClient();
  const { data: created, error: createError } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: full_name ?? null },
  });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 500 });
  }

  if (created.user) {
    const { error: roleError } = await adminSupabase
      .from("profiles")
      .update({
        roles: assignedRoles,
        role: getPrimaryRole(assignedRoles),
        full_name: full_name ?? null,
      })
      .eq("id", created.user.id);

    if (roleError) {
      return NextResponse.json({ error: roleError.message }, { status: 500 });
    }
  }

  const { data: user, error: fetchError } = await fetchAdminUserById(
    adminSupabase,
    created.user!.id,
  );

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  return NextResponse.json({ user }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await verifyUserManagementApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const assignerIsFounder = isFounder(
    auth.profile!,
    auth.profile!.email,
    auth.user!.email,
  );

  const body = await request.json();
  const { id, role, roles, full_name, email, phone, avatar_url, company } = body as {
    id?: string;
    role?: UserRole;
    roles?: UserRole[];
    full_name?: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
    company?: string;
  };

  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const adminSupabase = await createAdminClient();

  const { data: target } = await adminSupabase
    .from("profiles")
    .select("email, role, roles")
    .eq("id", id)
    .single();

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const targetIsFounder = isFounder(target, target.email);

  const profileUpdates: Record<string, string | UserRole[] | null> = {};

  if (full_name !== undefined) {
    profileUpdates.full_name = full_name.trim() || null;
  }

  if (phone !== undefined) {
    profileUpdates.phone = phone.trim() || null;
  }

  if (avatar_url !== undefined) {
    profileUpdates.avatar_url = avatar_url.trim() || null;
  }

  if (company !== undefined) {
    profileUpdates.company = company.trim() || null;
  }

  if (roles !== undefined || role !== undefined) {
    if (targetIsFounder && !assignerIsFounder) {
      return NextResponse.json(
        { error: "Only the founder can change a Founder account role" },
        { status: 403 },
      );
    }

    const roleCatalog = await fetchRoleCatalog(auth.supabase!);
    const nextRoles = normalizeRolesInput(roles, role, roleCatalog);

    if (!canAssignRoles(nextRoles, assignerIsFounder, roleCatalog)) {
      return NextResponse.json(
        { error: "Only the founder can assign the Founder role" },
        { status: 403 },
      );
    }

    profileUpdates.roles = nextRoles;
    profileUpdates.role = getPrimaryRole(nextRoles);
  }

  let emailUpdated = false;

  if (email !== undefined) {
    const newEmail = email.trim().toLowerCase();
    if (!newEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const currentEmail = target.email.trim().toLowerCase();
    if (newEmail !== currentEmail) {
      const { error: emailError } = await adminSupabase.auth.admin.updateUserById(id, {
        email: newEmail,
        email_confirm: true,
      });

      if (emailError) {
        return NextResponse.json({ error: emailError.message }, { status: 400 });
      }

      profileUpdates.email = newEmail;
      emailUpdated = true;
    }
  }

  if (Object.keys(profileUpdates).length === 0) {
    return NextResponse.json({ error: "No changes provided" }, { status: 400 });
  }

  if (full_name !== undefined) {
    await adminSupabase.auth.admin.updateUserById(id, {
      user_metadata: { full_name: full_name.trim() || null },
    });
  }

  const { error: updateError } = await adminSupabase
    .from("profiles")
    .update(profileUpdates)
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { data: user, error } = await fetchAdminUserById(adminSupabase, id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user, emailUpdated });
}

export async function DELETE(request: Request) {
  const auth = await verifyUserManagementApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  if (id === auth.user!.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  const adminSupabase = await createAdminClient();

  const { data: target } = await adminSupabase
    .from("profiles")
    .select("email, role, roles")
    .eq("id", id)
    .single();

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (isFounder(target, target.email)) {
    return NextResponse.json({ error: "The founder account cannot be deleted" }, { status: 400 });
  }

  const { error } = await adminSupabase.auth.admin.deleteUser(id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
