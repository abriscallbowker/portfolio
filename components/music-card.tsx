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
            <span
              className="inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] bg-[#d6d6d6] p-0.5"
              aria-hidden
            >
              <img
                src="/about/soundcloud.svg"
                alt=""
                width={12}
                height={12}
                className="size-3 object-contain brightness-0 invert"
              />
            </span>
          </span>
        </div>
      </motion.a>
      <div className="flex flex-col items-center gap-2 opacity-40">
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

