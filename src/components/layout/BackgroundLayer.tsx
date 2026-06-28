"use client";

import Image from "next/image";
import { useSiteConfig } from "@/components/providers/CMSProvider";
import { cn } from "@/lib/utils";

interface BackgroundLayerProps {
  className?: string;
}

export function BackgroundLayer({ className }: BackgroundLayerProps) {
  const siteConfig = useSiteConfig();

  return (
    <div
      className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)}
      aria-hidden="true"
    >
      <Image
        src={siteConfig.assets.background}
        alt=""
        fill
        priority
        className="object-cover object-center scale-105"
        sizes="100vw"
        suppressHydrationWarning
      />
      <div className="absolute inset-0 bg-[#0f1a17]/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f1a17]/70 via-[#0f1a17]/20 to-[#0f1a17]/85" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(111,143,114,0.12)_0%,_transparent_55%)]" />
    </div>
  );
}
