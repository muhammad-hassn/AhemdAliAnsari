# MOTION SYSTEM

> All animation primitives live in `src/components/motion/`. All durations and easings live in ONE motion tokens file.

## Motion Tokens File (`src/components/motion/tokens.ts`)
Single source of truth for all animation values:
```ts
export const motionTokens = {
  duration: {
    fast: 0.2,
    normal: 0.4,
    slow: 0.6,
    hero: 0.8,
    crossFade: 1.2,
  },
  ease: {
    default: [0.25, 0.1, 0.25, 1],      // cubic-bezier
    out: [0, 0, 0.2, 1],
    inOut: [0.4, 0, 0.2, 1],
    spring: { stiffness: 100, damping: 15 },
  },
  distance: {
    reveal: 24,  // px rise for Reveal
  },
};
```

## Motion Components

### `<Reveal>`
- Fade in + 24px vertical rise on entering viewport
- Triggers once (no re-trigger on scroll back)
- Uses IntersectionObserver

### `<StaggerGroup>`
- Wraps children with staggered entrance animations
- Each child delayed incrementally

### `<TextReveal>`
- Line/word mask reveal for hero headings
- Used on the home page hero section

### `<ParallaxImage>`
- Parallax scroll effect on images
- Used in Craftsmanship section, About page artisan imagery

## Smooth Scroll
- `lenis` library provides smooth scrolling
- Wrapped in a provider component
- **Disabled** when `prefers-reduced-motion` is set

## Hover Effects
| Element | Effect |
|---|---|
| Product card image | Cross-fade to 2nd image + slow scale to 1.04 |
| Text links | Underline-grow animation |
| Buttons | Subtle fill-slide |

## Page Transitions
- Subtle fade between pages

## Accessibility (Critical)
- ONE shared hook: `useReducedMotion()` (or `usePrefersReducedMotion()`)
- Every motion component must check this hook
- When reduced motion is preferred:
  - No scroll animations
  - No parallax
  - No staggered reveals
  - Transitions are instant or extremely fast
  - Smooth scroll (lenis) is disabled
- This is non-negotiable — motion must never be a barrier
