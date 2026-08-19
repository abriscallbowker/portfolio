"use client";

import {AppearFade} from "@/components/appear";
import {useGreetingReveal} from "@/components/greeting-reveal";
import {appearFade} from "@/lib/motion";
import {LayoutRouterContext} from "next/dist/shared/lib/app-router-context.shared-runtime";
import {AnimatePresence, motion} from "motion/react";
import {useSelectedLayoutSegment} from "next/navigation";
import {useContext, useEffect, useRef, useState, type ReactNode} from "react";

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
      <div className="grid w-full grid-cols-1 grid-rows-1">
        <AnimatePresence mode="sync" initial={!skipIntro}>
          <motion.div
            key={segment ?? "writing"}
            className="col-start-1 row-start-1 w-full"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0, pointerEvents: "none"}}
            transition={{duration: 0.25, ease: [0.32, 0.72, 0, 1]}}
          >
            <FrozenRouter>{children}</FrozenRouter>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
