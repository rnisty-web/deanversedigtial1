"use client";

import { AdminPageMotion } from "@/components/admin/AdminMotion";

export function AdminPageTransition({ children }: { children: React.ReactNode }) {
  return <AdminPageMotion>{children}</AdminPageMotion>;
}
