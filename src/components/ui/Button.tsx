import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-sans uppercase tracking-[0.12em] text-xs font-medium transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink active:scale-[0.99]",
  {
    variants: {
      variant: {
        solid: "bg-ink text-ivory hover:bg-[#2d2825] border border-ink",
        outline: "bg-transparent text-ink border border-ink hover:bg-ink hover:text-ivory",
        ghost: "bg-transparent text-ink hover:bg-hairline/50",
        "text-link": "bg-transparent text-ink underline underline-offset-4 hover:text-gold p-0 h-auto",
        gold: "bg-gold text-ivory hover:bg-[#9c7b48] border border-gold",
      },
      size: {
        default: "h-12 px-8 min-w-[44px]",
        sm: "h-10 px-5 text-[11px] min-w-[44px]",
        lg: "h-14 px-10 text-sm min-w-[44px]",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "default",
    },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        disabled={disabled ? true : undefined}
        suppressHydrationWarning
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
