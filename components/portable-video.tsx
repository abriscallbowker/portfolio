"use client";

import {useEffect, useRef} from "react";

export function PortableVideo({src, alt}: {src: string; alt?: string}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.muted = true;
    const play = () => {
      void el.play().catch(() => {});
    };

    play();
    el.addEventListener("canplay", play);
    return () => el.removeEventListener("canplay", play);
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      controls={false}
      preload="auto"
      aria-hidden={alt ? undefined : true}
      aria-label={alt || undefined}
      className="pointer-events-none block h-auto w-full"
    />
  );
}
