"use client";

import {tabSlide} from "@/lib/motion";
import {motion, useReducedMotion} from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

type ChartType = "bar" | "pie" | "scatter" | "line";
type YAxisMode = "full" | "zoomed";
type ActiveMark = {
  series: number;
  category: number;
};

const SERIES_COLORS = [
  "#183B56",
  "#D9772A",
  "#378873",
  "#765A9E",
  "#C94432",
] as const;

const WHITE = "#FFFFFF";
const STEEL = "#D1DCE2";
const NAVY = "#0D2126";
const SECONDARY = "#526068";
const CATEGORIES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const SERIES_NAMES = [
  "Series 1",
  "Series 2",
  "Series 3",
  "Series 4",
  "Series 5",
] as const;

const SERIES_VALUES = [
  [72, 68, 75, 71, 78, 74, 70],
  [64, 61, 69, 66, 73, 67, 63],
  [58, 54, 62, 59, 65, 60, 56],
  [81, 77, 84, 80, 86, 82, 79],
  [49, 52, 50, 54, 48, 51, 47],
] as const;

const PIE_SHARES = [32, 24, 18, 16, 10] as const;

const VIEW_W = 1120;
const VIEW_H = 680;
const PLOT_LEFT = 128;
const PLOT_RIGHT = 1088;
const PLOT_TOP = 32;
const PLOT_BOTTOM = 528;
const PLOT_WIDTH = PLOT_RIGHT - PLOT_LEFT;
const BREAK_SIZE = 44;
const BAR_GROUP = 110;
const BAR_GAP = 4;
const SCATTER_OFFSET = 9;
const DONUT = {cx: VIEW_W / 2, cy: 300, outer: 230, inner: 112};
const FULL_MAX = 90;
const FULL_STEP = 10;

const CHART_TYPES: {value: ChartType; label: string}[] = [
  {value: "bar", label: "Bar"},
  {value: "pie", label: "Pie"},
  {value: "scatter", label: "Scatter"},
  {value: "line", label: "Line"},
];

const Y_AXIS_OPTIONS: {value: YAxisMode; label: string}[] = [
  {value: "full", label: "Full-width"},
  {value: "zoomed", label: "Zoomed in"},
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function niceStep(range: number, targetTicks: number) {
  const safeRange = Math.max(range, 1);
  const rough = safeRange / targetTicks;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
  const residual = rough / magnitude;
  const nice =
    residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10;
  return nice * magnitude;
}

function zoomedDomain(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = (max - min) * 0.12 || 2;
  const rawMin = min - pad;
  const rawMax = max + pad;
  const step = niceStep(rawMax - rawMin, 5);
  let domainMin = Math.floor(rawMin / step) * step;
  let domainMax = Math.ceil(rawMax / step) * step;
  domainMin = Math.max(0, domainMin);
  if (domainMax <= domainMin) {
    domainMax = domainMin + step * 5;
  }
  return {min: domainMin, max: domainMax, step};
}

function ticksBetween(min: number, max: number, step: number) {
  const values: number[] = [];
  const start = Math.ceil(min / step) * step;
  for (let value = start; value <= max + step / 2; value += step) {
    values.push(Number(value.toFixed(4)));
  }
  if (values[0] !== min) values.unshift(min);
  if (values[values.length - 1] !== max) values.push(max);
  return [...new Set(values.map((value) => Number(value.toFixed(4))))];
}

function categoryX(index: number) {
  return PLOT_LEFT + (PLOT_WIDTH / CATEGORIES.length) * (index + 0.5);
}

function scatterX(categoryIndex: number, seriesIndex: number, seriesCount: number) {
  const centered = (seriesIndex - (seriesCount - 1) / 2) * SCATTER_OFFSET;
  return categoryX(categoryIndex) + centered;
}

function barWidth(count: number) {
  const n = Math.max(count, 1);
  return (BAR_GROUP - BAR_GAP * (n - 1)) / n;
}

function barX(category: number, series: number, count: number) {
  return (
    categoryX(category) -
    BAR_GROUP / 2 +
    series * (barWidth(count) + BAR_GAP)
  );
}

function polar(cx: number, cy: number, radius: number, angle: number) {
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)] as const;
}

