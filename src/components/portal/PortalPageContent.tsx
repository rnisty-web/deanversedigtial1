import { cn } from "@/lib/utils";

export function PortalPageContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("portal-page-content", className)}>
      <div>{children}</div>
    </div>
  );
}
