"use client";

import type {WritingHeading} from "@/lib/writing-headings";
import {useEffect, useState, type MouseEvent} from "react";

export function WritingHeadingNav({headings}: {headings: WritingHeading[]}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1200px)");
    const elements = headings.map(({id}) => document.getElementById(id));
    const moreSection = document.getElementById("writing-more");
    let frame = 0;

    const update = () => {
      frame = 0;
      if (!desktop.matches) return;
      if (moreSection && moreSection.getBoundingClientRect().top <= 112) {
        setActiveId(null);
        return;
      }
      let current: string | null = null;
      for (const element of elements) {
        if (element && element.getBoundingClientRect().top <= 112) {
          current = element.id;
        }
      }
      setActiveId(current);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(scheduleUpdate);
    const article = elements.find(Boolean)?.closest("article");
    if (article) observer.observe(article);
    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, {passive: true});
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [headings]);

  if (headings.length === 0) return null;

  function scrollToHeading(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const heading = document.getElementById(id);
    if (!heading) return;
    event.preventDefault();
    window.history.pushState(null, "", `#${id}`);
    heading.focus({preventScroll: true});
    heading.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      block: "start",
    });
  }

  return (
    <nav aria-label="Article headings" className="writing-heading-nav">
      <ol>
        {headings.map(({id, text, level}) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-label={text}
              aria-current={activeId === id ? "location" : undefined}
              className="writing-heading-link"
              onClick={(event) => scrollToHeading(event, id)}
            >
              <span className="writing-heading-label" aria-hidden="true">{text}</span>
              <span
                className="writing-heading-mark"
                style={{width: Math.max(8, 24 - (level - 1) * 4)}}
                aria-hidden="true"
              />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
