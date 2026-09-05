"use client";

import {hoverSpring} from "@/lib/motion";
import {motion, useReducedMotion} from "motion/react";
import {useLayoutEffect, useRef, useState, type ReactNode} from "react";

export function SwappingLabel({
  primary,
  alternate,
  active,
  className = "text-body-md text-ink",
  align = "left",
  heightClassName = "h-6",
  offset = 12,
  suppressHydrationWarning = false,
}: {
  primary: ReactNode;
  alternate: ReactNode;
  active: boolean;
  className?: string;
  align?: "left" | "right";
  heightClassName?: string;
  offset?: number;
  suppressHydrationWarning?: boolean;
}) {
  const primaryRef = useRef<HTMLSpanElement>(null);
  const alternateRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number>();
  const animateWidth = useRef(false);
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? {duration: 0} : hoverSpring;
  const widthTransition = animateWidth.current ? transition : {duration: 0};
  const edge = align === "right" ? "right-0" : "left-0";

  useLayoutEffect(() => {
    const el = active ? alternateRef.current : primaryRef.current;
    if (el) setWidth(el.offsetWidth);
  }, [active, primary, alternate]);

  useLayoutEffect(() => {
    if (width !== undefined) animateWidth.current = true;
  }, [width]);

  return (
    <motion.span
      className={`relative inline-block overflow-hidden align-bottom ${heightClassName}`}
      initial={false}
      animate={{width: width ?? "auto"}}
      transition={widthTransition}
    >
      <motion.span
        ref={primaryRef}
        suppressHydrationWarning={suppressHydrationWarning}
        className={`absolute top-0 ${edge} whitespace-nowrap ${className}`}
        initial={false}
        animate={{y: active ? -offset : 0, opacity: active ? 0 : 1}}
        transition={transition}
      >
        {primary}
      </motion.span>
      <motion.span
        ref={alternateRef}
        className={`absolute top-0 ${edge} whitespace-nowrap ${className}`}
        initial={false}
        animate={{y: active ? 0 : offset, opacity: active ? 1 : 0}}
        transition={transition}
      >
        {alternate}
      </motion.span>
    </motion.span>
  );
}
