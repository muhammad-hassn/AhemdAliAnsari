"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { Testimonial } from "@/types";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Heading } from "@/components/ui/Heading";
import { Reveal } from "@/components/motion/Reveal";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <div className="flex flex-col items-center text-center gap-5 bg-ivory border border-hairline p-8 shadow-xs h-full">
      {/* Avatar */}
      <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-hairline shadow-sm flex-shrink-0">
        {item.avatar_url ? (
          <Image
            src={item.avatar_url}
            alt={item.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[#EFE9DF] flex items-center justify-center">
            <span className="font-heading text-2xl text-gold font-light">
              {item.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Star Rating */}
      <div className="flex items-center gap-0.5 text-gold">
        {Array.from({ length: item.rating }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-gold stroke-none" />
        ))}
      </div>

      {/* Quote */}
      <p className="font-sans text-sm text-stone font-light leading-relaxed flex-1">
        {item.text}
      </p>

      {/* Author */}
      <div className="pt-2 border-t border-hairline w-full">
        <p className="font-sans text-xs uppercase tracking-[0.16em] font-medium text-ink">
          {item.name}
        </p>
        <p className="text-[11px] text-stone font-sans mt-0.5">
          Verified Customer
        </p>
      </div>
    </div>
  );
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (testimonials.length === 0) return null;

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <Section className="border-b border-hairline bg-[#F5F0E6]">
      <Container>
        <Reveal>
          <div className="text-center mb-12 space-y-2">
            <span className="font-sans text-xs uppercase tracking-[0.16em] text-stone">
              Patron Words
            </span>
            <Heading as="h2">Celebrated by Clients Worldwide</Heading>
          </div>
        </Reveal>

        {/* ─── Desktop: 3-column grid ─── */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((item, index) => (
            <Reveal key={item.id} delay={0.1 + index * 0.1}>
              <TestimonialCard item={item} />
            </Reveal>
          ))}
        </div>

        {/* ─── Mobile: swipeable slider ─── */}
        <div className="md:hidden">
          <div
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-400 ease-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {testimonials.map((item) => (
                <div key={item.id} className="min-w-full px-1">
                  <TestimonialCard item={item} />
                </div>
              ))}
            </div>
          </div>

          {/* Dots + Arrows */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous review"
              className="h-9 w-9 flex items-center justify-center border border-hairline text-ink hover:bg-hairline/40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to review ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === current ? "w-6 bg-gold" : "w-1.5 bg-hairline"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={next}
              aria-label="Next review"
              className="h-9 w-9 flex items-center justify-center border border-hairline text-ink hover:bg-hairline/40 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
