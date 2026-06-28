import { NextResponse } from "next/server";
import { isFounder, verifyAdminApi, verifyOwnerApi } from "@/lib/auth";
import {
  ACTIVITY_STATUSES,
  DEFAULT_ACTIVITY_STATUS,
  normalizeActivityStatus,
} from "@/lib/activity-status";
import { createAdminClient } from "@/lib/supabase/server";
import {
  fetchCurrentProfilePresenceFields,
  updateProfileActivityStatus,
} from "@/lib/supabase/profile-queries";

export async function GET() {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data: profile, presenceReady } = await fetchCurrentProfilePresenceFields(
    auth.supabase!,
    auth.user!.id,
  );

  const founder = isFounder(profile, profile?.email, auth.user!.email);

  return NextResponse.json({
    activityStatus: normalizeActivityStatus(profile?.activity_status),
    canEdit: founder,
    activityStatusReady: presenceReady,
    options: ACTIVITY_STATUSES,
  });
}

export async function PATCH(request: Request) {
  const auth = await verifyOwnerApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { activity_status } = body as { activity_status?: string };

  if (!activity_status) {
    return NextResponse.json({ error: "activity_status is required" }, { status: 400 });
  }

  const normalized = normalizeActivityStatus(activity_status);
  if (!ACTIVITY_STATUSES.includes(normalized)) {
    return NextResponse.json({ error: "Invalid activity status" }, { status: 400 });
  }

  const adminSupabase = await createAdminClient();
  const { ok, activity_status: updated, activityStatusReady, error } =
    await updateProfileActivityStatus(adminSupabase, auth.user!.id, normalized);

  if (!activityStatusReady) {
    return NextResponse.json(
      {
        error:
          "Activity status is not set up yet. Run supabase/roles-and-presence-step1-enums.sql then roles-and-presence-step2.sql in the Supabase SQL Editor.",
      },
      { status: 503 },
    );
  }

  if (!ok && error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    activityStatus: updated ?? DEFAULT_ACTIVITY_STATUS,
  });
}
