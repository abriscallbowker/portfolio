"use client";

import {AppearFade} from "@/components/appear";
import {useGreetingReveal} from "@/components/greeting-reveal";
import {appearFade, tabSlide} from "@/lib/motion";
import {LayoutRouterContext} from "next/dist/shared/lib/app-router-context.shared-runtime";
import {AnimatePresence, motion} from "motion/react";
import {useSelectedLayoutSegment} from "next/navigation";
import {useContext, useEffect, useRef, useState, type ReactNode} from "react";

const tabSlideVariants = {
  enter: (direction: number) => ({opacity: 0, x: 32 * direction}),
  center: {opacity: 1, x: 0},
  exit: (direction: number) => ({
    opacity: 0,
    x: -32 * direction,
    pointerEvents: "none" as const,
  }),
};

function tabIndex(segment: string | null) {
  return segment === "about" ? 1 : 0;
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

export function SiteEnter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const {played} = useGreetingReveal();
  const [skipIntro] = useState(played);

  return (
    <AppearFade delay={0} instant={!skipIntro} className={className}>
      {children}
    </AppearFade>
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

  useEffect(() => {
    window.scrollTo({top: 0, left: 0, behavior: "auto"});
  }, [segment]);

  return (
    <motion.div
      className="w-full"
      initial={skipIntro ? false : {opacity: 0}}
      animate={{opacity: ready ? 1 : 0}}
      transition={appearFade}
      style={{pointerEvents: ready ? undefined : "none"}}
    >
      <div className="grid w-full grid-cols-1 grid-rows-1 overflow-x-clip">
        <AnimatePresence custom={direction} mode="sync" initial={false}>
          <motion.div
            key={segment ?? "archive"}
            className="col-start-1 row-start-1 w-full"
            custom={direction}
            variants={tabSlideVariants}
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
