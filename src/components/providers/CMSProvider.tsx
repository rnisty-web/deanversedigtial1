"use client";

import { createContext, useContext } from "react";
import type { CMSContent, PublicSiteConfig } from "@/lib/cms/types";

type CMSContextValue = {
  config: PublicSiteConfig;
  content: CMSContent;
};

const CMSContext = createContext<CMSContextValue | null>(null);

export function CMSProvider({
  config,
  content,
  children,
}: {
  config: PublicSiteConfig;
  content: CMSContent;
  children: React.ReactNode;
}) {
  return (
    <CMSContext.Provider value={{ config, content }}>{children}</CMSContext.Provider>
  );
}

export function useSiteConfig() {
  const ctx = useContext(CMSContext);
  if (!ctx) {
    throw new Error("useSiteConfig must be used within CMSProvider");
  }
  return ctx.config;
}

export function useCMS() {
  const ctx = useContext(CMSContext);
  if (!ctx) {
    throw new Error("useCMS must be used within CMSProvider");
  }
  return ctx.content;
}

export function useSiteConfigSafe() {
  return useContext(CMSContext)?.config ?? null;
}

export function useCMSSafe() {
  return useContext(CMSContext)?.content ?? null;
}
