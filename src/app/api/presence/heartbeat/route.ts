import { NextResponse } from "next/server";
import { verifyAuthApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { updateProfileLastSeen } from "@/lib/supabase/profile-queries";

export async function POST() {
  const auth = await verifyAuthApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const adminSupabase = await createAdminClient();
  const { ok, last_seen_at, presenceReady, error } = await updateProfileLastSeen(
    adminSupabase,
    auth.user!.id,
  );

  if (!ok && error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    last_seen_at,
    presenceReady,
  });
}
