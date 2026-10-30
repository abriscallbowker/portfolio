"use client";

import {useEffect, useRef, useState} from "react";
import {MediaGhost} from "@/components/media-ghost";

export function PortableVideo({src, alt}: {src: string; alt?: string}) {
  return <Video key={src} src={src} alt={alt} />;
}

function Video({src, alt}: {src: string; alt?: string}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.muted = true;
    let inView = false;
    let frameId: number | undefined;
    const hasFrameCallback = typeof el.requestVideoFrameCallback === "function";
    const markReady = () => setReady(true);
    const onLoadedData = () => {
      // Older browsers can reveal once a decoded frame is available.
      if (!hasFrameCallback && el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        markReady();
      }
    };
    const play = () => {
      if (!inView) return;
      void el.play().catch(() => {
        // Autoplay can be blocked in low-power mode. A decoded still frame
        // is ready to display even when playback cannot start.
        if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) markReady();
      });
    };

    if (hasFrameCallback) frameId = el.requestVideoFrameCallback(markReady);
    onLoadedData();
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) {
        el.currentTime = 0;
        play();
      } else {
        el.pause();
      }
    });
    observer.observe(el);
    el.addEventListener("loadeddata", onLoadedData);
    el.addEventListener("canplay", play);
    return () => {
      inView = false;
      observer.disconnect();
      el.pause();
      if (frameId !== undefined) el.cancelVideoFrameCallback(frameId);
      el.removeEventListener("loadeddata", onLoadedData);
      el.removeEventListener("canplay", play);
    };
  }, [src]);

  return (
    <MediaGhost ready={ready}>
      <video
        ref={ref}
        src={src}
        muted
        loop
        playsInline
        controls={false}
        preload="auto"
        // The browser switches from the fallback to the intrinsic ratio
        // as soon as metadata arrives, even before React hydrates.
        style={{aspectRatio: "auto 16 / 9"}}
        aria-hidden={alt ? undefined : true}
        aria-label={alt || undefined}
        className="pointer-events-none block h-auto w-full"
      />
    </MediaGhost>
  );
}
