import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The input owns no error prop. Invalid styling is driven entirely by
 * `aria-invalid`, which `field` sets — so the accessible state and the
 * visible state can never disagree.
 *
 * `data-force` mirrors hover and focus for the story pages; see `button.tsx`.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        [
          "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1",
          // `text-base` below the `md` breakpoint stops iOS zooming on focus.
          "text-base text-foreground outline-none transition-[color,border-color,box-shadow] md:text-sm",
          "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
          "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "hover:border-ring/40 data-[force=hover]:border-ring/40",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "data-[force=focus]:border-ring data-[force=focus]:ring-3 data-[force=focus]:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // The focus rules recolour the border, so the invalid ones have to win
          // on focus too — otherwise an invalid focused input shows a red ring
          // around a green border.
          "aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/50",
          "aria-invalid:focus-visible:border-destructive",
          "aria-invalid:data-[force=focus]:ring-destructive/50",
          "aria-invalid:data-[force=focus]:border-destructive",
        ].join(" "),
        className,
      )}
      {...props}
    />
  );
}

export { Input };
