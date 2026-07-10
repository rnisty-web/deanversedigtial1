import { NextResponse } from "next/server";
import { verifyCustomerApi } from "@/lib/auth";
import {
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
} from "@/lib/rate-limit";

const PASSWORD_LIMIT = 5;
const PASSWORD_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = await checkRateLimit(`portal-password:${ip}`, PASSWORD_LIMIT, PASSWORD_WINDOW_MS);
  if (!limit.success) {
    return rateLimitResponse(limit.resetAt);
  }

  const auth = await verifyCustomerApi();  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { password, newPassword } = body as { password?: string; newPassword?: string };

  if (!password || !newPassword) {
    return NextResponse.json(
      { error: "Current and new password are required" },
      { status: 400 },
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters" },
      { status: 400 },
    );
  }

  const email = auth.user!.email;
  if (!email) {
    return NextResponse.json({ error: "No email on account" }, { status: 400 });
  }

  const { error: signInError } = await auth.supabase!.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  const { error } = await auth.supabase!.auth.updateUser({ password: newPassword });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
