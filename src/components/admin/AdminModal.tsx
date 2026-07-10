"use client";

import { AppModal, type AppModalProps } from "@/components/ui/AppModal";

type AdminModalProps = Omit<AppModalProps, "variant">;

export function AdminModal({ footer = null, ...props }: AdminModalProps) {
  return <AppModal {...props} footer={footer} variant="admin" />;
}
