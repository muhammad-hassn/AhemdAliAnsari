"use client";

import { motion, useInView } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { motionTokens } from "./tokens";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduced ? false : { opacity: 0, y: motionTokens.distance.reveal }}
      animate={
        inView
          ? { opacity: 1, y: 0 }
          : reduced
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: motionTokens.distance.reveal }
      }
      transition={{
        duration: reduced ? 0 : motionTokens.duration.normal,
        ease: motionTokens.ease.out,
        delay: reduced ? 0 : delay,
      }}
    >
      {children}
    </motion.div>
  );
}
