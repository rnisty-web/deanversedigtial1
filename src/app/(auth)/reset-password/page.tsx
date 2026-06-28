"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Your reset link has expired. Request a new one.");
      }
      setReady(true);
    }

    checkSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.updateUser({ password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (!ready) {
    return <p className="text-sm text-white/50">Verifying reset link…</p>;
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mb-4 text-4xl">✓</div>
        <h1 className="mb-2 text-xl font-semibold text-white">Password updated!</h1>
        <p className="text-sm text-white/60">Redirecting to sign in…</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-2 text-2xl font-semibold text-white">Set new password</h1>
      <p className="mb-6 text-sm text-white/60">Choose a strong password for your account</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
            {error.includes("expired") && (
              <Link href="/forgot-password" className="mt-2 block text-[#a3c9a8] hover:underline">
                Request a new reset link
              </Link>
            )}
          </div>
        )}

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm text-white/70">
            New password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!!error?.includes("expired")}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-[#6f8f72] focus:outline-none focus:ring-1 focus:ring-[#6f8f72]"
            placeholder="Min. 8 characters"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm text-white/70">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={!!error?.includes("expired")}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-[#6f8f72] focus:outline-none focus:ring-1 focus:ring-[#6f8f72]"
            placeholder="••••••••"
          />
        </div>

        <Button type="submit" disabled={loading || !!error?.includes("expired")} className="w-full">
          {loading ? "Updating…" : "Update password"}
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
