"use client";

import {useWritingFilter} from "@/components/writing-filter";
import {appearPop, hoverSpring, snappySpring} from "@/lib/motion";
import {formatListDate} from "@/lib/dates";
import {urlFor} from "@/sanity/lib/image";
import type {WritingListItem} from "@/sanity/lib/types";
import {AnimatePresence, motion, useReducedMotion} from "motion/react";
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

const itemEnter = {scale: 0.5, opacity: 0};
const itemShown = {scale: 1, opacity: 1};

function WritingListItem({
  post,
  showcaseCardId,
}: {
  post: WritingListItem;
  showcaseCardId?: string;
}) {
  const coverUrl = post.coverImage?.asset
    ? urlFor(post.coverImage).width(128).height(132).fit("crop").url()
    : null;

  return (
    <MotionLink
      href={
        showcaseCardId
          ? {
              pathname: `/writing/${post.slug}`,
              query: {card: showcaseCardId},
            }
          : `/writing/${post.slug}`
      }
      className="relative flex items-center px-4 py-2"
      initial="rest"
      animate="rest"
      whileHover="hover"
      transition={hoverSpring}
    >
      <motion.div className="flex flex-col gap-2" variants={textVariants}>
        <span className="text-body-md font-medium text-ink">{post.title}</span>
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
  );
}

export function WritingList({
  posts,
  filterable = false,
  showcaseCardId,
}: {
  posts: WritingListItem[];
  filterable?: boolean;
  showcaseCardId?: string;
}) {
  const {category} = useWritingFilter();
  const reduceMotion = useReducedMotion();
  const visible =
    filterable && category !== "all"
      ? posts.filter((post) => post.category === category)
      : posts;

  if (!filterable) {
    if (visible.length === 0) return null;

    return (
      <ul className="flex w-full flex-col gap-6">
        {visible.map((post) => (
          <li key={post._id}>
            <WritingListItem post={post} showcaseCardId={showcaseCardId} />
          </li>
        ))}
      </ul>
    );
  }

  const instant = Boolean(reduceMotion);
  const itemTransition = instant
    ? {duration: 0}
    : {
        layout: snappySpring,
        scale: appearPop,
        opacity: appearPop,
      };

  return (
    <motion.ul
      className="relative flex w-full flex-col gap-6"
      layout
      transition={instant ? {duration: 0} : snappySpring}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {visible.length === 0 ? (
          <motion.li
            key="empty"
            layout
            initial={instant ? false : itemEnter}
            animate={itemShown}
            exit={itemEnter}
            transition={itemTransition}
            className="origin-center"
          >
            <p className="px-4 text-body-md text-subdued">
              Nothing in this category yet.
            </p>
          </motion.li>
        ) : (
          visible.map((post) => (
            <motion.li
              key={post._id}
              layout
              initial={instant ? false : itemEnter}
              animate={itemShown}
              exit={itemEnter}
              transition={itemTransition}
              className="origin-center"
            >
              <WritingListItem post={post} showcaseCardId={showcaseCardId} />
            </motion.li>
          ))
        )}
      </AnimatePresence>
    </motion.ul>
  );
}
