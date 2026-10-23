"use client";

import { useState, useEffect, useCallback } from "react";
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
  const prefersReducedMotion = useReducedMotion();

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

  const slide = slides[current] ?? slides[0];
  if (!slide) return null;

  const currentTheme = THEME_NAMES[current] ?? "Couture Edition";

  return (
    <div className="relative h-[72vh] sm:h-[82vh] lg:h-[88vh] min-h-[480px] sm:min-h-[580px] max-h-[950px] w-full overflow-hidden bg-ink text-ivory select-none">
      {/* Background Slides Cross-Fade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 1.2, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          {/* Ken Burns effect on the image */}
          <motion.div
            initial={prefersReducedMotion ? {} : { scale: 1.0 }}
            animate={prefersReducedMotion ? {} : { scale: 1.05 }}
            transition={{ duration: 7, ease: "linear" }}
            className="relative h-full w-full"
          >
            {slide.mobile_image_url ? (
              <>
                {/* Mobile-optimized image */}
                <div className="block sm:hidden relative h-full w-full">
                  <Image
                    src={slide.mobile_image_url}
                    alt={slide.heading}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center"
                  />
                </div>
                {/* Tablet / Desktop image */}
                <div className="hidden sm:block relative h-full w-full">
                  <Image
                    src={slide.desktop_image_url}
                    alt={slide.heading}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center sm:object-[center_35%]"
                  />
                </div>
              </>
            ) : (
              <Image
                src={slide.desktop_image_url}
                alt={slide.heading}
                fill
                priority
                sizes="100vw"
                className="object-cover object-center sm:object-[center_35%]"
              />
            )}
          </motion.div>
          {/* Subtle editorial scrim / gradient for crystal clear text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/20" />
        </motion.div>
      </AnimatePresence>

      {/* Hero Content */}
      <div className="relative z-10 flex h-full items-end pb-10 sm:pb-16 lg:pb-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 w-full flex flex-col items-start gap-4 sm:gap-5">
          {/* Eyebrow theme badge */}
          <div className="flex items-center gap-2">
            <span className="h-[1px] w-6 bg-gold" />
            <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.28em] text-gold font-medium">
              {currentTheme}
            </span>
          </div>

          <div className="space-y-2.5 sm:space-y-3.5 max-w-2xl">
            <TextReveal
              text={slide.heading}
              as="h1"
              className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-ivory tracking-tight leading-[1.05] sm:leading-[0.98]"
            />
            {slide.subheading && (
              <p className="text-xs sm:text-sm lg:text-base text-ivory/85 font-sans font-light max-w-lg leading-relaxed line-clamp-3 sm:line-clamp-none">
                {slide.subheading}
              </p>
            )}
          </div>

          <div className="pt-1 sm:pt-2">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-ivory/80 text-ivory hover:bg-ivory hover:text-ink transition-all shadow-sm text-xs sm:text-sm"
            >
              <Link href={slide.cta_link}>{slide.cta_text}</Link>
            </Button>
          </div>

          {/* Slide Controls: Indicators + Prev/Next Buttons */}
          {slides.length > 1 && (
            <div className="w-full flex items-center justify-between pt-4 sm:pt-6 border-t border-ivory/15">
              <div className="flex items-center gap-3">
                <span className="font-sans text-xs text-ivory/60 font-light tracking-widest">
                  {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                </span>
                <div className="flex items-center gap-2">
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
                            ? "w-10 bg-ivory"
                            : "w-5 bg-ivory/40 group-hover:bg-ivory/70"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  className="p-2 sm:p-2.5 rounded-full border border-ivory/30 bg-ink/40 backdrop-blur-sm text-ivory hover:border-ivory hover:bg-ivory hover:text-ink transition-all cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="p-2 sm:p-2.5 rounded-full border border-ivory/30 bg-ink/40 backdrop-blur-sm text-ivory hover:border-ivory hover:bg-ivory hover:text-ink transition-all cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
