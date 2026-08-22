"use client";

import {usePathname} from "next/navigation";
import {createContext, useContext, useRef, type ReactNode} from "react";

const RouteHistoryContext = createContext<string | null>(null);

function firstSegment(pathname: string) {
  return pathname.split("/")[1] ?? "";
}

export function RouteHistoryProvider({children}: {children: ReactNode}) {
  const pathname = usePathname();
  const historyRef = useRef<{current: string; previous: string | null}>({
    current: pathname,
    previous: null,
  });

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

  return (
    <RouteHistoryContext.Provider value={historyRef.current.previous}>
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
  return useContext(RouteHistoryContext);
}
