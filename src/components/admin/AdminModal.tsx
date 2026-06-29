"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
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

  const modal = (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 backdrop-blur-md sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
    >
      <div
        className={cn(
          "admin-luxury-card flex w-full max-h-[min(92vh,100dvh)] flex-col overflow-hidden rounded-t-[var(--admin-radius)] sm:max-h-[min(90vh,100dvh)] sm:rounded-[var(--admin-radius)]",
          sizeClasses[size],
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--admin-border-subtle)] px-6 py-4">
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

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">{children}</div>

        {footer ? (
          <div className="shrink-0">{footer}</div>
        ) : (
          <div className="flex shrink-0 justify-end gap-2 border-t border-[var(--admin-border-subtle)] px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button variant="ghost" size="sm" className="admin-btn-ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;

  return createPortal(modal, document.body);
}
