"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { Testimonial } from "@/types";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/motion/Reveal";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  const [current, setCurrent] = useState(0);

  if (testimonials.length === 0) return null;

  const prev = () => {
    setCurrent((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const next = () => {
    setCurrent((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const item = testimonials[current];

  return (
    <Section className="border-b border-hairline bg-[#F5F0E6]">
      <Container size="narrow">
        <Reveal>
          <div className="text-center mb-12 space-y-2">
            <span className="font-sans text-xs uppercase tracking-[0.16em] text-stone">
              Patron Words
            </span>
            <Heading as="h2">Celebrated by Brides Worldwide</Heading>
          </div>
        </Reveal>

        {item && (
          <Reveal delay={0.1}>
            <div className="relative border border-hairline bg-ivory p-8 sm:p-14 text-center flex flex-col items-center gap-6 shadow-xs">
              {/* Star Rating */}
              <div className="flex items-center gap-1 text-gold">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-gold stroke-none" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="font-heading text-xl sm:text-2xl md:text-3xl font-light text-ink leading-relaxed tracking-tight max-w-2xl">
                “{item.text}”
              </blockquote>

              {/* Author */}
              <div className="pt-2">
                <p className="font-sans text-xs uppercase tracking-[0.16em] font-medium text-ink">
                  {item.name}
                </p>
                <p className="text-[11px] text-stone font-sans mt-0.5">
                  Verified Haute Couture Patron
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-4 pt-4">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={prev}
                  aria-label="Previous testimonial"
                  className="h-10 w-10 flex items-center justify-center border border-hairline text-ink hover:bg-hairline/40 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-sans text-stone tracking-[0.1em]">
                  0{current + 1} / 0{testimonials.length}
                </span>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={next}
                  aria-label="Next testimonial"
                  className="h-10 w-10 flex items-center justify-center border border-hairline text-ink hover:bg-hairline/40 transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Reveal>
        )}
      </Container>
    </Section>
  );
}
