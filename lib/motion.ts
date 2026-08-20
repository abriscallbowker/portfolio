export const hoverSpring = {
  type: "spring",
  duration: 0.4,
  bounce: 0.2,
} as const;

export const snappySpring = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  mass: 1,
} as const;

export const appearFade = {
  type: "spring",
  duration: 2,
  bounce: 0.2,
} as const;

export const appearPop = {
  type: "spring",
  duration: 0.4,
  bounce: 0.2,
} as const;

export const appearScale = {
  duration: 0.35,
  ease: [0.32, 0.72, 0, 1] as const,
} as const;

export const scaleOut = {
  duration: 0.2,
  ease: [0.4, 0, 1, 1] as const,
} as const;

export const cursorScaleEase = {
  duration: 0.2,
  ease: [0.32, 0.72, 0, 1] as const,
};

export const linkTween = {
  duration: 0.3,
  ease: [0.44, 0, 0.56, 1] as const,
};

export const tabSlide = {
  duration: 0.3,
  ease: [0.32, 0.72, 0, 1] as const,
};
