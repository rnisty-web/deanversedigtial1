import { PortalPageContent } from "@/components/portal/PortalPageContent";
import { cn } from "@/lib/utils";

export function PortalPageShell({
  header,
  children,
  className,
  contentClassName,
}: {
  header?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div className={cn("admin-content-page", className)}>
      {header}
      <PortalPageContent className={contentClassName}>{children}</PortalPageContent>
    </div>
  );
}
