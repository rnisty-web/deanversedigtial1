import { cn } from "@/lib/utils";

export function PortalPageContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "admin-content-shell portal-page-content portal-content-shell px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-8 pb-[env(safe-area-inset-bottom)]",
        className,
      )}
    >
      <div className="admin-portal-content-inner mx-auto max-w-[1680px]">{children}</div>
    </div>
  );
}
