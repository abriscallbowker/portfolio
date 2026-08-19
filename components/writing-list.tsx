"use client";

import {hoverSpring} from "@/lib/motion";
import {formatListDate} from "@/lib/dates";
import {urlFor} from "@/sanity/lib/image";
import type {WritingListItem} from "@/sanity/lib/types";
import {motion} from "motion/react";
import Image from "next/image";
import Link from "next/link";

const MotionLink = motion.create(Link);

const textVariants = {
  rest: {opacity: 1},
  hover: {opacity: 0.6},
};

const coverVariants = {
  rest: {scale: 0},
  hover: {scale: 1},
};

export function WritingList({posts}: {posts: WritingListItem[]}) {
  return (
    <ul className="flex w-full flex-col gap-6">
      {posts.map((post) => {
        const coverUrl = post.coverImage?.asset
          ? urlFor(post.coverImage).width(128).height(132).fit("crop").url()
          : null;

        return (
          <li key={post._id}>
            <MotionLink
              href={`/writing/${post.slug}`}
              className="relative flex items-center px-4 py-2"
              initial="rest"
              animate="rest"
              whileHover="hover"
              transition={hoverSpring}
            >
              <motion.div className="flex flex-col gap-2" variants={textVariants}>
                <span className="text-body-md font-medium text-ink">
                  {post.title}
                </span>
                <span className="text-body-sm text-subdued">
                  {formatListDate(post.publishedAt)}
                </span>
              </motion.div>
              {coverUrl ? (
                <div className="pointer-events-none absolute top-1/2 right-4 hidden size-16 -translate-y-1/2 overflow-hidden md:block">
                  <motion.div
                    aria-hidden
                    className="size-full origin-center"
                    variants={coverVariants}
                  >
                    <Image
                      src={coverUrl}
                      alt=""
                      width={64}
                      height={66}
                      className="h-[66px] w-16 max-w-none object-cover"
                    />
                  </motion.div>
                </div>
              ) : null}
            </MotionLink>
          </li>
        );
      })}
    </ul>
  );
}
