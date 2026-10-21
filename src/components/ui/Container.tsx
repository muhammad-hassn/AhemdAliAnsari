import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "default" | "narrow" | "wide";
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-full mx-auto px-4 sm:px-8 lg:px-12",
          size === "narrow" && "max-w-4xl",
          size === "default" && "max-w-[1440px]",
          size === "wide" && "max-w-[1600px]",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Container.displayName = "Container";
