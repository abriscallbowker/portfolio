"use client";

import {hoverSpring} from "@/lib/motion";
import {experience, type ExperienceItem} from "@/lib/site";
import {AnimatePresence, motion} from "motion/react";
import Image from "next/image";
import {useState} from "react";

function CompanyBadge({item}: {item: ExperienceItem}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const content = (
    <>
      <Image
        src={item.logo}
        alt=""
        width={20}
        height={20}
        className="size-5 rounded-[4px] object-cover"
      />
      <span className="text-body-md text-ink">{item.company}</span>
    </>
  );

  if (item.href) {
    return (
      <motion.a
        href={item.href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md px-[5px]"
        whileHover={{opacity: 0.6}}
        transition={hoverSpring}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <span
      className="relative inline-flex items-center gap-1.5 rounded-md px-[5px]"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {content}
      <AnimatePresence>
        {showTooltip && item.tooltip && (
          <motion.span
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 whitespace-nowrap rounded-md border border-gray-200 bg-white px-2 py-1 text-body-xs text-ink shadow-xs"
            initial={{opacity: 0, y: 4, x: "-50%"}}
            animate={{opacity: 1, y: 0, x: "-50%"}}
            exit={{opacity: 0, y: 4, x: "-50%"}}
            transition={hoverSpring}
          >
            {item.tooltip}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

export function ExperienceList() {
  return (
    <ul className="flex w-full flex-col gap-8 px-4">
      {experience.map((item) => (
        <li
          key={item.company}
          className="grid grid-cols-1 gap-1 md:grid-cols-[1fr_3fr] md:items-start md:gap-10"
        >
          <p className="text-overline text-subdued">{item.duration}</p>
          <div className="flex min-w-0 flex-wrap items-center gap-1">
            <span className="text-body-md text-ink">{item.role}</span>
            <span className="text-body-md text-ink">at</span>
            <CompanyBadge item={item} />
          </div>
        </li>
      ))}
    </ul>
  );
}
