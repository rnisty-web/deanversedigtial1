"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Avoid hydration mismatches: SSR and the first client paint always use the
 * animated branch; reduced-motion applies only after mount.
 */
export function useHydratedReducedMotion(): boolean {
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted && Boolean(prefersReducedMotion);
}
