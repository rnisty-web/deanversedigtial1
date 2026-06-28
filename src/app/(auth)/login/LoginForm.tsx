"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { isStaffRole } from "@/lib/roles";
import { Button } from "@/components/ui/Button";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirectPath(searchParams.get("redirectTo"), "/portal");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(() => {
    if (searchParams.get("error") === "auth_callback") {
      return (
        searchParams.get("message") ??
        "Email verification could not be completed. Please try signing in again."
      );
    }
    return null;
  });
  const [notice, setNotice] = useState<string | null>(() =>
    searchParams.get("registered") === "1"
      ? "Account created. Check your email to confirm, then sign in below."
      : null,
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let supabase;
    try {
      supabase = createClient();
    } catch (configError) {
      setError(configError instanceof Error ? configError.message : "Supabase is not configured.");
      setLoading(false);
      return;
    }

    let authError;
    try {
      ({ error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      }));
    } catch {
      setError(
        "Could not reach Supabase. Check that your project is active (not paused), your internet connection is working, and nothing is blocking requests to supabase.co — then try again.",
      );
      setLoading(false);
      return;
    }

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let destination = redirectTo;
    if (!searchParams.get("redirectTo") && user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, roles")
        .eq("id", user.id)
        .maybeSingle();
      destination = isStaffRole(profile) ? "/admin" : "/portal";
    }

    router.push(destination);
    router.refresh();
  }

  return (
    <>
      <h1 className="mb-2 text-2xl font-semibold text-white">Welcome back</h1>
      <p className="mb-6 text-sm text-white/60">
        Sign in to your DeanVerse Digital account
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {notice && (
          <div className="rounded-lg border border-[#6f8f72]/30 bg-[#6f8f72]/10 px-4 py-3 text-sm text-[#a3c9a8]">
            {notice}
          </div>
        )}
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

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-sm text-white/70">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#a3c9a8] hover:text-[#6f8f72]"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-[#6f8f72] focus:outline-none focus:ring-1 focus:ring-[#6f8f72]"
            placeholder="••••••••"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/50">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[#a3c9a8] hover:text-[#6f8f72]">
          Create one
        </Link>
      </p>
    </>
  );
}
