"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  speed?: number;
  priority?: boolean;
}

export function ParallaxImage({
  src,
  alt,
  className,
  containerClassName,
  speed = 0.15,
  priority = false,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? ["0%", "0%"] : [`-${speed * 100}%`, `${speed * 100}%`],
  );

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${containerClassName ?? ""} ${className ?? ""}`}
    >
      <motion.div style={{ y }} className="relative h-[120%] w-full -translate-y-[10%]">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          priority={priority}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </motion.div>
    </div>
  );
}
