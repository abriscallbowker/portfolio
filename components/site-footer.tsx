"use client";

import {linkTween} from "@/lib/motion";
import {site} from "@/lib/site";
import {motion} from "motion/react";
import {usePathname} from "next/navigation";
import {useEffect, useState} from "react";

function scrolledToBottom(slack = 2) {
  const root = document.scrollingElement ?? document.documentElement;
  return root.scrollTop + window.innerHeight >= root.scrollHeight - slack;
}

export function SiteFooter() {
  const pathname = usePathname();
  const staticFooter = pathname === "/" || pathname === "/about";
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

    window.addEventListener("wheel", onWheel, {passive: true});
    window.addEventListener("touchstart", onTouchStart, {passive: true});
    window.addEventListener("touchmove", onTouchMove, {passive: true});
    window.addEventListener("scroll", onScroll, {passive: true});
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (staticFooter) {
    return (
      // The negative top margin cancels most of the layout's pb-48 on
      // <main>, which exists to clear the fixed footer on other pages.
      <footer className="-mt-30 flex justify-center px-4 pb-10 pt-6">
        <p className="text-body-xs text-subdued opacity-50">
          {site.fullName} © {new Date().getFullYear()}
        </p>
      </footer>
    );
  }

  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-20 pt-6 max-md:pb-10">
      <motion.p
        className="text-body-xs text-subdued"
        initial={false}
        animate={{opacity: revealed ? 0.5 : 0}}
        transition={revealed ? linkTween : {duration: 0.12, ease: linkTween.ease}}
      >
        {site.fullName} © {new Date().getFullYear()}
      </motion.p>
    </footer>
  );
}
