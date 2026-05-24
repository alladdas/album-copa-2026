"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  leading?: string;  // CSS color for the status dot
  tone?: string;     // background when active (default: var(--ink))
}

export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ children, active, leading, tone, className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 font-sans text-sm font-semibold",
        active
          ? "border border-transparent text-white"
          : "border border-line bg-elev text-ink",
        className
      )}
      style={active ? { background: tone ?? "var(--ink)" } : undefined}
      {...props}
    >
      {leading && (
        <span
          aria-hidden
          className="h-2 w-2 rounded-full"
          style={{ background: leading }}
        />
      )}
      {children}
    </button>
  )
);
Chip.displayName = "Chip";
