"use client";

import { appearScale, scaleOut, snappySpring } from "@/lib/motion";
import {
  PHONE_ASPECT,
  SCREENSHOT_IMAGE_SIZES,
  screenshotImageSize,
  screenshotMediaUrl,
} from "@/lib/screenshot-media";
import type { SanityImageValue, ScreenshotItem } from "@/sanity/lib/types";
import {
  animate,
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

const MD_QUERY = "(min-width: 810px)";
const DRAG_CLICK_THRESHOLD = 8;
const SNAP_IDLE_MS = 90;
const LAPTOP_ASPECT = 16 / 10;
const SLOT_ANGLE = (42 * Math.PI) / 180;
const MAX_THETA = (70 * Math.PI) / 180;
const DEPTH_PAD = 56;
const PHONE_DEPTH_LAYERS = 4;
const LAPTOP_DEPTH_LAYERS = 4;
const DEPTH_LAYER_GAP = 2;
const MIN_CARD_HEIGHT = 140;
const MOBILE_LAPTOP_INSET = 32;
const CAPTION_RESERVE = 128;
const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatScreenshotDate(date: ScreenshotItem["date"]) {
  const month = date?.month;
  const year = date?.year;
  if (typeof month !== "number" || typeof year !== "number") return null;
  const label = MONTH_LABELS[month - 1];
  return label ? `${label} ${year}` : null;
}

type LayoutOpts = {
  md: boolean;
  maxHeight: number;
  containerWidth: number;
};

type CardSize = {
  width: number;
  height: number;
  aspect: number;
};

function idealHeight(md: boolean) {
  return md ? 440 : 340;
}

function cardGap(md: boolean) {
  return md ? 80 : 20;
}

function bottomClearance(md: boolean) {
  return md ? 88 : 24;
}

function mediaAspect(item: ScreenshotItem) {
  const dimensions = item.image?.asset?.metadata?.dimensions;
  if (dimensions?.width && dimensions.height > 0) {
    return dimensions.width / dimensions.height;
  }
  return item.type === "laptop" ? LAPTOP_ASPECT : PHONE_ASPECT;
}

function itemSize(item: ScreenshotItem, opts: LayoutOpts): CardSize {
  const aspect = mediaAspect(item);
  const heightCap = Math.min(
    idealHeight(opts.md),
    Math.max(MIN_CARD_HEIGHT, opts.maxHeight),
  );

  if (
    !opts.md &&
    item.type === "laptop" &&
    opts.containerWidth > MOBILE_LAPTOP_INSET
  ) {
    const maxWidth = opts.containerWidth - MOBILE_LAPTOP_INSET;
    let width = maxWidth;
    let height = aspect > 0 ? width / aspect : heightCap;
    if (height > heightCap) {
      height = heightCap;
      width = height * aspect;
    }
    return { width, height, aspect };
  }

  return { width: heightCap * aspect, height: heightCap, aspect };
}

function wrapX(value: number, setWidth: number) {
  if (setWidth <= 0) return 0;
  const wrapped = value % setWidth;
  return wrapped > 0 ? wrapped - setWidth : wrapped;
}

const emptySubscribe = () => () => {};

function layoutSet(items: ScreenshotItem[], gap: number, opts: LayoutOpts) {
  const sizes = items.map((item) => itemSize(item, opts));
  const widths = sizes.map((size) => size.width);
  const starts: number[] = [];
  let cursor = 0;
  for (const width of widths) {
    starts.push(cursor);
    cursor += width + gap;
  }
  return { widths, starts, setWidth: cursor, sizes };
}

function useIsMd() {
  const [md, setMd] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(MD_QUERY);
    const sync = () => setMd(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return md;
}

function useCarouselBudget(
  md: boolean,
  enabled: boolean,
  sectionRef: RefObject<HTMLElement | null>,
) {
  const [maxCardHeight, setMaxCardHeight] = useState(() => idealHeight(md));

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!enabled || !section) return;

    const update = () => {
      const vv = window.visualViewport;
      const viewportBottom =
        (vv?.offsetTop ?? 0) + (vv?.height ?? window.innerHeight);
      const top = section.getBoundingClientRect().top;
      const available =
        viewportBottom - top - CAPTION_RESERVE - bottomClearance(md);
      const next = Math.max(
        MIN_CARD_HEIGHT,
        Math.min(idealHeight(md), available - DEPTH_PAD),
      );
      setMaxCardHeight((prev) => (Math.abs(prev - next) < 0.5 ? prev : next));
    };

    update();
    const viewport = window.visualViewport;
    window.addEventListener("resize", update);
    viewport?.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      viewport?.removeEventListener("resize", update);
    };
  }, [enabled, md, sectionRef]);

  return maxCardHeight;
}

