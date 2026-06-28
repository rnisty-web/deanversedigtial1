"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/auth-redirect";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

    if (!consent) {
      setError("Please accept the Privacy Policy and Terms of Service to continue");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: getAuthCallbackUrl("/portal"),
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    if (data.session) {
      router.push("/portal");
      router.refresh();
      return;
    }

    router.push("/login?registered=1");
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mb-4 text-4xl">✓</div>
        <h1 className="mb-2 text-xl font-semibold text-white">Account created!</h1>
        <p className="text-sm text-white/60">
          Check your email to confirm your account, then sign in to access the client portal.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm text-[#a3c9a8] hover:text-[#6f8f72]"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-2 text-2xl font-semibold text-white">Create account</h1>
      <p className="mb-6 text-sm text-white/60">
        Join the DeanVerse Digital client portal
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-sm text-white/70">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-[#6f8f72] focus:outline-none focus:ring-1 focus:ring-[#6f8f72]"
            placeholder="Jane Doe"
          />
        </div>

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
          <label htmlFor="password" className="mb-1.5 block text-sm text-white/70">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-[#6f8f72] focus:outline-none focus:ring-1 focus:ring-[#6f8f72]"
            placeholder="Min. 8 characters"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm text-white/70">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-[#6f8f72] focus:outline-none focus:ring-1 focus:ring-[#6f8f72]"
            placeholder="••••••••"
          />
        </div>

        <label className="flex items-start gap-3 text-sm text-white/60">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 text-[#6f8f72] focus:ring-[#6f8f72]"
            required
          />
          <span>
            I agree to the{" "}
            <Link href="/privacy" className="text-[#a3c9a8] hover:text-[#6f8f72]">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="text-[#a3c9a8] hover:text-[#6f8f72]">
              Terms of Service
            </Link>
            .
          </span>
        </label>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/50">
        Already have an account?{" "}
        <Link href="/login" className="text-[#a3c9a8] hover:text-[#6f8f72]">
          Sign in
        </Link>
      </p>
    </>
  );
}
