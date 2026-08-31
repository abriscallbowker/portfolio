"use client";

import {appearPop, hoverSpring} from "@/lib/motion";
import {writingFilterOptions, type WritingFilter} from "@/lib/writing";
import {ChevronDownIcon} from "@heroicons/react/24/solid";
import {AnimatePresence, motion, useReducedMotion} from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

type WritingFilterContextValue = {
  category: WritingFilter;
  setCategory: (category: WritingFilter) => void;
};

const WritingFilterContext = createContext<WritingFilterContextValue>({
  category: "all",
  setCategory: () => {},
});

export function WritingFilterProvider({children}: {children: ReactNode}) {
  const [category, setCategory] = useState<WritingFilter>("all");
  const value = useMemo(() => ({category, setCategory}), [category]);

  return (
    <WritingFilterContext.Provider value={value}>
      {children}
    </WritingFilterContext.Provider>
  );
}

export function useWritingFilter() {
  return useContext(WritingFilterContext);
}

export function CategoryFilter() {
  const {category, setCategory} = useWritingFilter();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const [originY, setOriginY] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);
  const listId = useId();
  const selected =
    writingFilterOptions.find((option) => option.value === category) ??
    writingFilterOptions[0];
  const instant = Boolean(reduceMotion);

  const openMenu = useCallback(() => {
    setOpen(true);
  }, []);

  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  }, []);

  const select = useCallback(
    (value: WritingFilter) => {
      setCategory(value);
      close(true);
    },
    [close, setCategory],
  );

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      close();
    };

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close(true);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, open]);

  useLayoutEffect(() => {
    if (!open) return;
    const selectedIndex = writingFilterOptions.findIndex(
      (option) => option.value === category,
    );
    const option = optionRefs.current[Math.max(selectedIndex, 0)];
    const button = buttonRef.current;
    if (option && button) {
      const extra = (option.offsetHeight - button.offsetHeight) / 2;
      const top = -option.offsetTop - extra;
      setMenuTop(top);
      setOriginY(-top + button.offsetHeight / 2);
    }
    option?.focus();
    // Align to the current category only as the menu opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const focusOption = (index: number) => {
    const count = writingFilterOptions.length;
    const next = ((index % count) + count) % count;
    optionRefs.current[next]?.focus();
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    openMenu();
  };

  const onOptionKeyDown = (
    event: KeyboardEvent<HTMLLIElement>,
    index: number,
    value: WritingFilter,
  ) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusOption(index + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusOption(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusOption(0);
        break;
      case "End":
        event.preventDefault();
        focusOption(writingFilterOptions.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        select(value);
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={rootRef}
      className="relative inline-flex"
      onBlur={(event) => {
        if (rootRef.current?.contains(event.relatedTarget as Node)) return;
        close();
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label="Filter by category"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onTriggerKeyDown}
        className={`inline-flex items-center gap-1 text-body-md text-ink ${
          open ? "invisible" : ""
        }`}
      >
        {selected.label}
        <motion.span
          aria-hidden
          className="inline-flex"
          initial={false}
          animate={{rotate: open ? 180 : 0}}
          transition={instant ? {duration: 0} : hoverSpring}
        >
          <ChevronDownIcon className="size-3 text-subdued" />
        </motion.span>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.ul
            id={listId}
            role="listbox"
            aria-label="Category"
            className="absolute left-0 z-20 w-max overflow-hidden rounded-2xl border border-border bg-background p-1.5 shadow-[0_0.3px_0.3px_rgb(0_0_0/0.18),0_1.14px_1.14px_rgb(0_0_0/0.16),0_5px_5px_rgb(0_0_0/0.06)]"
            style={{top: menuTop, transformOrigin: `left ${originY}px`}}
            initial={instant ? false : {scale: 0.5, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            exit={{scale: 0.5, opacity: 0}}
            transition={instant ? {duration: 0} : appearPop}
          >
            {writingFilterOptions.map((option, index) => {
              const isSelected = option.value === category;

              return (
                <li
                  key={option.value}
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  role="option"
                  tabIndex={-1}
                  aria-selected={isSelected}
                  className={`cursor-pointer rounded-lg px-2 py-1 text-body-md whitespace-nowrap outline-none ${
                    isSelected
                      ? "bg-inset text-ink"
                      : "text-subdued hover:text-ink"
                  } focus-visible:bg-inset focus-visible:text-ink`}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    select(option.value);
                  }}
                  onKeyDown={(event) =>
                    onOptionKeyDown(event, index, option.value)
                  }
                >
                  {option.label}
                </li>
              );
            })}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
