"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function PortalNotice() {
  const searchParams = useSearchParams();
  const notice = searchParams.get("notice");

  if (notice !== "admin-required") return null;

  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 sm:px-6 lg:px-8">
      The admin dashboard is restricted to the site owner. If you need help with your project, use{" "}
      <Link href="/portal/messages" className="font-medium text-[var(--admin-gold-light)] underline">
        Messages
      </Link>{" "}
      or the{" "}
      <Link href="/contact" className="font-medium text-[var(--admin-gold-light)] underline">
        contact form
      </Link>
      .
    </div>
  );
}
