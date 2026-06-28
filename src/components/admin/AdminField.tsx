"use client";

import { cn } from "@/lib/utils";

const inputStyles =
  "admin-input disabled:opacity-50";

type AdminFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel" | "url" | "number" | "password";
  multiline?: boolean;
  rows?: number;
  hint?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function AdminField({
  label,
  value,
  onChange,
  type = "text",
  multiline = false,
  rows = 4,
  hint,
  placeholder,
  className,
  disabled = false,
}: AdminFieldProps) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-[var(--admin-text-muted)]">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(inputStyles, "min-h-[88px] resize-y")}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={inputStyles}
        />
      )}
      {hint && <p className="mt-1.5 text-xs text-[var(--admin-text-muted)]">{hint}</p>}
    </div>
  );
}

export { inputStyles as adminInputStyles };
