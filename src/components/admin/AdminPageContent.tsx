import { cn } from "@/lib/utils";

interface AdminPageContentProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminPageContent({ children, className }: AdminPageContentProps) {
  return (
    <div
      className={cn(
        "admin-content-shell px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-8 pb-[env(safe-area-inset-bottom)]",
        className,
      )}
    >
      <div className="admin-portal-content-inner mx-auto max-w-[1680px]">{children}</div>
    </div>
  );
}
