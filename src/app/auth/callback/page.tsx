"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getSafeRedirectPath } from "@/lib/auth-redirect";
import { isStaffRole } from "@/lib/roles";

function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Completing sign-in…");

  useEffect(() => {
    let cancelled = false;

    async function completeSignIn() {
      const supabase = createClient();
      const code = searchParams.get("code");
      const authError =
        searchParams.get("error_description") ?? searchParams.get("error");

      if (authError) {
        router.replace(
          `/login?error=auth_callback&message=${encodeURIComponent(authError)}`,
        );
        return;
      }

      if (code) {
        setMessage("Verifying your account…");
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          router.replace(
            `/login?error=auth_callback&message=${encodeURIComponent(error.message)}`,
          );
          return;
        }
      } else {
        setMessage("Finalizing session…");
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session) {
          router.replace(
            `/login?error=auth_callback&message=${encodeURIComponent(
              "Invalid or expired link. Please sign in or request a new reset email.",
            )}`,
          );
          return;
        }
      }

      const nextParam = searchParams.get("next");
      let destination = getSafeRedirectPath(nextParam, "/portal");

      if (!nextParam) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, roles")
            .eq("id", user.id)
            .maybeSingle();

          destination = isStaffRole(profile) ? "/admin" : "/portal";
        }
      }

      if (!cancelled) {
        router.replace(destination);
        router.refresh();
      }
    }

    void completeSignIn();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1a17] px-4">
      <p className="text-sm text-white/60">{message}</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0f1a17]">
          <p className="text-sm text-white/60">Completing sign-in…</p>
        </div>
      }
    >
      <AuthCallbackHandler />
    </Suspense>
  );
}
