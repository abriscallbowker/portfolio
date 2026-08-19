"use client";

import {HomeIcon, TabBar} from "@/components/tab-bar";
import {useRouter} from "next/navigation";
import {useEffect} from "react";

type NavControlProps = {
  href: string;
  label: string;
  icon: "info" | "close" | "home";
  position?: "right" | "left";
  appearDelay?: number;
};

const shortcutForIcon = {
  info: "c",
  close: "Escape",
  home: "h",
} as const;

export function NavControl({
  href,
  label,
  icon,
  appearDelay = 0,
}: NavControlProps) {
  const router = useRouter();
  const shortcut = shortcutForIcon[icon];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }

      const pressed =
        shortcut === "Escape" ? event.key === "Escape" : event.key.toLowerCase() === shortcut;
      if (!pressed) return;

      event.preventDefault();
      router.push(href);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [href, router, shortcut]);

  return (
    <TabBar href={href} aria-label={label} className="home-button" appearDelay={appearDelay}>
      {icon === "info" ? <InfoIcon /> : icon === "close" ? <CloseIcon /> : <HomeIcon />}
    </TabBar>
  );
}

function InfoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 11.25V16.5M12 8.25V8.26"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
