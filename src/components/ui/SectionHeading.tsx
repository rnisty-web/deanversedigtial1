import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  /** Semantic heading level — use 1 for page titles, 2 for sections, 3 for subsections */
  level?: 1 | 2 | 3;
}

const TITLE_CLASSES: Record<1 | 2 | 3, string> = {
  1: "text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl",
  2: "text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl",
  3: "text-2xl font-bold tracking-tight text-white md:text-3xl",
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  level = 2,
}: SectionHeadingProps) {
  const HeadingTag = (`h${level}` as "h1" | "h2" | "h3");

  return (
    <Reveal className={cn("mb-12 md:mb-16", className)}>
      <div
        className={cn(
          "max-w-3xl",
          align === "center" && "mx-auto text-center",
          align === "left" && "text-left",
        )}
      >
        {eyebrow && (
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#a3c9a8]">
            {eyebrow}
          </p>
        )}
        <HeadingTag className={TITLE_CLASSES[level]}>{title}</HeadingTag>
        {subtitle && (
          <p className="mt-4 text-base leading-relaxed text-white/60 md:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </Reveal>
  );
}
