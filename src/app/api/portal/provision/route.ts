import { NextResponse } from "next/server";
import { verifyCustomerApi } from "@/lib/auth";
import { isStaffRole } from "@/lib/roles";
import { getRoleCatalogSafe } from "@/lib/roles/catalog-server";
import { ensurePortalClient } from "@/lib/portal/provision-portal-client";

export async function POST() {
  const auth = await verifyCustomerApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const catalog = await getRoleCatalogSafe();
  if (isStaffRole(auth.profile!, catalog)) {
    return NextResponse.json({ ok: true, provisioned: false });
  }

  const client = await ensurePortalClient({
    userId: auth.user!.id,
    email: auth.profile!.email,
    fullName: auth.profile!.full_name,
    phone: auth.profile!.phone,
    company: auth.profile!.company,
  });

  if (!client) {
    return NextResponse.json(
      { error: "Could not set up your client workspace. Please contact support." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, provisioned: true, clientId: client.id });
}
