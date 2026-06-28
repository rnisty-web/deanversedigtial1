"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/auth-redirect";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthCallbackUrl("/reset-password"),
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mb-4 text-4xl">📧</div>
        <h1 className="mb-2 text-xl font-semibold text-white">Check your email</h1>
        <p className="mb-6 text-sm text-white/60">
          We sent a password reset link to <strong className="text-white">{email}</strong>
        </p>
        <Link href="/login" className="text-sm text-[#a3c9a8] hover:text-[#6f8f72]">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-2 text-2xl font-semibold text-white">Reset password</h1>
      <p className="mb-6 text-sm text-white/60">
        Enter your email and we&apos;ll send you a reset link
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm text-white/70">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-[#6f8f72] focus:outline-none focus:ring-1 focus:ring-[#6f8f72]"
            placeholder="you@example.com"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/50">
        <Link href="/login" className="text-[#a3c9a8] hover:text-[#6f8f72]">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
