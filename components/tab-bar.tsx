"use client";

import {appearPop, hoverSpring} from "@/lib/motion";
import {motion} from "motion/react";
import Link from "next/link";
import type {ReactNode} from "react";

const MotionLink = motion.create(Link);

type TabBarProps = {
  href: string;
  "aria-label": string;
  children: ReactNode;
  className?: string;
  appearDelay?: number;
};

export function TabBar({
  href,
  "aria-label": ariaLabel,
  children,
  className = "",
  appearDelay = 0,
}: TabBarProps) {
  return (
    <MotionLink
      href={href}
      aria-label={ariaLabel}
      className={["tab-bar", className].filter(Boolean).join(" ")}
      initial={{scale: 0.5}}
      animate={{
        scale: 1,
        transition: {...appearPop, delay: appearDelay},
      }}
      whileHover={{
        scale: 1.05,
        transition: hoverSpring,
      }}
      whileTap={{scale: 0.9}}
    >
      {children}
    </MotionLink>
  );
}

export function HomeIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}
