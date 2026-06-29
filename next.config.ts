import type { NextConfig } from "next";

function safeHostname(raw: string | undefined, fallback: string) {
  const value = raw?.trim();
  if (!value) return fallback;

  try {
    return new URL(value).hostname;
  } catch {
    return fallback;
  }
}

const supabaseHostname = safeHostname(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  "*.supabase.co",
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname,
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
