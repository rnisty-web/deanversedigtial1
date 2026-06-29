import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { cn } from "@/lib/utils";

type AdminSidebarBrandProps = {
  compact?: boolean;
  className?: string;
};

function BrandStar({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-2 w-2 shrink-0 fill-current", className)}
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path d="M12 2l2.2 6.8H21l-5.5 4 2.1 6.7L12 17.8 6.4 19.5l2.1-6.7L3 8.8h6.8L12 2z" />
    </svg>
  );
}

export function AdminSidebarBrand({ compact = false, className }: AdminSidebarBrandProps) {
  return (
    <Link
      href="/admin"
      className={cn(
        "admin-sidebar-brand group flex flex-col items-center text-center transition-opacity hover:opacity-95",
        className,
      )}
    >
      <div
        className={cn(
          "admin-logo-ring admin-logo-ring-lg transition-transform duration-300 group-hover:scale-[1.02]",
          compact && "!h-[5.5rem] !w-[5.5rem] !p-2",
        )}
      >
        <BrandLogo
          width={160}
          height={160}
          className="h-full w-full object-contain"
          priority
        />
      </div>

      <h1
        className={cn(
          "admin-sidebar-brand-title admin-heading-serif mt-5 bg-gradient-to-b from-[#f5e6b8] via-[#d4af37] to-[#a8842f] bg-clip-text text-transparent",
          compact ? "text-[0.95rem]" : "text-[1.15rem]",
        )}
      >
        DEANVERSEDIGITAL
      </h1>

      <p
        className={cn(
          "admin-sidebar-brand-tagline mt-2 font-sans font-medium uppercase text-[#c9a962]/75",
          compact ? "text-[7px] tracking-[0.16em]" : "text-[8px] tracking-[0.22em]",
        )}
      >
        Web Design &amp; Digital Experiences
      </p>

      <div className="admin-sidebar-brand-divider mt-4 flex w-full max-w-[12.5rem] items-center gap-2 px-1">
        <span className="admin-sidebar-brand-divider-line flex-1" aria-hidden />
        <BrandStar className="text-[#d4af37]/80" />
        <span className="font-sans text-[9px] font-medium tracking-[0.28em] text-[#d4af37]/85">
          D + D
        </span>
        <BrandStar className="text-[#d4af37]/80" />
        <span className="admin-sidebar-brand-divider-line flex-1" aria-hidden />
      </div>
    </Link>
  );
}
