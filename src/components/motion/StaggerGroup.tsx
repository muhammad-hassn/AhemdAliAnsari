"use client";

import { motion } from "motion/react";
import { type ReactNode, Children } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { motionTokens } from "./tokens";

interface StaggerGroupProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerGroup({
  children,
  className,
  staggerDelay = 0.1,
}: StaggerGroupProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        visible: {
          transition: {
            staggerChildren: reduced ? 0 : staggerDelay,
          },
        },
      }}
    >
      {Children.map(children, (child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: reduced
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: motionTokens.distance.reveal },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: reduced ? 0 : motionTokens.duration.normal,
                ease: motionTokens.ease.out,
              },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
