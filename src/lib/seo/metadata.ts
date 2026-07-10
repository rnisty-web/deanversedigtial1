import { siteConfig } from "@/lib/constants";
import type { Metadata } from "next";

function getBaseUrl(): string {
  return siteConfig.url.replace(/\/$/, "");
}

function normalizePath(path: string): string {
  if (path === "/" || path === "") return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export function createPageMetadata({
  title,
  description,
  path,
  noIndex = false,
  ogImage,
  twitterCard = "summary_large_image",
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  ogImage?: string;
  twitterCard?: "summary" | "summary_large_image";
}): Metadata {
  const normalizedPath = normalizePath(path);
  const url = `${getBaseUrl()}${normalizedPath === "/" ? "/" : normalizedPath}`;
  const image = ogImage || siteConfig.ogImage;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url,
      type: "website",
      images: [{ url: image, alt: siteConfig.name }],
    },
    twitter: {
      card: twitterCard,
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [image],
    },
    ...(noIndex && { robots: { index: false, follow: false } }),
  };
}

export function getAbsoluteUrl(path: string): string {
  const base = getBaseUrl();
  return path.startsWith("http") ? path : `${base}${normalizePath(path)}`;
}
