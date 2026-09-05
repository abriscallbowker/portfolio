"use client";

import {HoverFadeOverlay} from "@/components/hover-fade-overlay";
import {SwappingLabel} from "@/components/swapping-label";
import {experience, type ExperienceItem} from "@/lib/site";
import {motion} from "motion/react";
import Image from "next/image";
import {useState} from "react";

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
