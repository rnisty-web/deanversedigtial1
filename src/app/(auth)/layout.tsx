import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-[#0f1a17] px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#2f5d50_0%,_transparent_50%)] opacity-40" />
      <div className="relative z-10 w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex flex-col items-center gap-3 transition-opacity hover:opacity-80"
        >
          <BrandLogo
            priority
            width={280}
            height={360}
            className="mx-auto h-32 w-auto max-w-[300px] sm:h-36"
          />
          <span className="text-lg font-semibold tracking-tight text-white">
            {siteConfig.name}
          </span>
        </Link>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl backdrop-blur-xl sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
