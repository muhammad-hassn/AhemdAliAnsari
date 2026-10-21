export const motionTokens = {
  duration: {
    fast: 0.2,
    normal: 0.4,
    slow: 0.6,
    hero: 0.8,
    crossFade: 1.2,
  },
  ease: {
    default: [0.25, 0.1, 0.25, 1] as const,
    out: [0, 0, 0.2, 1] as const,
    inOut: [0.4, 0, 0.2, 1] as const,
    spring: { stiffness: 100, damping: 15 },
  },
  distance: {
    reveal: 24,
  },
} as const;
