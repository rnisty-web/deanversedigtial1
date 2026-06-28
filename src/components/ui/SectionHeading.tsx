import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeadingProps) {
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
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 text-base leading-relaxed text-white/60 md:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </Reveal>
  );
}
