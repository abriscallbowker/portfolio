"use client";

import {AppearFade, AppearPop} from "@/components/appear";
import {Greeting} from "@/components/greeting";
import {useGreetingReveal} from "@/components/greeting-reveal";
import {PageTabs} from "@/components/page-tabs";
import {hoverSpring} from "@/lib/motion";
import {site} from "@/lib/site";
import {motion, useReducedMotion} from "motion/react";
import Image from "next/image";
import {useState} from "react";

export function ProfileIntro({showTabs = false}: {showTabs?: boolean}) {
  const {played, ready} = useGreetingReveal();
  const [skipIntro] = useState(played);
  const reduceMotion = useReducedMotion();
  const instant = skipIntro || Boolean(reduceMotion);

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
          <PageTabs />
        </AppearFade>
      ) : null}
    </section>
  );
}
