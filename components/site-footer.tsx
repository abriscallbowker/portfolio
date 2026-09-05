"use client";

import { SwappingLabel } from "@/components/swapping-label";
import { linkTween } from "@/lib/motion";
import { site } from "@/lib/site";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function scrolledToBottom(slack = 2) {
  const root = document.scrollingElement ?? document.documentElement;
  return root.scrollTop + window.innerHeight >= root.scrollHeight - slack;
}

const JAN_2015_MS = Date.UTC(2015, 0, 1);

function secondsSinceJan2015(now = Date.now()) {
  return Math.max(0, Math.floor((now - JAN_2015_MS) / 1000));
}

function hasFineHover() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function FooterSwap({
  primary,
  alternate,
  align,
  suppressHydrationWarning = false,
}: {
  primary: string;
  alternate: string;
  align: "left" | "right";
  suppressHydrationWarning?: boolean;
}) {
  const [active, setActive] = useState(false);
  const closeOnLeave = useRef(true);
  const rootRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!active) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setActive(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [active]);

  return (
    <button
      ref={rootRef}
      type="button"
      aria-label={`${primary}. ${alternate}`}
      className="inline-flex cursor-pointer touch-manipulation items-center opacity-50"
      onPointerEnter={(event) => {
        if (event.pointerType === "touch") return;
        closeOnLeave.current = true;
        setActive(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "touch" || !closeOnLeave.current) return;
        setActive(false);
      }}
      onFocus={() => {
        if (hasFineHover()) setActive(true);
      }}
      onBlur={() => {
        if (hasFineHover()) setActive(false);
      }}
      onClick={() => {
        if (hasFineHover()) return;
        closeOnLeave.current = false;
        setActive((value) => !value);
      }}
    >
      <SwappingLabel
        primary={primary}
        alternate={alternate}
        active={active}
        align={align}
        className={`text-body-xs text-subdued ${align === "right" ? "tabular-nums" : ""}`}
        heightClassName="h-[18px]"
        offset={9}
        suppressHydrationWarning={suppressHydrationWarning}
      />
    </button>
  );
}

export function HomeFooter() {
  const [seconds, setSeconds] = useState(secondsSinceJan2015);

  useEffect(() => {
    const tick = () => setSeconds(secondsSinceJan2015());
    tick();

    const delay = 1000 - (Date.now() % 1000);
    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      tick();
      intervalId = window.setInterval(tick, 1000);
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  return (
    // Cancel <main>'s pb-48 (needed to clear the fixed footer on other
    // pages) now that this footer lives inside PageFade with the about
    // content, so it doesn't leave a large empty pad below.
    <footer className="-mb-48 flex justify-center pb-10 pt-12">
      <div className="site-column flex w-full items-center justify-between px-4">
        <FooterSwap
          primary="51.51° N, 0.13° W"
          alternate="Currently working in London"
          align="left"
        />
        <FooterSwap
          primary={seconds.toLocaleString("en-US")}
          alternate="I fell in love with design in 2015"
          align="right"
          suppressHydrationWarning
        />
      </div>
    </footer>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isWriting = pathname === "/writing";
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
  }, [pathname]);

  useEffect(() => {
    let touchY = 0;

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY > 0 && scrolledToBottom()) {
        setRevealed(true);
        return;
      }
      if (event.deltaY < 0) {
        setRevealed(false);
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? 0;
      const dy = touchY - y;
      if (dy > 10 && scrolledToBottom()) {
        setRevealed(true);
      } else if (dy < -10) {
        setRevealed(false);
      }
    };

    const onScroll = () => {
      if (!scrolledToBottom()) {
        setRevealed(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (
        (event.key === "ArrowDown" ||
          event.key === "PageDown" ||
          event.key === " " ||
          event.key === "End") &&
        scrolledToBottom()
      ) {
        setRevealed(true);
        return;
      }
      if (
        event.key === "ArrowUp" ||
        event.key === "PageUp" ||
        event.key === "Home"
      ) {
        setRevealed(false);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // About renders HomeFooter inside PageFade so it slides with the page.
  // Writing has no site footer.
  if (isHome || isWriting) {
    return null;
  }

  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-20 pt-6 max-md:pb-10">
      <motion.p
        className="text-body-xs text-subdued"
        initial={false}
        animate={{ opacity: revealed ? 0.5 : 0 }}
        transition={
          revealed ? linkTween : { duration: 0.12, ease: linkTween.ease }
        }
      >
        {site.fullName} © {new Date().getFullYear()}
      </motion.p>
    </footer>
  );
}
