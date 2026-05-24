"use client";

/**
 * components/ui/button.tsx
 * Variantes do app — `primary` = verde-bandeira (CTA padrão).
 * Compatível com a base shadcn/ui (props passam para <button>).
 */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-display font-semibold tracking-wide",
    "rounded-full border border-transparent",
    "transition active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none",
    "focus-visible:outline-none focus-visible:shadow-focus",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:   "bg-green text-white shadow-ground hover:brightness-[.97]",
        gold:      "bg-gold text-ink shadow-ground-gold hover:brightness-[.97]",
        secondary: "bg-elev text-ink border-[var(--line-strong)] hover:bg-sunken",
        ghost:     "bg-transparent text-ink hover:bg-ink/5",
        danger:    "bg-magenta text-white hover:brightness-[.95]",
        dark:      "bg-ink text-ink-invert hover:bg-black",
      },
      size: {
        sm: "h-9 px-3.5 text-sm",
        md: "h-12 px-5 text-base",
        lg: "h-14 px-6 text-lg",
        icon: "h-11 w-11 p-0",
      },
      full: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, full, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, full }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
