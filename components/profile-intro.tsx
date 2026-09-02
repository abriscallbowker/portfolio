"use client";

import {AppearFade, AppearPop} from "@/components/appear";
import {Greeting} from "@/components/greeting";
import {useGreetingReveal} from "@/components/greeting-reveal";
import {PageTabs} from "@/components/page-tabs";
import {CategoryFilter} from "@/components/writing-filter";
import {hoverSpring, tabSlide} from "@/lib/motion";
import {site} from "@/lib/site";
import {AnimatePresence, motion, useReducedMotion} from "motion/react";
import Image from "next/image";
import {usePathname} from "next/navigation";
import {useRef, useState} from "react";

const tabOrder = ["/", "/writing", "/showcase"];

// Matches PageFade's slide so the filter moves with the page content:
// entering from a lower-index tab slides in from the right, and vice versa.
const filterSlideVariants = {
  enter: (direction: number) => ({height: 0, opacity: 0, x: 32 * direction}),
  center: {height: "auto", opacity: 1, x: 0},
  exit: (direction: number) => ({height: 0, opacity: 0, x: -32 * direction}),
};

export function ProfileIntro({showTabs = false}: {showTabs?: boolean}) {
  const {played, ready} = useGreetingReveal();
  const [skipIntro] = useState(played);
  const reduceMotion = useReducedMotion();
  const instant = skipIntro || Boolean(reduceMotion);
  const pathname = usePathname();
  const isWriting = pathname === "/writing";

  const tabIndex = tabOrder.indexOf(pathname);
  const previousIndex = useRef(tabIndex);
  const directionRef = useRef(1);
  if (tabIndex !== -1 && previousIndex.current !== tabIndex) {
    directionRef.current =
      previousIndex.current === -1 || tabIndex > previousIndex.current ? 1 : -1;
    previousIndex.current = tabIndex;
  }
  const direction = directionRef.current;

  return (
    <section className="mx-auto flex w-full max-w-[640px] flex-col gap-6 px-4">
      <div className="flex flex-col gap-4">
        <AppearPop className="inline-flex size-14 origin-center" instant={instant}>
          <motion.div
            className="size-14 origin-center"
            whileHover={{scale: 1.02}}
            transition={hoverSpring}
          >
            <Image
              src={site.profileImage}
              alt={site.fullName}
              width={56}
              height={56}
              className="size-14 rounded-full object-cover"
              priority
            />
          </motion.div>
        </AppearPop>
        <Greeting />
      </div>
      {showTabs ? (
        <AppearFade delay={0} visible={ready} instant={skipIntro}>
          <div className="flex flex-col">
            <PageTabs />
            <AnimatePresence initial={false} custom={direction}>
              {isWriting ? (
                <motion.div
                  key="category-filter"
                  custom={direction}
                  variants={filterSlideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={reduceMotion ? {duration: 0} : tabSlide}
                >
                  <div className="pt-4">
                    <CategoryFilter />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </AppearFade>
      ) : null}
    </section>
  );
}
