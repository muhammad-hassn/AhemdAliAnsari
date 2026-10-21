import { type HTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center px-2.5 py-0.5 text-[10px] uppercase font-sans font-medium tracking-[0.12em] transition-colors border",
  {
    variants: {
      variant: {
        default: "border-hairline bg-ivory text-ink",
        gold: "border-gold/40 bg-gold/10 text-gold",
        burgundy: "border-burgundy/40 bg-burgundy/10 text-burgundy",
        solid: "border-ink bg-ink text-ivory",
        muted: "border-hairline bg-hairline/40 text-stone",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  },
);

Badge.displayName = "Badge";
