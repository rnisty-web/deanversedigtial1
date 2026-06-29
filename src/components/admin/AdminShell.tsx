"use client";

import { AdminShellProvider } from "@/components/admin/AdminShellProvider";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return <AdminShellProvider>{children}</AdminShellProvider>;
}
