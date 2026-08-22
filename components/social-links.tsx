"use client";

import {HoverFadeOverlay} from "@/components/hover-fade-overlay";
import {socials} from "@/lib/site";
import {motion} from "motion/react";

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
            <span className="flex-1 text-body-md text-subdued">{item.title}</span>
            <span className="inline-flex items-center gap-2 text-body-md text-subdued">
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

function SocialIcon({name}: {name: (typeof socials)[number]["icon"]}) {
  if (name === "email") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="m4 7 8 7 8-7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "x") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.7 3H20.4l-6.2 7.1L21.5 21h-5.3l-4.2-5.5L7.2 21H4.4l6.6-7.6L2.7 3h5.5l3.8 5L17.7 3Zm-1 16.2h1.5L7.4 4.7H5.8l10.9 14.5Z" />
      </svg>
    );
  }

  if (name === "github") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2.2c-5.4 0-9.8 4.4-9.8 9.8 0 4.3 2.8 8 6.7 9.3.5.1.7-.2.7-.5v-1.7c-2.7.6-3.3-1.3-3.3-1.3-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.2-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.3 9.3 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.3.1 2.6.6.7 1 1.6 1 2.7 0 3.8-2.3 4.6-4.5 4.9.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5 3.9-1.3 6.7-5 6.7-9.3 0-5.4-4.4-9.8-9.8-9.8Z" />
      </svg>
    );
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.5 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.4V9h3.4v1.6h.1c.5-.9 1.6-1.8 3.3-1.8 3.5 0 4.2 2.3 4.2 5.3v6.4ZM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2ZM7.1 20.5H3.5V9h3.6v11.5Z" />
    </svg>
  );
}
