"use client";

import { useEffect, type RefObject } from "react";

function isEventInsideMenu(event: Event, menuEl: HTMLElement | null) {
  if (!menuEl) return false;

  const target = event.target;
  if (target instanceof Node && menuEl.contains(target)) {
    return true;
  }

  if (typeof event.composedPath === "function") {
    return event.composedPath().includes(menuEl);
  }

  return false;
}

/** Dismiss floating menus on outside interaction — keeps menus open while scrolling inside them. */
export function useFloatingMenuDismiss(
  open: boolean,
  menuRef: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) return;

    function closeOnPointerDown(event: MouseEvent) {
      if (isEventInsideMenu(event, menuRef.current)) return;
      onClose();
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    function closeOnScroll(event: Event) {
      if (isEventInsideMenu(event, menuRef.current)) return;
      const target = event.target;
      if (target instanceof Element) {
        const scrollHost = target.closest(
          ".overflow-x-auto, [class*='table-wrap'], .admin-leads-tabs, .admin-clients-tabs, .admin-projects-tabs, .admin-invoices-tabs, .admin-users-tabs, .portal-page-tabs",
        );
        if (scrollHost) return;
      }
      onClose();
    }

    document.addEventListener("mousedown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("scroll", closeOnScroll, true);
    window.addEventListener("resize", onClose);

    return () => {
      document.removeEventListener("mousedown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("scroll", closeOnScroll, true);
      window.removeEventListener("resize", onClose);
    };
  }, [open, menuRef, onClose]);
}
