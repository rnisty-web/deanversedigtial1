"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type AdminModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
};

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function AdminModal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: AdminModalProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-md sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
    >
      <div
        className={cn(
          "admin-luxury-card w-full max-h-[92vh] overflow-hidden rounded-t-[var(--admin-radius)] sm:max-h-[90vh] sm:rounded-[var(--admin-radius)]",
          sizeClasses[size],
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--admin-border-subtle)] px-6 py-4">
          <h3 id="admin-modal-title" className="text-lg font-semibold text-[var(--admin-text)]">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="admin-btn-ghost inline-flex h-11 w-11 shrink-0 items-center justify-center p-0"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-4">{children}</div>

        {footer ?? (
          <div className="flex justify-end gap-2 border-t border-[var(--admin-border-subtle)] px-6 py-4">
            <Button variant="ghost" size="sm" className="admin-btn-ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
