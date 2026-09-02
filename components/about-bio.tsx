"use client";

import {HoverFadeOverlay} from "@/components/hover-fade-overlay";
import {SocialIcon} from "@/components/social-links";
import {experience, music, socials} from "@/lib/site";
import {EnvelopeIcon} from "@heroicons/react/24/solid";
import {motion} from "motion/react";
import Image from "next/image";
import type {ReactNode} from "react";

function logoFor(company: string) {
  const logo = experience.find((item) => item.company === company)?.logo;
  if (!logo) throw new Error(`Missing logo for ${company}`);
  return logo;
}

function socialHref(icon: (typeof socials)[number]["icon"]) {
  const href = socials.find((item) => item.icon === icon)?.href;
  if (!href) throw new Error(`Missing social link for ${icon}`);
  return href;
}

function LogoIcon({src}: {src: string}) {
  return (
    <Image
      src={src}
      alt=""
      width={20}
      height={20}
      className="size-5 rounded-[4px] object-cover"
    />
  );
}

function SoundCloudIcon() {
  return (
    <img
      src="/about/soundcloud.svg"
      alt=""
      width={20}
      height={20}
      className="size-5 rounded-[4px] object-cover"
    />
  );
}

function InlineLink({
  href,
  icon,
  label,
  children,
}: {
  href: string;
  icon?: ReactNode;
  /** Accessible name for icon-only links. */
  label?: string;
  children?: ReactNode;
}) {
  const iconOnly = children == null;
  return (
    <motion.a
      href={href}
      aria-label={label}
      {...(href.startsWith("http") ? {target: "_blank", rel: "noreferrer"} : {})}
      className={
        iconOnly
          ? "relative inline-flex items-center justify-center align-middle"
          : "relative inline-flex items-center gap-1.5 align-middle"
      }
      initial="rest"
      animate="rest"
      whileHover="hover"
    >
      {icon != null ? (
        <span
          aria-hidden
          className="flex size-5 shrink-0 items-center justify-center text-ink"
        >
          {icon}
        </span>
      ) : null}
      {children != null ? (
        <span className="text-body-md text-ink">{children}</span>
      ) : null}
      <HoverFadeOverlay className="rounded-md" />
    </motion.a>
  );
}

export function AboutBio() {
  return (
    <div className="flex flex-col gap-5 px-4 text-body-md text-ink">
      <p>
        Currently lead Product Design at{" "}
        <InlineLink
          href="https://prax.io"
          icon={<LogoIcon src="/about/prax.webp" />}
        >
          Prax
        </InlineLink>
        .
      </p>
      <p>
        Previously worked at{" "}
        <InlineLink
          href="/writing/caura"
          icon={<LogoIcon src={logoFor("Caura")} />}
        >
          Caura
        </InlineLink>{" "}
        &{" "}
        <InlineLink
          href="/writing/becoming"
          icon={<LogoIcon src={logoFor("JPMorgan")} />}
        >
          JPMorgan
        </InlineLink>
        .
      </p>
      <p>
        In my spare time, I enjoy{" "}
        <InlineLink href={music.href} icon={<SoundCloudIcon />}>
          making music
        </InlineLink>
        .
      </p>
      <p>
        The easiest way to reach me is by{" "}
        <InlineLink
          href={socialHref("email")}
          icon={<EnvelopeIcon className="size-5" />}
          label="email"
        />
        .
      </p>
      <p>
        You can also reach me on{" "}
        <InlineLink
          href={socialHref("x")}
          icon={<SocialIcon name="x" />}
          label="X"
        />
        ,{" "}
        <InlineLink
          href={socialHref("linkedin")}
          icon={<SocialIcon name="linkedin" />}
          label="LinkedIn"
        />
        , or{" "}
        <InlineLink
          href={socialHref("github")}
          icon={<SocialIcon name="github" />}
          label="GitHub"
        />
        .
      </p>
    </div>
  );
}