function donutPath(
  startAngle: number,
  endAngle: number,
  cx = DONUT.cx,
  cy = DONUT.cy,
) {
  const sweep = endAngle - startAngle;
  const large = sweep > Math.PI ? 1 : 0;
  const [x1, y1] = polar(cx, cy, DONUT.outer, startAngle);
  const [x2, y2] = polar(cx, cy, DONUT.outer, endAngle);
  const [x3, y3] = polar(cx, cy, DONUT.inner, endAngle);
  const [x4, y4] = polar(cx, cy, DONUT.inner, startAngle);
  return [
    `M ${x1} ${y1}`,
    `A ${DONUT.outer} ${DONUT.outer} 0 ${large} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${DONUT.inner} ${DONUT.inner} 0 ${large} 0 ${x4} ${y4}`,
    "Z",
  ].join(" ");
}

function linePath(points: {x: number; y: number}[]) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function linearTrend(points: {x: number; y: number}[]) {
  const n = points.length;
  if (n < 2) return null;
  const sumX = points.reduce((sum, point) => sum + point.x, 0);
  const sumY = points.reduce((sum, point) => sum + point.y, 0);
  const sumXY = points.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumXX = points.reduce((sum, point) => sum + point.x * point.x, 0);
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return null;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  const firstX = points[0].x;
  const lastX = points[n - 1].x;
  return {
    x1: firstX,
    y1: slope * firstX + intercept,
    x2: lastX,
    y2: slope * lastX + intercept,
  };
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function piePercents(count: number) {
  const shares = PIE_SHARES.slice(0, count);
  const total = shares.reduce((sum, value) => sum + value, 0);
  return shares.map((value) => (value / total) * 100);
}

function easeOut(progress: number) {
  return 1 - (1 - progress) ** 3;
}

function easeInOut(progress: number) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - ((-2 * progress + 2) ** 3) / 2;
}

