"use client";

import {
  isShowcasePath,
  usePreviousPathname,
  useShowcaseReturn,
} from "@/components/route-history";
import {HomeIcon, TabBar} from "@/components/tab-bar";
import {useRouter} from "next/navigation";
import {useEffect, useState, useSyncExternalStore} from "react";
import {createPortal} from "react-dom";

const subscribeToClient = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

type NavControlProps = {
  href: string;
  label: string;
  icon: "info" | "close" | "home";
  position?: "right" | "left";
};

const shortcutForIcon = {
  info: "c",
  close: "Escape",
  home: "h",
} as const;

export function NavControl({
  href: defaultHref,
  label: defaultLabel,
  icon,
}: NavControlProps) {
  const router = useRouter();
  const mounted = useSyncExternalStore(subscribeToClient, clientSnapshot, serverSnapshot);
  const previousPathname = usePreviousPathname();
  const {returnCardId} = useShowcaseReturn();
  // Send the home button back to the showcase when that's where the
  // visitor came from, so it acts as a "return" rather than a reset.
  // A stored card id (from clicking a showcase card) also counts, so the
  // first back tap still restores that card after a refresh.
  const cameFromShowcase =
    icon === "home" &&
    (isShowcasePath(previousPathname) || Boolean(returnCardId));
  const href = cameFromShowcase ? "/" : defaultHref;
  const label = cameFromShowcase ? "Back to showcase" : defaultLabel;
  const shortcut = shortcutForIcon[icon];
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, {passive: true});
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      router.push(href, {scroll: false});
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [href, router, shortcut]);

  // Keep viewport positioning outside the article and its animation layers.
  // Only the inner link scales; the fixed shell keeps a stable compositor layer.
  if (!mounted) return null;

  return createPortal(
    <div className={scrolled ? "home-button-shell is-scrolled" : "home-button-shell"}>
      <TabBar href={href} aria-label={label} className="home-button">
        {icon === "info" ? <InfoIcon /> : icon === "close" ? <CloseIcon /> : <HomeIcon />}
      </TabBar>
    </div>,
    document.body,
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
