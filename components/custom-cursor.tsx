"use client";

import {cursorScaleEase} from "@/lib/motion";
import {animate, motion, useMotionValue, useSpring, useTransform} from "motion/react";
import {useEffect} from "react";

const CURSOR_SIZE = 20;
const CLICK_SCALE = 0.8;

function isFinePointer() {
  return (
    window.matchMedia("(hover: hover)").matches &&
    window.matchMedia("(pointer: fine)").matches
  );
}

export function CustomCursor() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const scale = useMotionValue(1);
  const opacity = useSpring(0, {duration: 0.15});
  const x = useTransform(mouseX, (value) => value - CURSOR_SIZE / 2);
  const y = useTransform(mouseY, (value) => value - CURSOR_SIZE / 2);

  useEffect(() => {
    if (!isFinePointer()) return;

    document.documentElement.classList.add("has-custom-cursor");
    let scaleAnimation: ReturnType<typeof animate> | undefined;

    const setScale = (value: number) => {
      scaleAnimation?.stop();
      scaleAnimation = animate(scale, value, cursorScaleEase);
    };

    const onMove = (event: PointerEvent) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
      opacity.set(1);
    };
    const onDown = () => {
      setScale(CLICK_SCALE);
    };
    const onUp = () => {
      setScale(1);
    };
    const onLeave = () => {
      opacity.set(0);
      setScale(1);
    };

    window.addEventListener("pointermove", onMove, {passive: true});
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointerleave", onLeave);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      scaleAnimation?.stop();
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [mouseX, mouseY, opacity, scale]);

  return (
    <motion.div
      aria-hidden
      className="custom-cursor pointer-events-none fixed top-0 left-0 z-[100] rounded-full bg-[rgba(13,13,13,0.15)]"
      style={{
        x,
        y,
        width: CURSOR_SIZE,
        height: CURSOR_SIZE,
        scale,
        opacity,
      }}
    />
  );
}
