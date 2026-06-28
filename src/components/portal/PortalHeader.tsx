"use client";

import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { Profile } from "@/lib/auth";
import { isStaffRole } from "@/lib/roles";

interface PortalHeaderProps {
  profile: Profile;
}

export function PortalHeader({ profile }: PortalHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isStaff = isStaffRole(profile);
  const isDashboard = pathname === "/portal";

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="liquid-glass relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3 sm:gap-3 sm:py-4 lg:px-8">
      <div className="min-w-0 flex-1">
        {!isDashboard && (
          <>
            <p className="hidden text-sm text-white/50 sm:block">Welcome back,</p>
            <p className="truncate text-sm font-medium text-white sm:text-base">
              {profile.full_name ?? profile.email}
            </p>
          </>
        )}
        {isDashboard ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            Client Portal
          </p>
        ) : (
          <p className="mt-0.5 hidden text-xs text-white/40 sm:block">
            {isStaff
              ? "Previewing the client portal — linked client data only."
              : "Your projects, messages, invoices, and account."}
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {isStaff && (
          <Button href="/admin" size="sm" variant="primary">
            Admin Portal
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
