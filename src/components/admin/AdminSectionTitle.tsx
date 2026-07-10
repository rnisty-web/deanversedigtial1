import { getAdminSectionMeta, type AdminSectionId } from "@/lib/admin/section-meta";
import { cn } from "@/lib/utils";

type AdminSectionTitleProps = {
  section: AdminSectionId;
  title?: string;
  className?: string;
};

export function AdminSectionTitle({ section, title, className }: AdminSectionTitleProps) {
  const meta = getAdminSectionMeta(section);

  return (
    <h1
      className={cn(
        "admin-heading-serif admin-content-title admin-portal-section-title text-2xl text-[var(--admin-text)] md:text-3xl",
        className,
      )}
    >
      {title ?? meta.title}{" "}
      <span className="admin-section-emoji" aria-hidden>
        {meta.emoji}
      </span>
    </h1>
  );
}
