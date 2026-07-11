"use client";

import { useEffect, useRef } from "react";

/**
 * Simplistic premium cursor: a small gold dot that tracks the mouse
 * with a soft trailing ring. Desktop-only (pointer: fine), respects
 * prefers-reduced-motion, and never blocks interaction.
 */
export function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let x = -100;
    let y = -100;
    let ringX = -100;
    let ringY = -100;
    let visible = false;
    let raf = 0;

    function handleMove(e: MouseEvent) {
      x = e.clientX;
      y = e.clientY;

      if (!visible) {
        visible = true;
        ringX = x;
        ringY = y;
        dot!.style.opacity = "1";
        ring!.style.opacity = "1";
      }

      const target = e.target as Element | null;
      const interactive = !!target?.closest(
        "a, button, [role='button'], input, select, textarea, label, summary",
      );
      ring!.classList.toggle("dvd-cursor-ring--active", interactive);
    }

    function handleLeave() {
      visible = false;
      dot!.style.opacity = "0";
      ring!.style.opacity = "0";
    }

    function handleDown() {
      ring!.classList.add("dvd-cursor-ring--press");
    }

    // Also clears on window blur, since mouseup may never fire after alt-tab.
    function handleUp() {
      ring!.classList.remove("dvd-cursor-ring--press");
    }

    function tick() {
      ringX += (x - ringX) * 0.16;
      ringY += (y - ringY) * 0.16;
      dot!.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      ring!.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", handleMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleLeave);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("blur", handleUp);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", handleMove);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("blur", handleUp);
    };
  }, []);

  return (
    <div aria-hidden className="dvd-cursor-layer">
      <div ref={ringRef} className="dvd-cursor-ring" />
      <div ref={dotRef} className="dvd-cursor-dot" />
    </div>
  );
}
