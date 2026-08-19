"use client";

import {appearScale, hoverSpring} from "@/lib/motion";
import {HomeIcon as HeroHomeIcon} from "@heroicons/react/24/solid";
import {motion} from "motion/react";
import Link from "next/link";
import type {ReactNode} from "react";

const MotionLink = motion.create(Link);

type TabBarProps = {
  href: string;
  "aria-label": string;
  children: ReactNode;
  className?: string;
};

export function TabBar({
  href,
  "aria-label": ariaLabel,
  children,
  className = "",
}: TabBarProps) {
  return (
    <MotionLink
      href={href}
      aria-label={ariaLabel}
      className={["tab-bar", "origin-center", className].filter(Boolean).join(" ")}
      initial={{scale: 0.5}}
      animate={{scale: 1}}
      transition={appearScale}
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
  return <HeroHomeIcon className="size-6" aria-hidden />;
}
