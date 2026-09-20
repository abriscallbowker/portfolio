"use client";

import {AppearFade} from "@/components/appear";
import {useGreetingReveal} from "@/components/greeting-reveal";
import {appearFade, tabSlide} from "@/lib/motion";
import {LayoutRouterContext} from "next/dist/shared/lib/app-router-context.shared-runtime";
import {AnimatePresence, motion} from "motion/react";
import {usePathname, useSelectedLayoutSegment} from "next/navigation";
import {useContext, useRef, useState, type ReactNode} from "react";

const tabSlideVariants = {
  enter: (direction: number) => ({opacity: 0, x: 32 * direction}),
  center: {opacity: 1, x: 0},
  // Stay above the incoming page so text slides off the gallery
  // instead of the cards flashing over the list. Absolute so a tall
  // exiting page (Writing) doesn't keep the grid row — and the
  // document — oversized until the fade finishes.
  exit: (direction: number) => ({
    opacity: 0,
    x: -32 * direction,
    pointerEvents: "none" as const,
    zIndex: 1,
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
  }),
};

// Gallery sits still when revealed. It still fades out immediately when
// leaving so the imagery doesn't linger over incoming text tabs.
const showcaseSlideVariants = {
  enter: {opacity: 0, x: 0},
  center: {opacity: 1, x: 0},
  exit: {
    opacity: 0,
    pointerEvents: "none" as const,
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    transition: {duration: 0.1, ease: "easeOut"} as const,
  },
};

function tabIndex(segment: string | null) {
  if (segment === "writing") return 1;
  if (segment === "about") return 2;
  return 0;
}

function FrozenRouter({children}: {children: ReactNode}) {
  const context = useContext(LayoutRouterContext);
  const frozen = useRef(context).current;

  if (!frozen) return children;

  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

export function SiteEnter({children}: {children: ReactNode}) {
  const {played} = useGreetingReveal();
  const [skipIntro] = useState(played);
  const pathname = usePathname();
  const isAbout = pathname === "/about";
  const fillViewport = !isAbout;

  return (
    <div
      className={
        fillViewport
          ? "flex min-h-full flex-col"
          : // Between the bottom glass (z-10 on about) and the top glass
            // (z-30), so HomeFooter can sit above the blur without lifting
            // the greeting/headshot over the top overlay.
            "relative z-[25] flex flex-col"
      }
    >
      <AppearFade
        delay={0}
        instant={!skipIntro}
        className={
          fillViewport ? "flex min-h-full flex-1 flex-col" : "flex flex-col"
        }
      >
        {children}
      </AppearFade>
    </div>
  );
}

export function PageFade({children}: {children: ReactNode}) {
  const {played, ready} = useGreetingReveal();
  const [skipIntro] = useState(played);
  const segment = useSelectedLayoutSegment();
  const index = tabIndex(segment);
  const previousIndex = useRef(index);
  const directionRef = useRef(1);

  if (previousIndex.current !== index) {
    directionRef.current = index > previousIndex.current ? 1 : -1;
    previousIndex.current = index;
  }

  const direction = directionRef.current;

  return (
    <motion.div
      className="w-full"
      initial={skipIntro ? false : {opacity: 0}}
      animate={{opacity: ready ? 1 : 0}}
      transition={appearFade}
      style={{pointerEvents: ready ? undefined : "none"}}
    >
      <div className="relative grid w-full grid-cols-1 grid-rows-1 overflow-x-clip [overflow-anchor:none]">
        <AnimatePresence custom={direction} mode="sync" initial={false}>
          <motion.div
            key={segment ?? "showcase"}
            className="relative col-start-1 row-start-1 w-full"
            custom={direction}
            variants={!segment ? showcaseSlideVariants : tabSlideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={tabSlide}
          >
            <FrozenRouter>{children}</FrozenRouter>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
