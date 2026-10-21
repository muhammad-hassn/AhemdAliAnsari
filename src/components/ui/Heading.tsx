import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4";
  size?: "hero" | "h1" | "h2" | "h3" | "h4";
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as: Tag = "h2", size, className, children, ...props }, ref) => {
    const computedSize = size ?? Tag;

    return (
      <Tag
        ref={ref}
        className={cn(
          "font-heading text-ink tracking-tight font-light",
          computedSize === "hero" && "text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95]",
          computedSize === "h1" && "text-3xl sm:text-5xl md:text-6xl leading-[1.05]",
          computedSize === "h2" && "text-2xl sm:text-4xl md:text-5xl leading-[1.1]",
          computedSize === "h3" && "text-xl sm:text-2xl md:text-3xl leading-[1.2]",
          computedSize === "h4" && "text-lg sm:text-xl md:text-2xl leading-[1.25]",
          className,
        )}
        {...props}
      >
        {children}
      </Tag>
    );
  },
);

Heading.displayName = "Heading";
