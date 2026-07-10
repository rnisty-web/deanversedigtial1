"use client";

import { useEffect, useState } from "react";
import { getAdminSearchShortcutLabel } from "@/lib/admin/section-meta";
import { cn } from "@/lib/utils";

export function AdminShortcutHint({ className }: { className?: string }) {
  const [label, setLabel] = useState("Ctrl K");

  useEffect(() => {
    setLabel(getAdminSearchShortcutLabel());
  }, []);

  return (
    <kbd
      className={cn(
        "pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-[var(--admin-border-subtle)] bg-[var(--admin-panel)] px-1.5 py-0.5 text-[10px] text-[var(--admin-text-muted)] sm:inline",
        className,
      )}
    >
      {label}
    </kbd>
  );
}
