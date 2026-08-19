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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
  }, [pathname]);

  useEffect(() => {
    let touchY = 0;

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY > 0 && scrolledToBottom()) {
        setVisible(true);
        return;
      }
      if (event.deltaY < 0) {
        setVisible(false);
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? 0;
      const dy = touchY - y;
      if (dy > 10 && scrolledToBottom()) {
        setVisible(true);
      } else if (dy < -10) {
        setVisible(false);
      }
    };

    const onScroll = () => {
      if (!scrolledToBottom()) {
        setVisible(false);
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
        setVisible(true);
        return;
      }
      if (
        event.key === "ArrowUp" ||
        event.key === "PageUp" ||
        event.key === "Home"
      ) {
        setVisible(false);
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

  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-20 pt-6 max-md:pb-10">
      <motion.p
        className="text-body-xs text-subdued"
        initial={false}
        animate={{opacity: visible ? 0.5 : 0}}
        transition={visible ? linkTween : {duration: 0.12, ease: linkTween.ease}}
      >
        {site.fullName} © {new Date().getFullYear()}
      </motion.p>
    </footer>
  );
}
