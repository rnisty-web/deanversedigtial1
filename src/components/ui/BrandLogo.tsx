"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  src?: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function BrandLogo({
  src = siteConfig.assets.logo,
  alt = siteConfig.name,
  className,
  width = 240,
  height = 320,
  priority = false,
}: BrandLogoProps) {
  const [resolvedSrc, setResolvedSrc] = useState(src);
  const isSvg = resolvedSrc.toLowerCase().endsWith(".svg");

  useEffect(() => {
    setResolvedSrc(src);
  }, [src]);

  const sharedClassName = cn("h-auto w-auto object-contain", className);

  if (isSvg) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- SVG logo with PNG fallback on error
      <img
        src={resolvedSrc}
        alt={alt}
        width={width}
        height={height}
        className={sharedClassName}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onError={() => {
          if (resolvedSrc !== siteConfig.assets.logoRaster) {
            setResolvedSrc(siteConfig.assets.logoRaster);
          }
        }}
      />
    );
  }

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      width={width}
      height={height}
      className={sharedClassName}
      priority={priority}
      suppressHydrationWarning
    />
  );
}
