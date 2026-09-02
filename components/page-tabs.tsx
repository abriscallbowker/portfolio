"use client";

import {linkTween} from "@/lib/motion";
import {motion} from "motion/react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useCallback, useLayoutEffect, useRef, useState} from "react";

const tabs = [
  {href: "/", label: "About"},
  {href: "/writing", label: "Writing"},
  {href: "/showcase", label: "Showcase"},
] as const;

const HOVER_GROW = 0.28;

type TabMetrics = {left: number; width: number};

export function PageTabs() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [metrics, setMetrics] = useState<TabMetrics[]>([]);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  const measure = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    const navLeft = nav.getBoundingClientRect().left;
    setMetrics(
      tabRefs.current.map((el) => {
        if (!el) return {left: 0, width: 0};
        const rect = el.getBoundingClientRect();
        return {left: rect.left - navLeft, width: rect.width};
      }),
    );
  }, []);

  useLayoutEffect(() => {
    measure();
    const nav = navRef.current;
    if (!nav) return;

    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, pathname]);

  const activeIndex = tabs.findIndex((tab) => tab.href === pathname);
  const hoverIndex = hoveredHref
    ? tabs.findIndex((tab) => tab.href === hoveredHref)
    : -1;
  const active = metrics[activeIndex];
  const hovered =
    hoverIndex >= 0 && hoverIndex !== activeIndex ? metrics[hoverIndex] : null;

  const growingRight = Boolean(active && hovered && hovered.left > active.left);
  const neighborIndex =
    activeIndex >= 0 && hovered
      ? growingRight
        ? activeIndex + 1
        : activeIndex - 1
      : -1;
  const neighbor = neighborIndex >= 0 ? metrics[neighborIndex] : null;
  const extra = active && neighbor
    ? (growingRight
        ? neighbor.left + neighbor.width - (active.left + active.width)
        : active.left - neighbor.left) * HOVER_GROW
    : 0;
  const left = (active?.left ?? 0) - (growingRight ? 0 : extra);
  const width = (active?.width ?? 0) + extra;

  return (
    <nav
      ref={navRef}
      aria-label="Sections"
      className="relative flex gap-6"
      onMouseLeave={() => setHoveredHref(null)}
    >
      {tabs.map((tab, index) => {
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            href={tab.href}
            scroll
            aria-current={isActive ? "page" : undefined}
            className={`relative pb-2 text-body-md ${
              isActive ? "text-ink" : "text-subdued hover:text-ink"
            }`}
            onMouseEnter={() => setHoveredHref(tab.href)}
            onFocus={() => setHoveredHref(tab.href)}
            onBlur={() => setHoveredHref(null)}
          >
            {tab.label}
          </Link>
        );
      })}
      {active ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute bottom-0 h-px bg-ink"
          initial={false}
          animate={{left, width, opacity: 1}}
          transition={linkTween}
        />
      ) : null}
    </nav>
  );
}
