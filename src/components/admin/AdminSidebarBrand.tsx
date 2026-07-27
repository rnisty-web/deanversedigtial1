import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { cn } from "@/lib/utils";

type AdminSidebarBrandProps = {
  compact?: boolean;
  /** Smaller mark for sidebars that must fit every nav item on one screen. */
  dense?: boolean;
  className?: string;
  href?: string;
};

export function AdminSidebarBrand({
  compact = false,
  dense = false,
  className,
  href = "/admin",
}: AdminSidebarBrandProps) {
  return (
    <Link
      href={href}
      className={cn(
        "admin-sidebar-brand group flex flex-col items-center text-center transition-opacity hover:opacity-95",
        dense && "admin-sidebar-brand-dense",
        className,
      )}
    >
      <div
        className={cn(
          "admin-logo-ring admin-logo-ring-lg transition-transform duration-300 group-hover:scale-[1.02]",
          compact && !dense && "!h-[4.75rem] !w-[4.75rem] !p-2",
          dense && "!h-14 !w-14 !p-1.5",
        )}
      >
        <BrandLogo
          width={140}
          height={140}
          className="h-full w-full object-contain"
          priority
        />
      </div>
      <p
        className={cn(
          "font-semibold uppercase text-[var(--admin-gold)]",
          dense
            ? "mt-2 text-[9px] tracking-[0.22em]"
            : "mt-5 text-[10px] tracking-[0.32em]",
        )}
      >
        DeanVerse Digital
      </p>
      {!compact && !dense ? (
        <>
          <p className="mt-2 text-[8px] font-medium uppercase leading-relaxed tracking-[0.2em] text-[var(--admin-gold)]/60">
            Web Design &amp; Digital Experiences
          </p>
          <p className="mt-1.5 text-[8px] font-medium tracking-[0.42em] text-[var(--admin-gold)]/45">
            D + D
          </p>
        </>
      ) : null}
    </Link>
  );
}
