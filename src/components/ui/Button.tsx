import Link from "next/link";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "border border-[color-mix(in_srgb,var(--primary)_50%,transparent)] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_95%,white)_0%,var(--primary)_50%,var(--primary-hover)_100%)] text-white shadow-[0_4px_24px_-4px_var(--glass-shadow),inset_0_1px_0_0_rgba(255,255,255,0.2)] hover:brightness-110 hover:shadow-[0_8px_32px_-4px_var(--glass-shadow)]",
  secondary:
    "liquid-glass border-[color-mix(in_srgb,var(--accent)_35%,transparent)] text-[var(--accent)] hover:border-[color-mix(in_srgb,var(--accent)_55%,transparent)] hover:bg-[rgba(163,201,168,0.08)] hover:text-white",
  ghost:
    "border border-transparent bg-transparent text-white/75 hover:liquid-glass hover:border-white/10 hover:text-white",
  solid:
    "border border-white/20 bg-white text-[var(--background)] shadow-[0_4px_20px_-6px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.9)] hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--background)]",
  danger:
    "border border-red-400/30 bg-[linear-gradient(135deg,rgba(239,68,68,0.85)_0%,rgba(185,28,28,0.9)_100%)] text-white shadow-[0_4px_20px_-6px_rgba(239,68,68,0.4),inset_0_1px_0_0_rgba(255,255,255,0.15)] hover:brightness-110",
} as const;

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3 text-base",
} as const;

type ButtonVariant = keyof typeof variants;
type ButtonSize = keyof typeof sizes;

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
}

interface ButtonAsButton extends ButtonBaseProps {
  href?: undefined;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

interface ButtonAsLink extends ButtonBaseProps {
  href: string;
  external?: boolean;
}

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium backdrop-blur-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    className,
    children,
  } = props;

  const classes = cn(baseStyles, variants[variant], sizes[size], className);

  if ("href" in props && props.href) {
    if (props.external) {
      return (
        <a
          href={props.href}
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const { type = "button", disabled, onClick } = props as ButtonAsButton;

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
