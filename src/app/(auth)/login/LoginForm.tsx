"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getRoleAwareRedirectPath } from "@/lib/auth-redirect";
import {
  CREATOR_EMAIL_DOMAIN,
  clientEmailHintForCreator,
  creatorEmailError,
  isCreatorEmail,
  normalizeEmail,
  type AuthWorkspaceVariant,
} from "@/lib/auth-workspace";
import { Button } from "@/components/ui/Button";

const COPY: Record<
  AuthWorkspaceVariant,
  {
    title: string;
    subtitle: string;
    emailPlaceholder: string;
    switchLabel: string;
    switchHref: string;
    switchCta: string;
    showRegister: boolean;
  }
> = {
  client: {
    title: "Client Workspace",
    subtitle: "Sign in to view your projects, files, messages, and invoices.",
    emailPlaceholder: "you@example.com",
    switchLabel: "Part of the DeanVerse Digital studio team?",
    switchHref: "/login/creators",
    switchCta: "Development Workspace",
    showRegister: true,
  },
  creators: {
    title: "Development Workspace",
    subtitle: `Studio access for @${CREATOR_EMAIL_DOMAIN} accounts only.`,
    emailPlaceholder: `you@${CREATOR_EMAIL_DOMAIN}`,
    switchLabel: "Looking for your client portal?",
    switchHref: "/login",
    switchCta: "Client Workspace",
    showRegister: false,
  },
};

export default function LoginForm({ variant }: { variant: AuthWorkspaceVariant }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const copy = COPY[variant];

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
  const [notice] = useState<string | null>(() =>
    searchParams.get("registered") === "1"
      ? "Account created. Check your email to confirm, then sign in below."
      : null,
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const normalized = normalizeEmail(email);

    if (variant === "creators" && !isCreatorEmail(normalized)) {
      setError(creatorEmailError());
      return;
    }

    if (variant === "client" && isCreatorEmail(normalized)) {
      setError(clientEmailHintForCreator());
      return;
    }

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
        email: normalized,
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

    // Defense in depth: reject mismatched workspace even if the password was valid.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const signedInEmail = user?.email ?? normalized;
    if (variant === "creators" && !isCreatorEmail(signedInEmail)) {
      await supabase.auth.signOut();
      setError(creatorEmailError());
      setLoading(false);
      return;
    }
    if (variant === "client" && isCreatorEmail(signedInEmail)) {
      await supabase.auth.signOut();
      setError(clientEmailHintForCreator());
      setLoading(false);
      return;
    }

    const { data: profile } = user
      ? await supabase
          .from("profiles")
          .select("role, roles")
          .eq("id", user.id)
          .maybeSingle()
      : { data: null };

    const destination = getRoleAwareRedirectPath(
      profile,
      searchParams.get("redirectTo"),
      "/workspace",
    );

    router.push(destination);
    router.refresh();
  }

  const switchHref = (() => {
    const redirectTo = searchParams.get("redirectTo");
    if (!redirectTo) return copy.switchHref;
    return `${copy.switchHref}?redirectTo=${encodeURIComponent(redirectTo)}`;
  })();

  return (
    <>
      <h1 className="mb-2 text-2xl font-semibold text-white">{copy.title}</h1>
      <p className="mb-6 text-sm text-white/60">{copy.subtitle}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {notice && (
          <div className="rounded-lg border border-[#6f8f72]/30 bg-[#6f8f72]/10 px-4 py-3 text-sm text-[#a3c9a8]">
            {notice}
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
            {variant === "client" && isCreatorEmail(email) ? (
              <>
                {" "}
                <Link href={switchHref} className="underline underline-offset-2 hover:text-white">
                  Go to Development Workspace
                </Link>
              </>
            ) : null}
            {variant === "creators" && email && !isCreatorEmail(email) ? (
              <>
                {" "}
                <Link href={switchHref} className="underline underline-offset-2 hover:text-white">
                  Go to Client Workspace
                </Link>
              </>
            ) : null}
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
            placeholder={copy.emailPlaceholder}
            autoComplete="email"
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
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      {copy.showRegister ? (
        <p className="mt-6 text-center text-sm text-white/50">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#a3c9a8] hover:text-[#6f8f72]">
            Create one
          </Link>
        </p>
      ) : (
        <p className="mt-6 text-center text-sm text-white/45">
          Studio accounts are invited. Contact your founder if you need access.
        </p>
      )}

      <div className="mt-6 border-t border-white/10 pt-5">
        <p className="mb-3 text-center text-xs text-white/45">{copy.switchLabel}</p>
        <Link
          href={switchHref}
          className="flex w-full items-center justify-center rounded-lg border border-[var(--admin-gold,#c9a962)]/35 bg-[var(--admin-gold,#c9a962)]/10 px-4 py-2.5 text-sm font-medium text-[var(--admin-gold-light,#dfc88a)] transition hover:border-[var(--admin-gold,#c9a962)]/55 hover:bg-[var(--admin-gold,#c9a962)]/18"
        >
          {copy.switchCta}
        </Link>
      </div>
    </>
  );
}
