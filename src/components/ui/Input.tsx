import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, disabled, ...props }, ref) => {
    return (
      <input
        type={type}
        disabled={disabled ? true : undefined}
        suppressHydrationWarning
        className={cn(
          "flex h-12 w-full border border-hairline bg-transparent px-4 py-2 text-sm text-ink font-sans placeholder:text-stone/70 focus-visible:outline-none focus-visible:border-ink transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
