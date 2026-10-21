# DESIGN SYSTEM — Luxury Editorial

> This brand is a Pakistani luxury Eastern-wear house. The design must feel like a high-end fashion editorial. NOT playful, NOT startup-modern, NOT e-commerce-generic.

## Color Palette (CSS Variables)
```css
:root {
  --color-ivory:     #F7F3EC;   /* Background */
  --color-ink:       #14110F;   /* Primary text, solid buttons */
  --color-stone:     #8A8178;   /* Muted/secondary text */
  --color-hairline:  #E4DDD1;   /* Borders, dividers */
  --color-gold:      #B08D57;   /* Accent — antique gold */
  --color-burgundy:  #5A1F2B;   /* Deep accent — use sparingly */
}
```

## Typography
| Role | Font | Weight | Tracking | Source |
|---|---|---|---|---|
| Headings (h1–h3) | Cormorant Garamond | Light (300) | Tight (-0.02em) | next/font/google |
| Body / UI | Jost or Inter | Regular (400) / Medium (500) | Normal | next/font/google |
| Labels / Caps | Jost or Inter | Medium (500) | Wide (0.12em) | Small caps style |

## Geometry & Spacing
- **Border radius**: 0 everywhere (square corners)
- **Borders**: 1px hairline (`var(--color-hairline)`)
- **Shadows**: None or extremely subtle; no heavy drop shadows
- **Gradients**: None
- **Emojis**: Never
- **Icons**: Thin-stroke (lucide-react) only — no filled icons, no cartoon icons
- **Max container width**: 1440px
- **Grid**: 12 columns
- **Section padding**: 96–160px vertical (desktop), scale down for mobile
- **Whitespace**: Generous — let content breathe

## Product Imagery
- **Aspect ratio**: 2:3 portrait everywhere
- **Component**: `next/image` with correct `sizes` prop and blur placeholder
- **Hover**: Cross-fade to 2nd image + slow scale to 1.04
- **Gallery**: Thumbnails + hover zoom + lightbox on product page

## Buttons
| Variant | Style |
|---|---|
| Solid | Ink background, ivory text |
| Outline | 1px ink border, ink text, transparent bg |
| Text link | Underline, no background |
| Hover | Subtle fill-slide animation |

## Responsive
- Mobile first approach
- Breakpoints follow Tailwind defaults
- Fully accessible: focus rings, aria labels, contrast AA minimum
- Tap targets: 44px minimum on mobile
- No horizontal scroll at any viewport

## What NOT to Do
- ❌ Rounded corners (radius > 0)
- ❌ Heavy shadows or glowing effects
- ❌ Gradients on backgrounds or buttons
- ❌ Emojis or cartoon illustrations
- ❌ Filled/heavy icons
- ❌ Playful or casual typography
- ❌ Neon or saturated colors
- ❌ Generic e-commerce templates
- ❌ Lorem ipsum placeholder text
- ❌ Stock photos or cartoon art for seed data
