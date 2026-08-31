import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * The status vocabulary.
 *
 * Two families live here and they are not interchangeable. The first seven
 * variants are **generic meaning** — the same seven any product needs. The last
 * four are **match statuses**, the domain's own words, wired to the
 * `--color-status-*` tokens. A match that is live is `live`, never
 * `destructive`: the badge says what a thing *is*, and the token layer decides
 * what that looks like. Retinting `live` later is then one token, not a search
 * through every screen for the badge that happened to be red.
 */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full border border-transparent px-2 py-0.5 text-xs font-medium transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/80",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        success: "bg-success text-success-foreground [a&]:hover:bg-success/90",
        warning: "bg-warning text-warning-foreground [a&]:hover:bg-warning/90",
        destructive:
          "bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90",
        info: "bg-info text-info-foreground [a&]:hover:bg-info/90",

        upcoming: "bg-status-upcoming text-status-upcoming-foreground",
        live: "bg-status-live text-status-live-foreground",
        finished: "bg-status-finished text-status-finished-foreground",
        open: "bg-status-open text-status-open-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

/**
 * Only `live` moves, and only the dot moves — a badge that pulses in its
 * entirety turns a list of matches into a strobe. `animate-ping` is Tailwind's
 * own keyframe, so nothing is hand-authored here, and `motion-reduce` drops it
 * to a plain dot rather than to nothing: the dot is the signal, the pulse is
 * only emphasis.
 */
function LiveDot() {
  return (
    <span aria-hidden="true" className="relative flex size-1.5">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-75 motion-reduce:hidden" />
      <span className="relative inline-flex size-1.5 rounded-full bg-current" />
    </span>
  );
}

function Badge({
  className,
  variant = "default",
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {variant === "live" ? <LiveDot /> : null}
      {/* `Slottable` marks which child the consumer's element replaces under
          `asChild`, so a badge rendered as a link keeps its dot. */}
      <Slot.Slottable>{children}</Slot.Slottable>
    </Comp>
  );
}

export { Badge, badgeVariants };
