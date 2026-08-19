"use client";

import {hoverSpring} from "@/lib/motion";
import {music} from "@/lib/site";
import {motion} from "motion/react";
import Image from "next/image";

export function MusicCard() {
  return (
    <div className="flex w-full flex-col gap-4">
      <motion.a
        href={music.href}
        target="_blank"
        rel="noreferrer"
        className="flex flex-col gap-1.5 rounded-2xl bg-foreground p-1.5"
        whileHover={{opacity: 0.8}}
        transition={hoverSpring}
      >
        <div className="flex items-center gap-4 rounded-xl bg-inset p-2">
          <Image
            src={music.cover}
            alt={`${music.title} cover`}
            width={56}
            height={56}
            className="size-14 rounded-lg object-cover"
          />
          <div className="flex min-w-0 flex-col">
            <p className="truncate text-body-md text-ink">{music.title}</p>
            <p className="truncate text-body-sm text-subdued">{music.artist}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 px-1.5 pb-1">
          <p className="text-body-xs text-subdued">{music.date}</p>
          <span className="inline-flex items-center gap-1.5 text-body-xs text-subdued">
            Listen on SoundCloud
            <SoundCloudIcon />
          </span>
        </div>
      </motion.a>
      <div className="flex flex-col items-center gap-2 opacity-20">
        <Image
          src={music.arrow}
          alt=""
          width={28}
          height={36}
          className="h-9 w-7 rotate-180"
        />
        <p className="text-center font-hand text-[18px] leading-6 text-ink">
          {music.note}
        </p>
      </div>
    </div>
  );
}

function SoundCloudIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M1.5 14.2c0 1.2.9 2.1 2 2.1h.3V12c-.1-1.6 1.1-3 2.7-3.1.4 0 .8.1 1.2.2V8.4C6.3 6.5 4.2 6 2.6 7.3 1.7 8.1 1.5 9.3 1.5 10.4v3.8Zm5.2 2.1h8.8c2.4 0 4.3-1.9 4.3-4.2 0-2.2-1.7-4-3.9-4.2-.7-2.4-2.9-4.1-5.5-4.1-1.7 0-3.2.7-4.3 1.9v10.6h.6Z" />
    </svg>
  );
}
