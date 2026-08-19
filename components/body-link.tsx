"use client";

import {linkTween} from "@/lib/motion";
import {motion} from "motion/react";
import type {ReactNode} from "react";

export function BodyLink({
  href,
  external,
  children,
}: {
  href: string;
  external: boolean;
  children: ReactNode;
}) {
  return (
    <motion.a
      href={href}
      className="text-ink underline decoration-ink/30 underline-offset-2"
      whileHover={{color: "var(--subdued)"}}
      transition={linkTween}
      {...(external ? {target: "_blank", rel: "noreferrer"} : {})}
    >
      {children}
    </motion.a>
  );
}
