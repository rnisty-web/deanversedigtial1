import { NextResponse } from "next/server";
import { isFounder, verifyOwnerApi, verifyUserManagementApi } from "@/lib/auth";
import {
  countUsersWithRole,
  createCustomRoleDefinition,
  fetchRoleCatalog,
  revalidateRoleCatalog,
  saveRoleCatalog,
} from "@/lib/roles/catalog-server";
import {
  getActiveRoleCatalog,
  normalizeHexColor,
  validateNewRoleInput,
  type RoleDefinition,
} from "@/lib/roles/catalog";

export async function GET() {
  const auth = await verifyUserManagementApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const catalog = await fetchRoleCatalog(auth.supabase!);
  return NextResponse.json({ catalog: getActiveRoleCatalog(catalog) });
}

export async function POST(request: Request) {
  const auth = await verifyUserManagementApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const label = String(body.label ?? "").trim();
  const color = normalizeHexColor(String(body.color ?? "#c9a962"));
  const isStaff = Boolean(body.isStaff);

  const catalog = await fetchRoleCatalog(auth.supabase!);
  const validationError = validateNewRoleInput({ label, color, isStaff, catalog });
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const created = await createCustomRoleDefinition({ label, color, isStaff, catalog });
  if (created.error || !created.role) {
    return NextResponse.json(
      { error: created.error ?? "Failed to create role. Run supabase/role-catalog.sql if enum extension is missing." },
      { status: 500 },
    );
  }

  const saveResult = await saveRoleCatalog(auth.supabase!, created.catalog!);
  if (saveResult.error) {
    return NextResponse.json({ error: saveResult.error }, { status: 500 });
  }

  revalidateRoleCatalog();
  return NextResponse.json({ role: created.role, catalog: getActiveRoleCatalog(created.catalog!) }, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await verifyUserManagementApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const assignerIsFounder = isFounder(auth.profile!, auth.profile!.email, auth.user!.email);
  const body = await request.json();
  const slug = String(body.slug ?? "").trim();
  const label = body.label !== undefined ? String(body.label).trim() : undefined;
  const color = body.color !== undefined ? normalizeHexColor(String(body.color)) : undefined;
  const isStaff = body.isStaff !== undefined ? Boolean(body.isStaff) : undefined;

  if (!slug) {
    return NextResponse.json({ error: "Role slug is required" }, { status: 400 });
  }

  const catalog = await fetchRoleCatalog(auth.supabase!);
  const index = catalog.findIndex((role) => role.slug === slug);
  if (index === -1) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  const current = catalog[index];
  if (current.founderOnly && !assignerIsFounder) {
    return NextResponse.json({ error: "Only the founder can edit the Founder role" }, { status: 403 });
  }

  const next: RoleDefinition = {
    ...current,
    label: label && label.length >= 2 ? label : current.label,
    color: color ?? current.color,
    isStaff: isStaff ?? current.isStaff,
  };

  if (next.isSystem && next.slug === "admin" && isStaff === false) {
    return NextResponse.json({ error: "The Founder role must remain a staff role" }, { status: 400 });
  }

  const updated = [...catalog];
  updated[index] = next;

  const saveResult = await saveRoleCatalog(auth.supabase!, updated);
  if (saveResult.error) {
    return NextResponse.json({ error: saveResult.error }, { status: 500 });
  }

  revalidateRoleCatalog();
  return NextResponse.json({ role: next, catalog: getActiveRoleCatalog(updated) });
}

export async function DELETE(request: Request) {
  const auth = await verifyOwnerApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "Role slug is required" }, { status: 400 });
  }

  const catalog = await fetchRoleCatalog(auth.supabase!);
  const role = catalog.find((item) => item.slug === slug);
  if (!role) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  if (role.isSystem) {
    return NextResponse.json({ error: "System roles cannot be deleted" }, { status: 400 });
  }

  const usage = await countUsersWithRole(auth.supabase!, slug);
  if (usage > 0) {
    return NextResponse.json(
      { error: `This role is assigned to ${usage} user(s). Reassign them before deleting.` },
      { status: 400 },
    );
  }

  const updated = catalog.map((item) =>
    item.slug === slug ? { ...item, archived: true } : item,
  );

  const saveResult = await saveRoleCatalog(auth.supabase!, updated);
  if (saveResult.error) {
    return NextResponse.json({ error: saveResult.error }, { status: 500 });
  }

  revalidateRoleCatalog();
  return NextResponse.json({ success: true, catalog: getActiveRoleCatalog(updated) });
}
