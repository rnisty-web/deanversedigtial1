import { NextResponse } from "next/server";
import { verifyAuthApi } from "@/lib/auth";

export async function POST(request: Request) {
  const auth = await verifyAuthApi();
  if (auth.error) {
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
