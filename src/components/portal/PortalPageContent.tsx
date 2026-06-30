import { cn } from "@/lib/utils";

export function PortalPageContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("portal-page-content pb-[max(2rem,env(safe-area-inset-bottom))]", className)}>
      <div>{children}</div>
    </div>
  );
}
