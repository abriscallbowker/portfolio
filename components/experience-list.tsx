"use client";

import {HoverFadeOverlay} from "@/components/hover-fade-overlay";
import {hoverSpring} from "@/lib/motion";
import {experience, type ExperienceItem} from "@/lib/site";
import {motion, useReducedMotion} from "motion/react";
import Image from "next/image";
import {useLayoutEffect, useRef, useState} from "react";

function SwappingLabel({
  primary,
  alternate,
  active,
}: {
  primary: string;
  alternate: string;
  active: boolean;
}) {
  const primaryRef = useRef<HTMLSpanElement>(null);
  const alternateRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number>();
  const animateWidth = useRef(false);
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? {duration: 0} : hoverSpring;
  const widthTransition = animateWidth.current ? transition : {duration: 0};

  useLayoutEffect(() => {
    const el = active ? alternateRef.current : primaryRef.current;
    if (el) setWidth(el.offsetWidth);
  }, [active, primary, alternate]);

  useLayoutEffect(() => {
    if (width !== undefined) animateWidth.current = true;
  }, [width]);

  return (
    <motion.span
      className="relative inline-block h-6 overflow-hidden align-bottom"
      initial={false}
      animate={{width: width ?? "auto"}}
      transition={widthTransition}
    >
      <motion.span
        ref={primaryRef}
        className="absolute top-0 left-0 whitespace-nowrap text-body-md text-ink"
        initial={false}
        animate={{y: active ? -12 : 0, opacity: active ? 0 : 1}}
        transition={transition}
      >
        {primary}
      </motion.span>
      <motion.span
        ref={alternateRef}
        className="absolute top-0 left-0 whitespace-nowrap text-body-md text-ink"
        initial={false}
        animate={{y: active ? 0 : 12, opacity: active ? 1 : 0}}
        transition={transition}
      >
        {alternate}
      </motion.span>
    </motion.span>
  );
}

function CompanyBadge({item}: {item: ExperienceItem}) {
  const [hovered, setHovered] = useState(false);
  const hoverHandlers = item.tooltip
    ? {
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
      }
    : {};

  const content = (
    <>
      <Image
        src={item.logo}
        alt=""
        width={20}
        height={20}
        className="size-5 rounded-[4px] object-cover"
      />
      {item.tooltip ? (
        <SwappingLabel
          primary={item.company}
          alternate={item.tooltip}
          active={hovered}
        />
      ) : (
        <span className="text-body-md text-ink">{item.company}</span>
      )}
    </>
  );

  if (item.href) {
    return (
      <motion.a
        href={item.href}
        target="_blank"
        rel="noreferrer"
        className="relative inline-flex items-center gap-1.5 rounded-md px-[5px]"
        initial="rest"
        animate="rest"
        whileHover="hover"
        {...hoverHandlers}
      >
        {content}
        <HoverFadeOverlay className="rounded-md" />
      </motion.a>
    );
  }

  return (
    <span
      className="relative inline-flex items-center gap-1.5 rounded-md px-[5px]"
      aria-label={
        item.tooltip ? `${item.company}. ${item.tooltip}` : undefined
      }
      {...hoverHandlers}
    >
      {content}
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
