"use client";

import {HoverFadeOverlay} from "@/components/hover-fade-overlay";
import {socials} from "@/lib/site";
import {motion} from "motion/react";
import Image from "next/image";

export function SocialLinks() {
  return (
    <ul className="flex w-full flex-col">
      {socials.map((item) => (
        <li key={item.title}>
          <motion.a
            href={item.href}
            {...(item.href.startsWith("http")
              ? {target: "_blank", rel: "noreferrer"}
              : {})}
            className="relative flex items-center gap-3 px-4 py-2"
            initial="rest"
            animate="rest"
            whileHover="hover"
          >
            <span className="flex size-5 items-center justify-center text-ink">
              <SocialIcon name={item.icon} />
            </span>
            <span className="sr-only">{item.title}: </span>
            <span className="ml-auto inline-flex items-center gap-2 text-body-md text-subdued">
              {item.handle}
              <ArrowUpRight />
            </span>
            <HoverFadeOverlay />
          </motion.a>
        </li>
      ))}
    </ul>
  );
}

function ArrowUpRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 17 17 7M9 7h8v8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SocialIcon({name}: {name: (typeof socials)[number]["icon"]}) {
  return (
    <Image
      src={`/icons/${name}.svg`}
      alt=""
      width={20}
      height={20}
      className="size-5 opacity-75"
    />
  );
}
