"use client";

import {useReducedMotion} from "motion/react";
import {usePathname} from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

const SHOWCASE_CARD_KEY = "showcase-return-card";

type RouteHistoryValue = {
  previousPathname: string | null;
  returnCardId: string | null;
  rememberShowcaseCard: (id: string) => void;
  takeShowcaseCard: () => string | null;
};

const RouteHistoryContext = createContext<RouteHistoryValue>({
  previousPathname: null,
  returnCardId: null,
  rememberShowcaseCard: () => {},
  takeShowcaseCard: () => null,
});

function firstSegment(pathname: string) {
  return pathname.split("/")[1] ?? "";
}

function readStoredCardId() {
  try {
    return sessionStorage.getItem(SHOWCASE_CARD_KEY);
  } catch {
    return null;
  }
}

function writeStoredCardId(id: string | null) {
  try {
    if (id) sessionStorage.setItem(SHOWCASE_CARD_KEY, id);
    else sessionStorage.removeItem(SHOWCASE_CARD_KEY);
  } catch {
    // Ignore private-mode / disabled storage.
  }
}

function ScrollToTop() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const isFirstNavigation = useRef(true);

  useLayoutEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    if (isShowcasePath(pathname)) {
      isFirstNavigation.current = false;
      const resetScroll = () => {
        window.scrollTo({top: 0, left: 0, behavior: "instant"});
      };
      resetScroll();
      // Reassert after the router applies its own navigation scroll handling.
      const frame = requestAnimationFrame(resetScroll);
      return () => cancelAnimationFrame(frame);
    }

    if (isFirstNavigation.current) {
      isFirstNavigation.current = false;
      return;
    }

    const top =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop;
    if (top <= 0) return;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [pathname, reduceMotion]);

  return null;
}

export function RouteHistoryProvider({children}: {children: ReactNode}) {
  const pathname = usePathname();
  const historyRef = useRef<{current: string; previous: string | null}>({
    current: pathname,
    previous: null,
  });
  const lastTakenRef = useRef<{id: string; at: number} | null>(null);
  const [returnCardId, setReturnCardId] = useState<string | null>(null);
  const returnCardIdRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    const stored = readStoredCardId();
    if (stored) {
      returnCardIdRef.current = stored;
      setReturnCardId(stored);
    }
  }, []);

  if (historyRef.current.current !== pathname) {
    // Moving between pages of the same section (e.g. article to article
    // via the More list) keeps `previous` pointing at where the visitor
    // entered the section from.
    const sameSection =
      firstSegment(pathname) !== "" &&
      firstSegment(historyRef.current.current) === firstSegment(pathname);
    historyRef.current = {
      current: pathname,
      previous: sameSection
        ? historyRef.current.previous
        : historyRef.current.current,
    };
  }

  const rememberShowcaseCard = useCallback((id: string) => {
    lastTakenRef.current = null;
    returnCardIdRef.current = id;
    setReturnCardId(id);
    writeStoredCardId(id);
  }, []);

  const takeShowcaseCard = useCallback(() => {
    const fresh = returnCardIdRef.current ?? readStoredCardId();
    if (fresh) {
      lastTakenRef.current = {id: fresh, at: Date.now()};
      returnCardIdRef.current = null;
      setReturnCardId(null);
      writeStoredCardId(null);
      return fresh;
    }
    const last = lastTakenRef.current;
    if (last && Date.now() - last.at < 1000) return last.id;
    return null;
  }, []);

  const value = useMemo(
    () => ({
      previousPathname: historyRef.current.previous,
      returnCardId,
      rememberShowcaseCard,
      takeShowcaseCard,
    }),
    [pathname, rememberShowcaseCard, returnCardId, takeShowcaseCard],
  );

  return (
    <RouteHistoryContext.Provider value={value}>
      <ScrollToTop />
      {children}
    </RouteHistoryContext.Provider>
  );
}

/**
 * Pathname of the route the visitor was on before entering the current
 * section, or null on a fresh page load. Consecutive routes sharing a
 * first path segment count as one section, so hopping between articles
 * doesn't shift it.
 */
export function usePreviousPathname() {
  return useContext(RouteHistoryContext).previousPathname;
}

export function useShowcaseReturn() {
  const {returnCardId, rememberShowcaseCard, takeShowcaseCard} =
    useContext(RouteHistoryContext);
  return {returnCardId, rememberShowcaseCard, takeShowcaseCard};
}

export function isShowcasePath(pathname: string | null) {
  return pathname === "/" || pathname === "/showcase";
}
