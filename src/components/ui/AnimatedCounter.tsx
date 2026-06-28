"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useHydratedReducedMotion } from "@/hooks/useHydratedReducedMotion";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: string;
  label: string;
  className?: string;
  duration?: number;
}

function parseStatValue(raw: string): {
  prefix: string;
  numeric: number;
  suffix: string;
} {
  const match = raw.match(/^([^0-9]*)([\d.]+)(.*)$/);

  if (!match) {
    return { prefix: "", numeric: 0, suffix: raw };
  }

  return {
    prefix: match[1] ?? "",
    numeric: parseFloat(match[2]),
    suffix: match[3] ?? "",
  };
}

function CounterNumber({
  target,
  prefix,
  suffix,
  duration,
}: {
  target: number;
  prefix: string;
  suffix: string;
  duration: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    duration: duration * 1000,
    bounce: 0,
  });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    motionValue.set(target);

    const unsubscribe = spring.on("change", (latest) => {
      const rounded =
        target % 1 === 0 ? Math.round(latest) : latest.toFixed(1);
      setDisplay(String(rounded));
    });

    return unsubscribe;
  }, [isInView, motionValue, spring, target]);

  return (
    <span ref={ref}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

export function AnimatedCounter({
  value,
  label,
  className,
  duration = 2,
}: AnimatedCounterProps) {
  const prefersReducedMotion = useHydratedReducedMotion();
  const { prefix, numeric, suffix } = parseStatValue(value);
  const hasNumber = numeric > 0 || /^\d/.test(value.trim());

  if (prefersReducedMotion) {
    return (
      <div className={cn("text-center", className)}>
        <p className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
          {value}
        </p>
        <p className="mt-2 text-sm font-medium uppercase tracking-wider text-[#a3c9a8]/80 md:text-base">
          {label}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className={cn("text-center", className)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
        {hasNumber ? (
          <CounterNumber
            target={numeric}
            prefix={prefix}
            suffix={suffix}
            duration={duration}
          />
        ) : (
          value
        )}
      </p>
      <p className="mt-2 text-sm font-medium uppercase tracking-wider text-[#a3c9a8]/80 md:text-base">
        {label}
      </p>
    </motion.div>
  );
}
