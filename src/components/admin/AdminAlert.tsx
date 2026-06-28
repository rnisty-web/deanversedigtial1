import { cn } from "@/lib/utils";

type AdminAlertProps = {
  tone?: "error" | "success" | "info" | "warning";
  children: React.ReactNode;
  className?: string;
};

const styles = {
  error: "border-red-400/30 bg-red-500/10 text-red-200",
  success:
    "border-[color-mix(in_srgb,var(--admin-emerald)_40%,transparent)] bg-[var(--admin-emerald)]/10 text-[var(--admin-gold-light)]",
  info: "border-blue-400/30 bg-blue-500/10 text-blue-100",
  warning: "border-amber-400/30 bg-amber-500/10 text-amber-100",
};

export function AdminAlert({ tone = "info", children, className }: AdminAlertProps) {
  return (
    <div className={cn("admin-luxury-card rounded-xl px-4 py-3 text-sm", styles[tone], className)}>
      {children}
    </div>
  );
}
