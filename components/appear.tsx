"use client";

import {appearFade, appearPop} from "@/lib/motion";
import {motion} from "motion/react";
import type {ReactNode} from "react";

type AppearProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  visible?: boolean;
  instant?: boolean;
  onAnimationComplete?: () => void;
};

export function AppearFade({
  children,
  className,
  delay = 0.1,
  visible = true,
  instant = false,
}: AppearProps) {
  return (
    <motion.div
      className={className}
      initial={instant ? false : {opacity: 0}}
      animate={{opacity: visible ? 1 : 0}}
      transition={{...appearFade, delay: visible && !instant ? delay : 0}}
      style={{pointerEvents: visible ? undefined : "none"}}
    >
      {children}
    </motion.div>
  );
}

export function AppearPop({
  children,
  className,
  delay = 0,
  instant = false,
  onAnimationComplete,
}: AppearProps) {
  return (
    <motion.div
      className={className}
      initial={instant ? false : {opacity: 0, scale: 0.5}}
      animate={{opacity: 1, scale: 1}}
      transition={{...appearPop, delay: instant ? 0 : delay}}
      style={{transformOrigin: "center center"}}
      onAnimationComplete={onAnimationComplete}
    >
      {children}
    </motion.div>
  );
}
