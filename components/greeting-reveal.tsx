"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {usePathname} from "next/navigation";

type GreetingRevealContextValue = {
  played: boolean;
  ready: boolean;
  complete: () => void;
};

const GreetingRevealContext = createContext<GreetingRevealContextValue>({
  played: true,
  ready: true,
  complete: () => {},
});

function isSitePath(pathname: string) {
  return pathname === "/" || pathname === "/archive" || pathname === "/gallery";
}

export function GreetingRevealProvider({children}: {children: ReactNode}) {
  const pathname = usePathname();
  const wasOnSite = useRef(false);
  const [played, setPlayed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onSite = isSitePath(pathname);
    if (wasOnSite.current && !onSite) {
      setPlayed(true);
      setReady(true);
    }
    wasOnSite.current = onSite;
  }, [pathname]);

  const complete = useCallback(() => {
    setPlayed(true);
    setReady(true);
  }, []);

  const value = useMemo(
    () => ({played, ready, complete}),
    [played, ready, complete],
  );

  return (
    <GreetingRevealContext.Provider value={value}>
      {children}
    </GreetingRevealContext.Provider>
  );
}

export function useGreetingReveal() {
  return useContext(GreetingRevealContext);
}
