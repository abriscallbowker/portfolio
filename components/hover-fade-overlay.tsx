"use client";

import {hoverSpring} from "@/lib/motion";
import {motion} from "motion/react";

/**
 * Emulates fading the parent to (1 - strength) opacity on hover by fading a
 * page-background-colored overlay in on top of it. Animating an element's own
 * opacity makes Safari promote and re-rasterize it (Motion runs opacity
 * animations through WAAPI), which pixel-snaps its contents and causes a
 * subpixel shift on hover. The overlay leaves the content layer untouched.
 *
 * The parent must be `position: relative` and carry
 * `initial="rest" animate="rest" whileHover="hover"` so the variants propagate.
 */
export function HoverFadeOverlay({
  strength = 0.4,
  className = "",
}: {
  strength?: number;
  className?: string;
}) {
  return (
    <motion.span
      aria-hidden
      className={`pointer-events-none absolute inset-0 bg-background ${className}`}
      variants={{rest: {opacity: 0}, hover: {opacity: strength}}}
      transition={hoverSpring}
    />
  );
}
