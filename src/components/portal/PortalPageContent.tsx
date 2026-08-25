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
        "admin-content-shell portal-page-content portal-content-shell min-h-0 flex-1 overflow-y-auto overscroll-contain",
        className,
      )}
    >
      <div className="admin-portal-content-inner mx-auto max-w-[1680px]">{children}</div>
    </div>
  );
}
