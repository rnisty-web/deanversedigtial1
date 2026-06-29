"use client";

import { AppModal, type AppModalProps } from "@/components/ui/AppModal";

type PortalModalProps = Omit<AppModalProps, "variant" | "size"> & {
  size?: "sm" | "md" | "lg";
};

export function PortalModal({ size = "md", ...props }: PortalModalProps) {
  return <AppModal {...props} size={size} variant="portal" />;
}
