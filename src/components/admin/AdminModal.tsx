"use client";

import { AppModal, type AppModalProps } from "@/components/ui/AppModal";

type AdminModalProps = Omit<AppModalProps, "variant">;

export function AdminModal(props: AdminModalProps) {
  return <AppModal {...props} variant="admin" />;
}
