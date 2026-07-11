import { NextResponse } from "next/server";
import { verifyCustomerPermissionApi } from "@/lib/auth";
import { getPortalNotifications } from "@/lib/portal/get-portal-notifications";

export async function GET() {
  const auth = await verifyCustomerPermissionApi("dashboard");
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const notifications = await getPortalNotifications(
    auth.user!.id,
    auth.user!.email ?? auth.profile!.email ?? "",
  );

  return NextResponse.json(notifications);
}
