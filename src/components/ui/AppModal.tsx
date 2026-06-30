"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type AppModalSize = "sm" | "md" | "lg" | "xl";
export type AppModalVariant = "admin" | "portal";

export type AppModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: AppModalSize;
  variant?: AppModalVariant;
};

const sizeClasses: Record<AppModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

const variantStyles = {
  admin: {
    backdrop: "bg-black/60",
    panel:
      "admin-luxury-card rounded-t-[var(--admin-radius)] sm:rounded-[var(--admin-radius)]",
    headerBorder: "border-[var(--admin-border-subtle)]",
    titleClass: "text-lg font-semibold text-[var(--admin-text)]",
    closeButtonClass:
      "admin-btn-ghost inline-flex h-11 w-11 shrink-0 items-center justify-center p-0",
    footerBorder: "border-[var(--admin-border-subtle)]",
    closeButtonVariant: "ghost" as const,
    closeButtonExtraClass: "admin-btn-ghost",
    titleIdPrefix: "admin-modal",
  },
  portal: {
    backdrop: "bg-black/50",
    panel: "liquid-glass-strong rounded-t-2xl sm:rounded-2xl",
    headerBorder: "border-white/10",
    titleClass: "text-lg font-semibold text-white",
    closeButtonClass:
      "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-transparent text-white/50 transition-all hover:liquid-glass hover:border-white/10 hover:text-white",
    footerBorder: "border-white/10",
    closeButtonVariant: "ghost" as const,
    closeButtonExtraClass: "",
    titleIdPrefix: "portal-modal",
  },
};

export function AppModal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  variant = "admin",
}: AppModalProps) {
  const styles = variantStyles[variant];
  const titleId = `${styles.titleIdPrefix}-title`;

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
      className={cn(
        "fixed inset-0 z-[100] flex items-end justify-center p-0 backdrop-blur-md sm:items-center sm:p-4",
        styles.backdrop,
      )}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className={cn(
          "flex w-full max-h-[min(92vh,100dvh)] flex-col overflow-hidden sm:max-h-[min(90vh,100dvh)]",
          styles.panel,
          sizeClasses[size],
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={cn(
            "flex shrink-0 items-center justify-between border-b px-6 py-4",
            styles.headerBorder,
          )}
        >
          <h3 id={titleId} className={styles.titleClass}>
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButtonClass}
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4">
          {children}
        </div>

        {footer !== undefined ? (
          footer ? <div className="shrink-0">{footer}</div> : null
        ) : (
          <div
            className={cn(
              "flex shrink-0 justify-end gap-2 border-t px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
              styles.footerBorder,
            )}
          >
            <Button
              variant={styles.closeButtonVariant}
              size="sm"
              className={styles.closeButtonExtraClass || undefined}
              onClick={onClose}
            >
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
