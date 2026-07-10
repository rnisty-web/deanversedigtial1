import Image from "next/image";
import { cn } from "@/lib/utils";

interface BackgroundLayerProps {
  backgroundSrc: string;
  className?: string;
}

export function BackgroundLayer({ backgroundSrc, className }: BackgroundLayerProps) {
  return (
    <div
      className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)}
      aria-hidden="true"
    >
      <Image
        src={backgroundSrc}
        alt=""
        fill
        quality={50}
        fetchPriority="low"
        className="object-cover object-center scale-105"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[#0f1a17]/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f1a17]/70 via-[#0f1a17]/20 to-[#0f1a17]/85" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(111,143,114,0.12)_0%,_transparent_55%)]" />
    </div>
  );
}
