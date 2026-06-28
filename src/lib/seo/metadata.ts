import { siteConfig } from "@/lib/constants";
import type { Metadata } from "next";

function getBaseUrl(): string {
  return siteConfig.url.replace(/\/$/, "");
}

export function createPageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${getBaseUrl()}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url,
      images: [{ url: siteConfig.ogImage, alt: siteConfig.name }],
    },
    twitter: {
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [siteConfig.ogImage],
    },
    ...(noIndex && { robots: { index: false, follow: true } }),
  };
}

export function getAbsoluteUrl(path: string): string {
  const base = getBaseUrl();
  return path.startsWith("http") ? path : `${base}${path}`;
}
