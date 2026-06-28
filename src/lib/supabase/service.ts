import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

export function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export async function ensureUserProfile(user: User) {
  const admin = createServiceRoleClient();

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return;

  const meta = user.user_metadata ?? {};
  const fullName =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    (user.email ? user.email.split("@")[0] : "User");

  await admin.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? "",
      full_name: fullName,
      role: "customer",
    },
    { onConflict: "id" },
  );
}