function wheelDelta(event: WheelEvent) {
  const line =
    event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
  return (event.deltaX + event.deltaY) * line;
}

export function ShowcaseCarousel({ items }: { items: ScreenshotItem[] }) {
  const reduceMotion = useReducedMotion();
  const md = useIsMd();
  const [activeId, setActiveId] = useState(items[0]?._id ?? null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [zoomedItem, setZoomedItem] = useState<ScreenshotItem | null>(null);
  const canPortal = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const activeIdRef = useRef(activeId);
  const reduceMotionRef = useRef(Boolean(reduceMotion));
  const draggingRef = useRef(false);
  const snappingRef = useRef(false);
  const snapTimerRef = useRef<number | null>(null);
  const snapAnimationRef = useRef<ReturnType<typeof animate> | null>(null);
  const dragMovedRef = useRef(0);
  const pointerRef = useRef<{ id: number; lastX: number } | null>(null);
  const copiesRef = useRef(3);
  const itemsRef = useRef(items);
  const initializedRef = useRef(false);
  const zoomedRef = useRef(false);
  const layoutOptsRef = useRef<LayoutOpts>({
    md,
    maxHeight: idealHeight(md),
    containerWidth: 0,
  });

  const maxCardHeight = useCarouselBudget(md, items.length > 0, sectionRef);
  const x = useMotionValue(0);
  const gap = cardGap(md);
  const layoutOpts = useMemo<LayoutOpts>(
    () => ({ md, maxHeight: maxCardHeight, containerWidth }),
    [containerWidth, maxCardHeight, md],
  );
  const layout = useMemo(
    () => layoutSet(items, gap, layoutOpts),
    [gap, items, layoutOpts],
  );
  const trackHeight = layout.sizes.reduce(
    (max, size) => Math.max(max, size.height),
    MIN_CARD_HEIGHT,
  );
  const active =
    items.find((item) => item._id === activeId) ?? items[0] ?? null;

  const copies = useMemo(() => {
    if (items.length === 0 || containerWidth <= 0) return 3;
    if (layout.setWidth <= 0) return 3;
    return Math.max(3, Math.ceil(containerWidth / layout.setWidth) + 2);
  }, [containerWidth, items.length, layout.setWidth]);

  useLayoutEffect(() => {
    activeIdRef.current = activeId;
    itemsRef.current = items;
    reduceMotionRef.current = Boolean(reduceMotion);
    copiesRef.current = copies;
    layoutOptsRef.current = layoutOpts;
    zoomedRef.current = zoomedItem !== null;
  }, [activeId, copies, items, layoutOpts, reduceMotion, zoomedItem]);

  const loopItems = useMemo(
    () =>
      Array.from({ length: copies }, (_, copy) =>
        items.map((item) => ({ item, copy })),
      ).flat(),
    [copies, items],
  );

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => setContainerWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    initializedRef.current = false;
  }, [items.length]);

  useLayoutEffect(() => {
    if (items.length === 0 || containerWidth <= 0) return;
    const { setWidth, widths, starts } = layout;
    if (setWidth <= 0 || widths.length === 0) return;

    const viewCenter = containerWidth / 2;
    if (!initializedRef.current) {
      initializedRef.current = true;
      x.set(-setWidth + viewCenter - widths[0] / 2);
      setActiveId(items[0]._id);
      return;
    }

    if (draggingRef.current || snappingRef.current) return;

    const index = Math.max(
      0,
      items.findIndex((item) => item._id === activeIdRef.current),
    );
    const current = x.get();
    let best = current;
    let bestDist = Infinity;
    for (let copy = 0; copy < copies; copy += 1) {
      const target =
        viewCenter - (copy * setWidth + starts[index] + widths[index] / 2);
      const dist = Math.abs(target - current);
      if (dist < bestDist) {
        bestDist = dist;
        best = target;
      }
    }
    x.set(best);
  }, [containerWidth, copies, items, layout, x]);

  const applyTransforms = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const viewWidth = container.clientWidth;
    const viewCenter = viewWidth / 2;
    const opts = layoutOptsRef.current;
    const currentGap = cardGap(opts.md);
    const currentItems = itemsRef.current;
    const { setWidth } = layoutSet(currentItems, currentGap, opts);
    const avgStride =
      currentItems.length > 0 ? setWidth / currentItems.length : opts.maxHeight;
    const rotRadius = Math.max(220, avgStride / SLOT_ANGLE);
    const flatten = reduceMotionRef.current;

    if (setWidth > 0) {
      x.set(wrapX(x.get(), setWidth));
    }

    let cursor = x.get();
    let closestId = currentItems[0]?._id ?? null;
    let closestDist = Infinity;
    const fullSlots = 2;
    const fadeSlots = 0.7;

    cardRefs.current.forEach((el) => {
      if (!el) return;
      const aspect = Number(el.dataset.aspect || PHONE_ASPECT);
      const width = el.parentElement?.offsetWidth || opts.maxHeight * aspect;
      const itemCenter = cursor + width / 2;
      const dx = itemCenter - viewCenter;
      const theta = Math.max(-MAX_THETA, Math.min(MAX_THETA, dx / rotRadius));
      const rotateY = flatten ? 0 : theta * (180 / Math.PI);
      const scale = flatten ? 1 : 0.56 + 0.44 * Math.cos(theta);
      const translateZ = flatten ? 0 : rotRadius * (Math.cos(theta) - 1) * 0.9;
      const translateX = flatten
        ? 0
        : (rotRadius * Math.sin(theta) - dx) * 0.85;
      const dist = Math.abs(dx);
      const wrapDist =
        setWidth > 0 ? Math.min(dist, Math.abs(dist - setWidth)) : dist;
      const edgeDistance = dist - width / 2;
      const wrapEdge = wrapDist - width / 2;
      const slot = avgStride > 0 ? Math.max(0, edgeDistance) / avgStride : 0;
      const fadeT = Math.max(0, Math.min(1, (slot - fullSlots) / fadeSlots));
      const opacity =
        fadeT <= 0 ? 1 : fadeT >= 1 ? 0 : 1 - fadeT * fadeT * (3 - 2 * fadeT);
      const interactive = opacity > 0.2;
      const offscreen = wrapEdge > viewWidth;

      el.style.transform = flatten
        ? "none"
        : `perspective(1000px) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
      el.style.pointerEvents = interactive ? "auto" : "none";
      const stack = String(Math.round(1000 + translateZ));
      el.style.zIndex = stack;
      if (el.parentElement) {
        el.parentElement.style.opacity = String(opacity);
        el.parentElement.style.visibility = offscreen ? "hidden" : "visible";
        el.parentElement.style.zIndex = stack;
        el.parentElement.style.pointerEvents = interactive ? "auto" : "none";
      }

      const id = el.dataset.id ?? null;
      if (id && dist < closestDist) {
        closestDist = dist;
        closestId = id;
      }

      cursor += width + currentGap;
    });

    if (closestId && closestId !== activeIdRef.current) {
      activeIdRef.current = closestId;
      setActiveId(closestId);
    }
  }, [x]);

  useAnimationFrame(() => {
    if (itemsRef.current.length === 0) return;
    applyTransforms();
  });

  const animateSnap = useCallback(
    (target: number) => {
      const from = x.get();
      if (!Number.isFinite(target) || Math.abs(target - from) < 1) return;

      snapAnimationRef.current?.stop();
      snappingRef.current = true;
      const animation = animate(from, target, {
        ...snappySpring,
        onUpdate: (latest) => {
          const opts = layoutOptsRef.current;
          const { setWidth } = layoutSet(
            itemsRef.current,
            cardGap(opts.md),
            opts,
          );
          x.set(wrapX(latest, setWidth));
        },
      });
      snapAnimationRef.current = animation;
      void animation.then(() => {
        if (snapAnimationRef.current !== animation) return;
        const latest = layoutSet(
          itemsRef.current,
          cardGap(layoutOptsRef.current.md),
          layoutOptsRef.current,
        );
        x.set(wrapX(x.get(), latest.setWidth));
        snappingRef.current = false;
        snapAnimationRef.current = null;
        applyTransforms();
      });
    },
    [applyTransforms, x],
  );

  const snapToClosest = useCallback(() => {
    const container = containerRef.current;
    if (!container || itemsRef.current.length === 0) return;

    const viewCenter = container.clientWidth / 2;
    const opts = layoutOptsRef.current;
    const currentGap = cardGap(opts.md);
    const origin = x.get();
    let cursor = origin;
    let bestTarget = origin;
    let bestDist = Infinity;

    cardRefs.current.forEach((el) => {
      if (!el) return;
      const aspect = Number(el.dataset.aspect || PHONE_ASPECT);
      const width = el.parentElement?.offsetWidth || opts.maxHeight * aspect;
      const dx = cursor + width / 2 - viewCenter;
      const dist = Math.abs(dx);
      if (dist < bestDist) {
        bestDist = dist;
        bestTarget = origin - dx;
      }
      cursor += width + currentGap;
    });

    animateSnap(bestTarget);
  }, [animateSnap, x]);

  const scheduleSnap = useCallback(() => {
    if (snapTimerRef.current !== null)
      window.clearTimeout(snapTimerRef.current);
    snapTimerRef.current = window.setTimeout(() => {
      snapTimerRef.current = null;
      snapToClosest();
    }, SNAP_IDLE_MS);
  }, [snapToClosest]);

  const interruptSnap = useCallback(() => {
    if (snapTimerRef.current !== null) {
      window.clearTimeout(snapTimerRef.current);
      snapTimerRef.current = null;
    }
    snapAnimationRef.current?.stop();
    snapAnimationRef.current = null;
    snappingRef.current = false;
  }, []);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (zoomedRef.current) return;
      event.preventDefault();
      interruptSnap();
      x.set(x.get() - wheelDelta(event));
      scheduleSnap();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", onWheel);
      if (snapTimerRef.current !== null)
        window.clearTimeout(snapTimerRef.current);
      snapAnimationRef.current?.stop();
    };
  }, [interruptSnap, scheduleSnap, x]);

  const snapTo = useCallback(
    (indexInSet: number) => {
      const container = containerRef.current;
      if (!container) return;
      const opts = layoutOptsRef.current;
      const { starts, widths, setWidth } = layoutSet(
        itemsRef.current,
        cardGap(opts.md),
        opts,
      );
      const current = x.get();
      const viewCenter = container.clientWidth / 2;
      let best = current;
      let bestDist = Infinity;

      for (let copy = 0; copy < copiesRef.current; copy += 1) {
        const itemCenter =
          copy * setWidth + starts[indexInSet] + widths[indexInSet] / 2;
        const target = viewCenter - itemCenter;
        const dist = Math.abs(target - current);
        if (dist < bestDist) {
          bestDist = dist;
          best = target;
        }
      }

      animateSnap(best);
    },
    [animateSnap, x],
  );

  const onSelect = useCallback(
    (id: string) => {
      if (id === activeIdRef.current) {
        const item =
          itemsRef.current.find((entry) => entry._id === id) ?? null;
        if (item?.image?.asset || item?.video?.asset?.url) {
          setZoomedItem(item);
        }
        return;
      }

      const index = itemsRef.current.findIndex((item) => item._id === id);
      if (index >= 0) snapTo(index);
    },
    [snapTo],
  );

  const closeZoom = useCallback(() => {
    setZoomedItem(null);
  }, []);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (zoomedRef.current || event.button !== 0) return;
    interruptSnap();
    draggingRef.current = false;
    dragMovedRef.current = 0;
    pointerRef.current = { id: event.pointerId, lastX: event.clientX };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.lastX;
    pointer.lastX = event.clientX;
    dragMovedRef.current += Math.abs(dx);
    if (!draggingRef.current && dragMovedRef.current > DRAG_CLICK_THRESHOLD) {
      draggingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (draggingRef.current) {
      x.set(x.get() + dx);
    }
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.id !== event.pointerId) return;
    const dragged = draggingRef.current;
    pointerRef.current = null;
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (event.type === "pointercancel") {
      if (dragged) scheduleSnap();
      return;
    }
    if (dragged) {
      scheduleSnap();
      return;
    }

    const target = (event.target as HTMLElement | null)?.closest("[data-id]");
    const id = target?.getAttribute("data-id");
    if (id) onSelect(id);
  };

  if (items.length === 0) {
    return (
      <p className="site-column px-4 text-body-md text-subdued">
        No screenshots yet.
      </p>
    );
  }

  return (
    <>
      <section
        ref={sectionRef}
        className="flex w-full flex-col items-center"
        aria-label="Gallery"
        inert={zoomedItem ? true : undefined}
      >
      <div
        className="showcase-carousel relative mx-auto w-full cursor-grab select-none active:cursor-grabbing"
        style={{
          height: trackHeight + DEPTH_PAD,
          touchAction: "none",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          ref={containerRef}
          className="relative flex h-full items-center overflow-visible"
        >
          <motion.div
            className="flex items-center will-change-transform"
            style={{ x, gap }}
          >
            {loopItems.map(({ item, copy }, loopIndex) => {
              const size = itemSize(item, layoutOpts);

              return (
                <button
                  key={`${item._id}-${copy}`}
                  type="button"
                  data-id={item._id}
                  aria-current={activeId === item._id ? "true" : undefined}
                  aria-label={
                    activeId === item._id
                      ? `${item.title}, view larger`
                      : item.title
                  }
                  className={`relative shrink-0 bg-transparent p-0 ${
                    activeId === item._id ? "cursor-zoom-in" : ""
                  }`}
                  style={{ height: size.height, width: size.width }}
                  onClick={(event) => {
                    if (event.detail !== 0) return;
                    onSelect(item._id);
                  }}
                >
                  <div
                    ref={(el) => {
                      cardRefs.current[loopIndex] = el;
                      cardRefs.current.length = loopItems.length;
                    }}
                    data-id={item._id}
                    data-aspect={size.aspect}
                    className="showcase-card size-full"
                  >
                    <ShowcaseDevice
                      item={item}
                      reduceMotion={Boolean(reduceMotion)}
                    />
                  </div>
                </button>
              );
            })}
          </motion.div>
        </div>
      </div>

      <div className="site-column w-full px-4 pt-6" aria-live="polite">
        <AnimatePresence mode="wait">
          {active ? (
            <motion.div
              key={active._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={snappySpring}
            >
              <ShowcaseCaption item={active} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      </section>
      {canPortal
        ? createPortal(
            <AnimatePresence>
              {zoomedItem ? (
                <ShowcaseZoomOverlay
                  key={zoomedItem._id}
                  item={zoomedItem}
                  onClose={closeZoom}
                  reduceMotion={Boolean(reduceMotion)}
                />
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}

function ShowcaseZoomOverlay({
  item,
  onClose,
  reduceMotion,
}: {
  item: ScreenshotItem;
  onClose: () => void;
  reduceMotion: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const leavingRef = useRef(false);
  const [leaving, setLeaving] = useState(false);

  const requestClose = useCallback(() => {
    if (leavingRef.current) return;
    if (reduceMotion) {
      onClose();
      return;
    }
    leavingRef.current = true;
    setLeaving(true);
  }, [onClose, reduceMotion]);

  useEffect(() => {
    dialogRef.current?.focus();

    const html = document.documentElement;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      requestClose();
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      html.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [requestClose]);

  const zoomInTransition = reduceMotion ? { duration: 0 } : appearScale;
  const zoomOutTransition = reduceMotion ? { duration: 0 } : scaleOut;

  const titleId = "showcase-zoom-title";
  const descriptionId = item.description
    ? "showcase-zoom-description"
    : undefined;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      tabIndex={-1}
      className="fixed inset-0 z-[80] flex cursor-zoom-out items-center justify-center overflow-y-auto overflow-x-hidden p-4 outline-none md:p-10"
      onClick={requestClose}
    >
      <div className="fixed inset-0 bg-background/80 backdrop-blur-2xl" />
      <motion.div
        className="relative z-[1] flex max-h-full max-w-full origin-center flex-col items-center gap-6 will-change-transform md:block md:gap-0"
        initial={reduceMotion ? false : { scale: 0.9 }}
        animate={{ scale: leaving ? 0.9 : 1 }}
        transition={leaving ? zoomOutTransition : zoomInTransition}
        onAnimationComplete={() => {
          if (leavingRef.current) onClose();
        }}
      >
        <ShowcaseZoomMedia item={item} />
        <ShowcaseCaption
          item={item}
          titleId={titleId}
          descriptionId={descriptionId}
          layout="overlay"
        />
      </motion.div>
    </div>
  );
}

function ShowcaseCaption({
  item,
  titleId,
  descriptionId,
  layout = "carousel",
}: {
  item: ScreenshotItem;
  titleId?: string;
  descriptionId?: string;
  layout?: "carousel" | "overlay";
}) {
  const dateLabel = formatScreenshotDate(item.date);
  const overlay = layout === "overlay";

  return (
    <div
      className={
        overlay
          ? "flex w-full max-w-sm flex-col gap-2 text-center md:absolute md:top-1/2 md:left-[calc(100%+1.5rem)] md:w-max md:max-w-[calc((100vw-100%)/2-1.5rem)] md:-translate-y-1/2 md:text-left"
          : "flex flex-col gap-2 text-center"
      }
    >
      <div
        className={
          overlay
            ? "flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 md:justify-start"
            : "flex items-baseline justify-center gap-3"
        }
      >
        <h2 id={titleId} className="text-body-md font-medium text-ink">
          {item.title}
        </h2>
        {dateLabel ? (
          <p className="text-body-md font-medium text-ink/30">{dateLabel}</p>
        ) : null}
      </div>
      {item.description ? (
        <p id={descriptionId} className="text-body-sm text-subdued">
          {item.description}
        </p>
      ) : null}
    </div>
  );
}

function ShowcaseZoomMedia({ item }: { item: ScreenshotItem }) {
  const videoUrl = item.video?.asset?.url ?? null;
  const image = item.image?.asset ? item.image : null;
  const alt = item.alt || item.title;

  if (videoUrl) {
    return (
      <video
        src={videoUrl}
        poster={screenshotMediaUrl(image) ?? undefined}
        autoPlay
        muted
        loop
        playsInline
        controls={false}
        aria-label={alt}
        className="showcase-zoom-media"
      />
    );
  }

  if (!image?.asset) return null;

  const src = screenshotMediaUrl(image);
  if (!src) return null;

  const { width, height } = screenshotImageSize(image);

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      draggable={false}
      className="showcase-zoom-media"
    />
  );
}


function ShowcaseDevice({
  item,
  reduceMotion,
}: {
  item: ScreenshotItem;
  reduceMotion: boolean;
}) {
  const depthSrc = screenshotMediaUrl(item.image);

  return (
    <>
      <div className="showcase-card-front">
        <ShowcaseMedia item={item} />
      </div>
      {depthSrc && !reduceMotion ? (
        <div className="showcase-card-depth" aria-hidden="true">
          {Array.from(
            {
              length:
                item.type === "laptop"
                  ? LAPTOP_DEPTH_LAYERS
                  : PHONE_DEPTH_LAYERS,
            },
            (_, index) => (
              <img
                key={index}
                src={depthSrc}
                alt=""
                draggable={false}
                decoding="async"
                style={{
                  transform: `translateZ(${(-index - 1) * DEPTH_LAYER_GAP}px)`,
                }}
              />
            ),
          )}
        </div>
      ) : null}
    </>
  );
}

function ShowcaseMedia({ item }: { item: ScreenshotItem }) {
  const videoUrl = item.video?.asset?.url ?? null;
  const image = item.image?.asset ? item.image : null;
  const alt = item.alt || item.title;

  if (videoUrl) {
    return <CarouselVideo src={videoUrl} alt={alt} poster={image} />;
  }

  if (!image?.asset) return null;

  const src = screenshotMediaUrl(image);
  if (!src) return null;

  const { width, height } = screenshotImageSize(image);

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      draggable={false}
      placeholder={image.asset.metadata?.lqip ? "blur" : "empty"}
      blurDataURL={image.asset.metadata?.lqip}
      sizes={SCREENSHOT_IMAGE_SIZES}
      className="pointer-events-none size-full object-cover"
    />
  );
}

function CarouselVideo({
  src,
  alt,
  poster,
}: {
  src: string;
  alt: string;
  poster: SanityImageValue | null;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const posterUrl = screenshotMediaUrl(poster) ?? undefined;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.muted = true;
    const play = () => {
      void el.play().catch(() => {});
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) play();
        else el.pause();
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    el.addEventListener("canplay", play);
    return () => {
      observer.disconnect();
      el.removeEventListener("canplay", play);
    };
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      poster={posterUrl}
      autoPlay
      muted
      loop
      playsInline
      controls={false}
      controlsList="nodownload nofullscreen noremoteplayback"
      disablePictureInPicture
      preload="metadata"
      aria-label={alt}
      className="pointer-events-none size-full object-cover"
    />
  );
}
