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
        "flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </div>
  );
}
