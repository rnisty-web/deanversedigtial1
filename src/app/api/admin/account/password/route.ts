import { NextResponse } from "next/server";
import { verifyAdminApi } from "@/lib/auth";

export async function POST(request: Request) {
  const auth = await verifyAdminApi();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const { current_password, new_password } = body as {
    current_password?: string;
    new_password?: string;
  };

  if (!current_password || !new_password) {
    return NextResponse.json(
      { error: "Current password and new password are required" },
      { status: 400 },
    );
  }

  if (new_password.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters" },
      { status: 400 },
    );
  }

  const userEmail = auth.user!.email;
  if (!userEmail) {
    return NextResponse.json({ error: "Account email not found" }, { status: 400 });
  }

  const { error: signInError } = await auth.supabase!.auth.signInWithPassword({
    email: userEmail,
    password: current_password,
  });

  if (signInError) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 401 },
    );
  }

  const { error: updateError } = await auth.supabase!.auth.updateUser({
    password: new_password,
  });

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Password updated successfully" });
}
