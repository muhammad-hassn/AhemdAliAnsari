import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  spacing?: "default" | "tight" | "loose" | "none";
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ className, spacing = "default", children, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          "w-full relative",
          spacing === "tight" && "py-12 sm:py-16 lg:py-20",
          spacing === "default" && "py-16 sm:py-24 lg:py-32",
          spacing === "loose" && "py-24 sm:py-36 lg:py-44",
          spacing === "none" && "py-0",
          className,
        )}
        {...props}
      >
        {children}
      </section>
    );
  },
);

Section.displayName = "Section";
