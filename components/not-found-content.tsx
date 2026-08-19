"use client";

import {hoverSpring} from "@/lib/motion";
import {motion, useReducedMotion} from "motion/react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useEffect} from "react";

const MotionLink = motion.create(Link);

const shrugArm = {
  duration: 1.8,
  repeat: Infinity,
  repeatType: "mirror" as const,
  ease: "easeInOut" as const,
};

export function NotFoundContent() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }
      if (event.key.toLowerCase() !== "h") return;
      event.preventDefault();
      router.push("/");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={reduceMotion ? false : {opacity: 0, y: 12}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.5, ease: [0.22, 1, 0.36, 1]}}
    >
      <p
        className="inline-flex items-end text-body-md text-subdued"
        aria-hidden
      >
        <motion.span
          className="inline-block origin-[100%_80%]"
          animate={reduceMotion ? undefined : {rotate: [2, -12], y: [0, -2]}}
          transition={shrugArm}
        >
          {"¯\\"}
        </motion.span>
        <span>_(ツ)_</span>
        <motion.span
          className="inline-block origin-[0%_80%]"
          animate={reduceMotion ? undefined : {rotate: [-2, 12], y: [0, -2]}}
          transition={shrugArm}
        >
          /¯
        </motion.span>
      </p>
      <MotionLink
        href="/"
        className="inline-flex items-center gap-1.5 text-body-sm text-subdued"
        whileHover={{scale: 1.03}}
        whileTap={{scale: 0.97}}
        transition={hoverSpring}
      >
        Go back home
        <span className="hidden items-center gap-1.5 xl:inline-flex">
          or press
          <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-[var(--button)] px-1 text-[11px] font-medium leading-none shadow-[0_1px_0_rgb(23_23_23/0.06)]">
            H
          </kbd>
        </span>
      </MotionLink>
    </motion.div>
  );
}
