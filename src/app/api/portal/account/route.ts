import { NextResponse } from "next/server";
import { verifyAuthApi } from "@/lib/auth";
import { resolvePortalClient } from "@/lib/portal/resolve-portal-client";

const PROFILE_FIELDS = "id, email, full_name, avatar_url, phone" as const;

export async function GET() {
  const auth = await verifyAuthApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data: profile, error } = await auth.supabase!
    .from("profiles")
    .select(PROFILE_FIELDS)
    .eq("id", auth.user!.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const resolved = await resolvePortalClient(
    auth.supabase!,
    auth.user!.id,
    auth.user!.email ?? auth.profile!.email,
  );

  const client = resolved
    ? { id: resolved.id, name: resolved.name, company: resolved.company }
    : null;

  return NextResponse.json({ profile, client });
}

export async function PATCH(request: Request) {
  const auth = await verifyAuthApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { full_name, phone, avatar_url, email, company } = body as {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
    email?: string;
    company?: string;
  };

  const profileUpdates: Record<string, string | null> = {};
  let emailConfirmationRequired = false;

  if (full_name !== undefined) profileUpdates.full_name = full_name.trim() || null;
  if (phone !== undefined) profileUpdates.phone = phone.trim() || null;
  if (avatar_url !== undefined) profileUpdates.avatar_url = avatar_url.trim() || null;

  if (email !== undefined) {
    const newEmail = email.trim().toLowerCase();
    if (!newEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const currentEmail = auth.user!.email?.trim().toLowerCase();
    if (newEmail !== currentEmail) {
      const { error: emailError } = await auth.supabase!.auth.updateUser({ email: newEmail });
      if (emailError) {
        return NextResponse.json({ error: emailError.message }, { status: 400 });
      }
      profileUpdates.email = newEmail;
      emailConfirmationRequired = true;
    }
  }

  if (Object.keys(profileUpdates).length === 0 && company === undefined) {
    return NextResponse.json({ error: "No changes provided" }, { status: 400 });
  }

  let profile = auth.profile;

  if (Object.keys(profileUpdates).length > 0) {
    const { data, error: updateError } = await auth.supabase!
      .from("profiles")
      .update(profileUpdates)
      .eq("id", auth.user!.id)
      .select(PROFILE_FIELDS)
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    profile = data;
  }

  if (company !== undefined) {
    const resolved = await resolvePortalClient(
      auth.supabase!,
      auth.user!.id,
      auth.user!.email ?? auth.profile!.email,
    );

    if (resolved) {
      await auth.supabase!
        .from("clients")
        .update({ company: company.trim() || null })
        .eq("id", resolved.id);
    }
  }

  return NextResponse.json({ profile, emailConfirmationRequired });
}
