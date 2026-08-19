"use client";

import {hoverSpring} from "@/lib/motion";
import {experience} from "@/lib/site";
import {motion} from "motion/react";
import Image from "next/image";

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
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md px-[5px]"
            >
              <motion.span
                className="inline-flex"
                whileHover={{scale: 1.02}}
                transition={hoverSpring}
              >
                <Image
                  src={item.logo}
                  alt=""
                  width={20}
                  height={20}
                  className="size-5 rounded-[4px] object-cover"
                />
              </motion.span>
              <span className="text-body-md text-ink">{item.company}</span>
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