function useTweenedScale(
  min: number,
  max: number,
  breakSize: number,
  duration: number,
) {
  const reduced = useReducedMotion();
  const [current, setCurrent] = useState({min, max, breakSize});
  const currentRef = useRef(current);
  const fromRef = useRef(current);

  useEffect(() => {
    if (
      reduced ||
      (currentRef.current.min === min &&
        currentRef.current.max === max &&
        currentRef.current.breakSize === breakSize)
    ) {
      const next = {min, max, breakSize};
      currentRef.current = next;
      setCurrent(next);
      return;
    }

    fromRef.current = currentRef.current;
    const started = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = easeOut(progress);
      const from = fromRef.current;
      const next = {
        min: from.min + (min - from.min) * eased,
        max: from.max + (max - from.max) * eased,
        breakSize: from.breakSize + (breakSize - from.breakSize) * eased,
      };
      currentRef.current = next;
      setCurrent(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [min, max, breakSize, duration, reduced]);

  return current;
}

function useTweenedNumber(target: number, duration: number) {
  const reduced = useReducedMotion();
  const [current, setCurrent] = useState(target);
  const currentRef = useRef(target);

  useEffect(() => {
    if (reduced || currentRef.current === target) {
      currentRef.current = target;
      setCurrent(target);
      return;
    }

    const from = currentRef.current;
    const started = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      const next = from + (target - from) * easeInOut(progress);
      currentRef.current = next;
      setCurrent(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, reduced]);

  return current;
}

function useTweenedArray(target: number[], duration: number) {
  const reduced = useReducedMotion();
  const key = target.join(",");
  const [current, setCurrent] = useState(target);
  const currentRef = useRef(target);
  const fromRef = useRef(target);

  useEffect(() => {
    const nextTarget = key.split(",").map(Number);
    if (
      reduced ||
      (currentRef.current.length === nextTarget.length &&
        currentRef.current.every((value, index) => value === nextTarget[index]))
    ) {
      currentRef.current = nextTarget;
      setCurrent(nextTarget);
      return;
    }

    fromRef.current = nextTarget.map((_, index) => currentRef.current[index] ?? 0);
    const started = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = easeOut(progress);
      const next = nextTarget.map((value, index) => {
        const from = fromRef.current[index] ?? 0;
        return from + (value - from) * eased;
      });
      currentRef.current = next;
      setCurrent(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [key, duration, reduced]);

  return current;
}

function SegmentedControl<T extends string>({
  legend,
  value,
  options,
  onChange,
  fullWidth = false,
}: {
  legend: string;
  value: T;
  options: {value: T; label: string}[];
  onChange: (value: T) => void;
  fullWidth?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState({left: 0, width: 0});

  const measure = useCallback(() => {
    const track = trackRef.current;
    const activeIndex = options.findIndex((option) => option.value === value);
    const active = buttonRefs.current[activeIndex];
    if (!track || !active) return;
    const trackRect = track.getBoundingClientRect();
    const rect = active.getBoundingClientRect();
    setIndicator({
      left: rect.left - trackRect.left,
      width: rect.width,
    });
  }, [options, value]);

  useLayoutEffect(() => {
    measure();
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  return (
    <fieldset
      className={`m-0 min-w-0 border-0 p-0 ${fullWidth ? "w-full" : "min-w-0 flex-1"}`}
    >
      <legend className="mb-2 px-0.5 text-[11px] font-bold tracking-[0.06em] text-[#526068] uppercase">
        {legend}
      </legend>
      <div
        ref={trackRef}
        className="relative flex w-full rounded-lg bg-[#EBEBEB] p-[3px]"
      >
        {indicator.width > 0 ? (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute top-[3px] bottom-[3px] rounded-md bg-white shadow-[0_1px_2px_rgba(13,33,38,0.08)]"
            initial={false}
            animate={{left: indicator.left, width: indicator.width}}
            transition={tabSlide}
          />
        ) : null}
        {options.map((option, index) => {
          const pressed = option.value === value;
          return (
            <button
              key={option.value}
              ref={(el) => {
                buttonRefs.current[index] = el;
              }}
              type="button"
              aria-pressed={pressed}
              onClick={() => onChange(option.value)}
              className={`relative z-10 min-h-8 flex-1 whitespace-nowrap rounded-md px-3 text-[11px] tracking-[0.025em] transition-colors duration-200 ${
                pressed ? "text-[#0D2126]" : "text-[#526068] hover:text-[#0D2126]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function markKeyDown(
  event: KeyboardEvent<SVGElement>,
  activate: () => void,
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    activate();
  }
}

export function WritingChart() {
  const titleId = useId();
  const descId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const [type, setType] = useState<ChartType>("bar");
  const [seriesCount, setSeriesCount] = useState(3);
  const [yAxis, setYAxis] = useState<YAxisMode>("full");
  const [hovered, setHovered] = useState<ActiveMark | null>(null);
  const [selected, setSelected] = useState<ActiveMark | null>(null);
  const visibleCount = type === "pie" ? Math.max(2, seriesCount) : seriesCount;
  const cartesian = type !== "pie";

  useEffect(() => {
    const onPointerDown = (event: Event) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setSelected(null);
        setHovered(null);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const visibleValues = useMemo(() => {
    return SERIES_VALUES.slice(0, visibleCount).flatMap((row) => [...row]);
  }, [visibleCount]);

  const targetDomain = useMemo(() => {
    if (yAxis === "full") {
      return {min: 0, max: FULL_MAX, step: FULL_STEP};
    }
    return zoomedDomain(visibleValues);
  }, [yAxis, visibleValues]);

  const scale = useTweenedScale(
    targetDomain.min,
    targetDomain.max,
    yAxis === "zoomed" ? BREAK_SIZE : 0,
    300,
  );

  const targetPercents = useMemo(
    () => piePercents(visibleCount),
    [visibleCount],
  );
  const pieValues = useTweenedArray(targetPercents, 400);

  const baseline = PLOT_BOTTOM - scale.breakSize;
  const scaleHeight = Math.max(1, baseline - PLOT_TOP);
  const domainSpan = Math.max(scale.max - scale.min, 0.001);

  const plotY = (value: number) => {
    if (value <= 0) return PLOT_BOTTOM;
    return baseline - ((value - scale.min) / domainSpan) * scaleHeight;
  };

  const axisTicks = useMemo(() => {
    const values =
      yAxis === "full"
        ? ticksBetween(0, FULL_MAX, FULL_STEP)
        : [0, ...ticksBetween(targetDomain.min, targetDomain.max, targetDomain.step)];
    return [...new Set(values)];
  }, [yAxis, targetDomain]);

  const active = selected ?? hovered;
  const dimmed = (seriesIndex: number) => {
    if (!active) return 1;
    if (type === "pie") return active.series === seriesIndex ? 1 : 0.35;
    return active.series === seriesIndex ? 1 : 0.25;
  };

  const selectMark = (mark: ActiveMark, seriesLevel: boolean) => {
    setSelected(
      seriesLevel ? {series: mark.series, category: mark.category} : mark,
    );
    setHovered(null);
  };

  const previewHover = (mark: ActiveMark | null) => {
    if (selected) return;
    setHovered(mark);
  };

  const clearFocus = () => {
    setSelected(null);
    setHovered(null);
  };

  const onChartPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    const target = event.target as Element | null;
    if (!target?.closest("[data-chart-mark]")) {
      clearFocus();
    }
  };

  const title =
    type === "pie" ? "Share of weekly activity" : "Weekly activity";
  const description = cartesian
    ? `${CHART_TYPES.find((item) => item.value === type)?.label} chart of weekly activity for ${visibleCount} series, shown as percentages${yAxis === "zoomed" ? " with a zoomed y-axis and break" : ""}.`
    : `Donut chart showing the share of weekly activity across ${visibleCount} slices.`;

  const barLayoutCount = useTweenedNumber(visibleCount, 160);
  const tooltipAnchors = (() => {
    if (type === "pie" || !active) return [];
    const x =
      type === "scatter"
        ? scatterX(active.category, active.series, visibleCount)
        : type === "bar"
          ? barX(active.category, active.series, barLayoutCount) +
            barWidth(barLayoutCount) / 2
          : categoryX(active.category);
    const y = plotY(SERIES_VALUES[active.series][active.category]);
    return [
      {
        key: "value",
        left: `${(x / VIEW_W) * 100}%`,
        top: `${(y / VIEW_H) * 100}%`,
        value: SERIES_VALUES[active.series][active.category],
      },
    ];
  })();

  return (
    <section
      ref={rootRef}
      aria-labelledby={titleId}
      className="writing-chart w-full"
      onPointerDown={(event) => {
        if (!(event.target as Element).closest("[data-chart-mark]")) {
          clearFocus();
        }
      }}
    >
      <style href="writing-chart">{`
        .writing-chart {
          letter-spacing: 0.025em;
          color: ${NAVY};
        }
        .writing-chart button {
          font-family: inherit;
        }
        .writing-chart-mark {
          outline: none;
          cursor: pointer;
        }
      `}</style>

      <div className="flex flex-col gap-3 max-[700px]:gap-4">
        <SegmentedControl
          legend="Type"
          value={type}
          options={CHART_TYPES}
          onChange={(next) => {
            setType(next);
            if (next === "pie" && seriesCount < 2) {
              setSeriesCount(2);
            }
            setHovered(null);
            setSelected(null);
          }}
          fullWidth
        />
        <div className="flex w-full items-end gap-3 max-[700px]:flex-col max-[700px]:items-stretch">
          <SegmentedControl
            legend={type === "pie" ? "Slices" : "Series"}
            value={String(seriesCount)}
            options={(type === "pie" ? [2, 3, 4, 5] : [1, 2, 3, 4, 5]).map(
              (count) => ({value: String(count), label: String(count)}),
            )}
            onChange={(next) => {
              setSeriesCount(Number(next));
              setHovered(null);
              setSelected(null);
            }}
            fullWidth={type === "pie"}
          />
          {cartesian ? (
            <SegmentedControl
              legend="Y-axis"
              value={yAxis}
              options={Y_AXIS_OPTIONS}
              onChange={setYAxis}
            />
          ) : null}
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-white px-10 py-10 max-[700px]:px-6 max-[700px]:py-6 max-[420px]:px-4 max-[420px]:py-4">
        <h2 id={titleId} className="sr-only">
          {title}
        </h2>

        <ul
          aria-hidden
          className="mb-4 flex min-h-5 flex-wrap items-center gap-x-5 gap-y-2 text-[13px] leading-5 text-[#526068]"
        >
          {visibleCount > 1
            ? Array.from({length: visibleCount}, (_, series) => (
                <li
                  key={SERIES_NAMES[series]}
                  className="flex items-center gap-2"
                  style={{opacity: dimmed(series)}}
                >
                  {type === "line" ? (
                    <span className="relative flex h-2.5 w-5 items-center">
                      <span
                        className="absolute inset-x-0 h-0.5 rounded-full"
                        style={{background: SERIES_COLORS[series]}}
                      />
                      <span
                        className="relative mx-auto size-2 rounded-full bg-white"
                        style={{boxShadow: `inset 0 0 0 1.5px ${SERIES_COLORS[series]}`}}
                      />
                    </span>
                  ) : (
                    <span
                      className={`size-2.5 shrink-0 ${type === "scatter" ? "rounded-full" : "rounded-[2px]"}`}
                      style={{background: SERIES_COLORS[series]}}
                    />
                  )}
                  {type === "pie" ? PIE_SHARES[series] : SERIES_NAMES[series]}
                </li>
              ))
            : (
              <li className="invisible flex items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-[2px]" />
                Series
              </li>
            )}
        </ul>

        <div
          className="relative w-full"
          style={{aspectRatio: `${VIEW_W} / ${VIEW_H}`}}
        >
        <svg
          role="img"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          aria-labelledby={descId}
          className="absolute inset-0 block h-full w-full"
          style={{fontFamily: "inherit"}}
          onPointerDown={onChartPointerDown}
        >
          <desc id={descId}>{description}</desc>

          {cartesian ? (
            <CartesianChart
              type={type}
              visibleCount={visibleCount}
              layoutCount={barLayoutCount}
              axisTicks={axisTicks}
              plotY={plotY}
              baseline={baseline}
              breakSize={scale.breakSize}
              dimmed={dimmed}
              hovered={hovered}
              selected={selected}
              setHovered={previewHover}
              selectMark={selectMark}
            />
          ) : (
            <DonutChart
              percents={pieValues}
              visibleCount={visibleCount}
              active={active}
              dimmed={dimmed}
              setHovered={previewHover}
              selectMark={selectMark}
            />
          )}
        </svg>
        {tooltipAnchors.map((anchor) => (
          <div
            key={anchor.key}
            aria-hidden
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+8px)] whitespace-nowrap rounded-md border border-[#D1DCE2] bg-white px-2.5 py-1 text-[14px] font-bold leading-none text-[#0D2126] shadow-[0_1px_2px_rgba(13,33,38,0.08)]"
            style={{left: anchor.left, top: anchor.top}}
          >
            {formatPercent(anchor.value)}
          </div>
        ))}
        </div>
      </div>
    </section>
  );
}

function CartesianChart({
  type,
  visibleCount,
  layoutCount,
  axisTicks,
  plotY,
  baseline,
  breakSize,
  dimmed,
  hovered,
  selected,
  setHovered,
  selectMark,
}: {
  type: ChartType;
  visibleCount: number;
  layoutCount: number;
  axisTicks: number[];
  plotY: (value: number) => number;
  baseline: number;
  breakSize: number;
  dimmed: (series: number) => number;
  hovered: ActiveMark | null;
  selected: ActiveMark | null;
  setHovered: (mark: ActiveMark | null) => void;
  selectMark: (mark: ActiveMark, seriesLevel: boolean) => void;
}) {
  const breakY = PLOT_BOTTOM - breakSize / 2;
  const renderCount = Math.max(
    visibleCount,
    Math.ceil(layoutCount - 0.001),
  );
  const width = barWidth(layoutCount);
  const focus = selected ?? hovered;

  return (
    <g>
      {axisTicks.map((tick) => {
        const y = tick === 0 ? PLOT_BOTTOM : plotY(tick);
        if (tick > 0 && y > baseline - 0.5) return null;
        return (
          <g key={tick}>
            <line
              x1={PLOT_LEFT}
              x2={PLOT_RIGHT}
              y1={y}
              y2={y}
              stroke={STEEL}
              strokeWidth={1}
            />
            <text
              x={PLOT_LEFT - 16}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              fill={SECONDARY}
              fontSize={20}
            >
              {tick}
            </text>
          </g>
        );
      })}

      <line
        x1={PLOT_LEFT}
        x2={PLOT_LEFT}
        y1={PLOT_TOP}
        y2={baseline}
        stroke={STEEL}
        strokeWidth={1.5}
      />
      <line
        x1={PLOT_LEFT}
        x2={PLOT_LEFT}
        y1={breakSize > 12 ? PLOT_BOTTOM - 8 : baseline}
        y2={PLOT_BOTTOM}
        stroke={STEEL}
        strokeWidth={1.5}
      />

      {breakSize > 12 ? (
        <g aria-hidden>
          <line
            x1={PLOT_LEFT - 9}
            y1={breakY + 8}
            x2={PLOT_LEFT + 9}
            y2={breakY - 6}
            stroke={NAVY}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <line
            x1={PLOT_LEFT - 9}
            y1={breakY + 16}
            x2={PLOT_LEFT + 9}
            y2={breakY + 2}
            stroke={NAVY}
            strokeWidth={3}
            strokeLinecap="round"
          />
        </g>
      ) : null}

      <text
        x={36}
        y={(PLOT_TOP + PLOT_BOTTOM) / 2}
        textAnchor="middle"
        fill={NAVY}
        fontSize={22}
        transform={`rotate(-90 36 ${(PLOT_TOP + PLOT_BOTTOM) / 2})`}
      >
        Percentage
      </text>

      {CATEGORIES.map((label, index) => (
        <text
          key={label}
          x={categoryX(index)}
          y={568}
          textAnchor="middle"
          fill={SECONDARY}
          fontSize={20}
        >
          {label}
        </text>
      ))}

      <text
        x={(PLOT_LEFT + PLOT_RIGHT) / 2}
        y={632}
        textAnchor="middle"
        fill={NAVY}
        fontSize={22}
      >
        Day of week
      </text>

      {type === "bar"
        ? Array.from({length: renderCount}, (_, series) =>
            CATEGORIES.map((label, category) => {
              const value = SERIES_VALUES[series][category];
              const x = barX(category, series, layoutCount);
              const y = plotY(value);
              const height = Math.max(0, PLOT_BOTTOM - y);
              const appear = clamp(layoutCount - series, 0, 1);
              return (
                <rect
                  key={`${series}-${label}`}
                  data-chart-mark=""
                  role="button"
                  tabIndex={appear > 0.05 ? 0 : -1}
                  aria-pressed={
                    selected?.series === series &&
                    selected.category === category
                  }
                  aria-label={`${SERIES_NAMES[series]}, ${label}, ${formatPercent(value)}`}
                  x={x}
                  y={y}
                  width={Math.max(width, 0)}
                  height={height}
                  rx={2}
                  fill={SERIES_COLORS[series]}
                  opacity={dimmed(series) * appear}
                  className="writing-chart-mark"
                  onPointerEnter={() => setHovered({series, category})}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered({series, category})}
                  onBlur={() => setHovered(null)}
                  onClick={() => selectMark({series, category}, false)}
                  onKeyDown={(event) =>
                    markKeyDown(event, () =>
                      selectMark({series, category}, false),
                    )
                  }
                />
              );
            }),
          )
        : null}

      {type === "line"
        ? Array.from({length: visibleCount}, (_, series) => {
            const points = CATEGORIES.map((_, category) => ({
              x: categoryX(category),
              y: plotY(SERIES_VALUES[series][category]),
            }));
            const faded = dimmed(series);
            return (
              <g
                key={SERIES_NAMES[series]}
                opacity={faded}
                style={{transition: "opacity 240ms ease"}}
              >
                <path
                  d={linePath(points)}
                  fill="none"
                  stroke={SERIES_COLORS[series]}
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {points.map((point, category) => {
                  const focused =
                    focus?.series === series && focus.category === category;
                  return (
                    <circle
                      key={`${series}-${category}`}
                      data-chart-mark=""
                      role="button"
                      tabIndex={0}
                      aria-pressed={selected?.series === series}
                      aria-label={`${SERIES_NAMES[series]}, ${CATEGORIES[category]}, ${formatPercent(SERIES_VALUES[series][category])}`}
                      cx={point.x}
                      cy={point.y}
                      r={focused ? 8 : 6}
                      fill={WHITE}
                      stroke={SERIES_COLORS[series]}
                      strokeWidth={3}
                      className="writing-chart-mark"
                      style={{transition: "r 200ms ease"}}
                      onPointerEnter={() => setHovered({series, category})}
                      onPointerLeave={() => setHovered(null)}
                      onFocus={() => setHovered({series, category})}
                      onBlur={() => setHovered(null)}
                      onClick={() => selectMark({series, category}, true)}
                      onKeyDown={(event) =>
                        markKeyDown(event, () =>
                          selectMark({series, category}, true),
                        )
                      }
                    />
                  );
                })}
              </g>
            );
          })
        : null}

      {type === "scatter"
        ? Array.from({length: visibleCount}, (_, series) => {
            const points = CATEGORIES.map((_, category) => ({
              x: scatterX(category, series, visibleCount),
              y: plotY(SERIES_VALUES[series][category]),
            }));
            const trend = linearTrend(points);
            const faded = dimmed(series);
            return (
              <g
                key={SERIES_NAMES[series]}
                opacity={faded}
                style={{transition: "opacity 240ms ease"}}
              >
                {trend ? (
                  <line
                    aria-hidden
                    x1={trend.x1}
                    y1={trend.y1}
                    x2={trend.x2}
                    y2={trend.y2}
                    stroke={SERIES_COLORS[series]}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeDasharray="8 7"
                    opacity={0.75}
                  />
                ) : null}
                {points.map((point, category) => {
                  const focused =
                    focus?.series === series && focus.category === category;
                  return (
                    <circle
                      key={`${series}-${category}`}
                      data-chart-mark=""
                      role="button"
                      tabIndex={0}
                      aria-pressed={selected?.series === series}
                      aria-label={`${SERIES_NAMES[series]}, ${CATEGORIES[category]}, ${formatPercent(SERIES_VALUES[series][category])}`}
                      cx={point.x}
                      cy={point.y}
                      r={focused ? 11 : 8}
                      fill={SERIES_COLORS[series]}
                      className="writing-chart-mark"
                      style={{transition: "r 200ms ease"}}
                      onPointerEnter={() => setHovered({series, category})}
                      onPointerLeave={() => setHovered(null)}
                      onFocus={() => setHovered({series, category})}
                      onBlur={() => setHovered(null)}
                      onClick={() => selectMark({series, category}, true)}
                      onKeyDown={(event) =>
                        markKeyDown(event, () =>
                          selectMark({series, category}, true),
                        )
                      }
                    />
                  );
                })}
              </g>
            );
          })
        : null}

    </g>
  );
}

function DonutChart({
  percents,
  visibleCount,
  active,
  dimmed,
  setHovered,
  selectMark,
}: {
  percents: number[];
  visibleCount: number;
  active: ActiveMark | null;
  dimmed: (series: number) => number;
  setHovered: (mark: ActiveMark | null) => void;
  selectMark: (mark: ActiveMark, seriesLevel: boolean) => void;
}) {
  let angle = -Math.PI / 2;
  const slices = percents.slice(0, visibleCount).map((percent, series) => {
    const sweep = (percent / 100) * Math.PI * 2;
    const start = angle;
    const end = angle + sweep;
    angle = end;
    return {percent, series, start, end, mid: (start + end) / 2};
  });
  const orderedSlices = [...slices].sort((a, b) => {
    const aActive = active?.series === a.series ? 1 : 0;
    const bActive = active?.series === b.series ? 1 : 0;
    return aActive - bActive;
  });

  return (
    <g>
      {orderedSlices.map((slice) => {
        const selected = active?.series === slice.series;
        const [innerX, innerY] = polar(
          DONUT.cx,
          DONUT.cy,
          DONUT.inner,
          slice.mid,
        );
        const explode = selected ? 16 : 0;
        const scale = selected ? 1.05 : 1;
        const dx = Math.cos(slice.mid) * explode;
        const dy = Math.sin(slice.mid) * explode;
        const [labelX, labelY] = polar(
          DONUT.cx,
          DONUT.cy,
          (DONUT.outer + DONUT.inner) / 2,
          slice.mid,
        );
        return (
          <g
            key={SERIES_NAMES[slice.series]}
            style={{
              opacity: dimmed(slice.series),
              transform: `translate(${dx}px, ${dy}px) translate(${innerX}px, ${innerY}px) scale(${scale}) translate(${-innerX}px, ${-innerY}px)`,
              transition: "opacity 200ms ease, transform 220ms ease",
            }}
          >
            <path
              data-chart-mark=""
              role="button"
              tabIndex={0}
              aria-pressed={selected}
              aria-label={`${SERIES_NAMES[slice.series]}, ${formatPercent(slice.percent)}`}
              d={donutPath(slice.start, slice.end)}
              fill={SERIES_COLORS[slice.series]}
              stroke={WHITE}
              strokeWidth={3}
              className="writing-chart-mark"
              onPointerEnter={() =>
                setHovered({series: slice.series, category: 0})
              }
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setHovered({series: slice.series, category: 0})}
              onBlur={() => setHovered(null)}
              onClick={() =>
                selectMark({series: slice.series, category: 0}, true)
              }
              onKeyDown={(event) =>
                markKeyDown(event, () =>
                  selectMark({series: slice.series, category: 0}, true),
                )
              }
            />
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={WHITE}
              fontSize={24}
              fontWeight={700}
              pointerEvents="none"
            >
              {formatPercent(slice.percent)}
            </text>
          </g>
        );
      })}

    </g>
  );
}
