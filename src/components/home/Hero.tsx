"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/types";
import { TextReveal } from "@/components/motion/TextReveal";
import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const THEME_NAMES: Record<number, string> = {
  0: "Ivory Elegance",
  1: "Emerald Luxe",
  2: "Modern Everyday",
  3: "Midnight Signature",
  4: "Festive Heritage",
};

interface HeroProps {
  slides: HeroSlide[];
}

export function Hero({ slides }: HeroProps) {
  const [current, setCurrent] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [heroHeight, setHeroHeight] = useState<string>("calc(100svh - 5.5rem)");
  const [isDesktop, setIsDesktop] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 640);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(nextSlide, 6500);
    return () => clearInterval(interval);
  }, [slides.length, nextSlide]);

  // Dynamically calculate exact remaining viewport height ONLY for mobile screens
  useEffect(() => {
    const updateHeight = () => {
      if (heroRef.current && window.innerWidth < 640) {
        const rect = heroRef.current.getBoundingClientRect();
        const topDistance = rect.top + window.scrollY;
        const availableHeight = window.innerHeight - topDistance;
        if (availableHeight > 320) {
          setHeroHeight(`${availableHeight}px`);
        }
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        updateHeight();
      });
      observer.observe(document.body);
    }

    return () => {
      window.removeEventListener("resize", updateHeight);
      if (observer) observer.disconnect();
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 45) {
      nextSlide();
    } else if (distance < -45) {
      prevSlide();
    }
  };

  const slide = slides[current] ?? slides[0];
  if (!slide) return null;

  const currentTheme = THEME_NAMES[current] ?? "Couture Edition";

  return (
    <div
      ref={heroRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={isDesktop ? undefined : { height: heroHeight, minHeight: heroHeight }}
      className="relative w-full overflow-hidden bg-ink text-ivory select-none sm:h-[480px] md:h-[490px] lg:h-[512px]"
    >
      {/* Background Slides Cross-Fade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 1.0, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          {/* Image Container: Preserves complete image on desktop without cropping */}
          <div className="relative h-full w-full">
            {slide.mobile_image_url ? (
              <>
                {/* Mobile-optimized image (9:16 vertical fold framing - UNTOUCHED) */}
                <div className="block sm:hidden relative h-full w-full">
                  <Image
                    src={slide.mobile_image_url}
                    alt={slide.heading}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-[62%_12%]"
                  />
                </div>
                {/* Desktop image: Complete uncropped image on the right side with ambient backdrop */}
                <div className="hidden sm:block relative h-full w-full">
                  <Image
                    src={slide.desktop_image_url}
                    alt=""
                    fill
                    priority
                    aria-hidden="true"
                    className="object-cover blur-2xl opacity-30 scale-105 pointer-events-none"
                  />
                  <Image
                    src={slide.desktop_image_url}
                    alt={slide.heading}
                    fill
                    priority
                    sizes="100vw"
                    className="object-contain sm:object-right"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Fallback Mobile */}
                <div className="block sm:hidden relative h-full w-full">
                  <Image
                    src={slide.desktop_image_url}
                    alt={slide.heading}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-[62%_12%]"
                  />
                </div>
                {/* Fallback Desktop */}
                <div className="hidden sm:block relative h-full w-full">
                  <Image
                    src={slide.desktop_image_url}
                    alt=""
                    fill
                    priority
                    aria-hidden="true"
                    className="object-cover blur-2xl opacity-30 scale-105 pointer-events-none"
                  />
                  <Image
                    src={slide.desktop_image_url}
                    alt={slide.heading}
                    fill
                    priority
                    sizes="100vw"
                    className="object-contain sm:object-right"
                  />
                </div>
              </>
            )}
          </div>

          {/* Luxury Editorial Scrim / Gradients:
              - Mobile: Smooth gradient from bottom to top so lower-left text is 100% legible,
                leaving the upper-right/center open and pristine for the model.
              - Desktop: Smooth gradient from left to right so left text is 100% legible,
                leaving the right side completely clear for the model.
          */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 via-45% to-transparent sm:bg-gradient-to-r sm:from-ink/90 sm:via-ink/45 sm:via-55% sm:to-transparent pointer-events-none" />
          <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-ink/35 to-transparent pointer-events-none sm:hidden" />
        </motion.div>
      </AnimatePresence>

      {/* Hero Content:
          - Mobile: Pinned to lower-left / bottom with sleek compact spacing
          - Desktop: Positioned on left with expansive editorial layout
      */}
      <div className="relative z-10 flex h-full items-end justify-start pb-5 sm:pb-8 lg:pb-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 w-full flex flex-col items-start gap-2 sm:gap-3.5">
          {/* Eyebrow theme badge */}
          <div className="flex items-center gap-2">
            <span className="h-[1px] w-5 sm:w-6 bg-gold" />
            <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.24em] text-gold font-medium">
              {currentTheme}
            </span>
          </div>

          <div className="space-y-1 sm:space-y-2 max-w-xl lg:max-w-2xl">
            <TextReveal
              text={slide.heading}
              as="h1"
              className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-ivory tracking-tight leading-[1.12] sm:leading-[1.05]"
            />
            {slide.subheading && (
              <p className="text-xs sm:text-sm lg:text-base text-ivory/80 font-sans font-light max-w-sm sm:max-w-lg leading-relaxed line-clamp-2 sm:line-clamp-none">
                {slide.subheading}
              </p>
            )}
          </div>

          <div className="pt-0.5 sm:pt-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-ivory/80 text-ivory hover:bg-ivory hover:text-ink transition-all shadow-sm text-xs sm:text-sm px-5 py-2 sm:px-7 sm:py-3 tracking-wider uppercase"
            >
              <Link href={slide.cta_link}>{slide.cta_text}</Link>
            </Button>
          </div>

          {/* Slide Controls: Indicators + Prev/Next Buttons */}
          {slides.length > 1 && (
            <div className="w-full flex items-center justify-between pt-2.5 sm:pt-5 border-t border-ivory/15">
              <div className="flex items-center gap-3">
                <span className="font-sans text-[11px] sm:text-xs text-ivory/60 font-mono tracking-widest">
                  {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                </span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {slides.map((s, index) => (
                    <button
                      key={s.id}
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setCurrent(index)}
                      aria-label={`Go to slide ${index + 1}: ${THEME_NAMES[index] ?? s.heading}`}
                      className="group py-2 cursor-pointer"
                    >
                      <span
                        className={`block h-[2px] transition-all duration-500 ${
                          index === current
                            ? "w-8 sm:w-12 bg-gold"
                            : "w-3.5 sm:w-6 bg-ivory/30 group-hover:bg-ivory/60"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  className="p-1.5 sm:p-2.5 rounded-full border border-ivory/25 bg-ink/40 backdrop-blur-sm text-ivory hover:border-gold hover:bg-gold hover:text-ink transition-all cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="p-1.5 sm:p-2.5 rounded-full border border-ivory/25 bg-ink/40 backdrop-blur-sm text-ivory hover:border-gold hover:bg-gold hover:text-ink transition-all cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
