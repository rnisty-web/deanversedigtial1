import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { cn } from "@/lib/utils";

type AdminSidebarBrandProps = {
  compact?: boolean;
  className?: string;
};

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
          compact && "!h-[4.75rem] !w-[4.75rem] !p-2",
        )}
      >
        <BrandLogo
          width={140}
          height={140}
          className="h-full w-full object-contain"
          priority
        />
      </div>
      <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--admin-gold)]">
        DeanVerse Digital
      </p>
      {!compact ? (
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
