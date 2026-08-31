import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The surface primitive. Every other container in the system inherits its
 * grammar from this file, so the rule it encodes is the one worth stating:
 *
 * **A nested surface steps up one elevation and down one radius step.**
 *
 * On a near-black ground a shadow is invisible, so elevation in dark mode is
 * carried by surface lightness plus a hairline border; in light mode the same
 * three names resolve to white plus a real shadow. Both live in the token
 * layer, so this component names elevation and never paints it.
 */
type Level = 1 | 2 | 3;

/**
 * The three levels, written out in full. Tailwind only generates a utility
 * whose class name appears literally in a source file, so `bg-surface-${n}`
 * would compile to nothing — the map is the seam that keeps the lookup dynamic
 * and the class names literal.
 *
 * Padding steps down with the radius. The contract fixes surface and radius;
 * the padding step is this lane's call, because a level-3 card at level-1
 * padding reads as a box inside a box rather than as a thing on a thing.
 */
const CARD_CLASS: Record<Level, string> = {
  1: "bg-surface-1 rounded-lg shadow-e1 gap-6 py-6",
  2: "bg-surface-2 rounded-md shadow-e2 gap-5 py-5",
  3: "bg-surface-3 rounded-sm shadow-e3 gap-4 py-4",
};

/** The matching horizontal padding for the slots inside a card of each level. */
const SLOT_CLASS: Record<Level, string> = {
  1: "px-6 [.border-b]:pb-6 [.border-t]:pt-6",
  2: "px-5 [.border-b]:pb-5 [.border-t]:pt-5",
  3: "px-4 [.border-b]:pb-4 [.border-t]:pt-4",
};

/**
 * Nesting depth, so the rule applies itself. A `Card` inside a `Card` is one
 * level up without anyone remembering to say so — which is the point: the
 * elevation rule should be impossible to get wrong by omission. `level` still
 * overrides it for the cases where a card is not literally nested but reads as
 * though it were (a popover, a drawer panel).
 */
const CardLevelContext = React.createContext<0 | Level>(0);

/** The level of the card a slot is sitting in; 1 when used outside a card. */
function useSlotLevel(): Level {
  return React.useContext(CardLevelContext) || 1;
}

function Card({
  className,
  level,
  interactive = false,
  ...props
}: React.ComponentProps<"div"> & {
  /** Elevation. Defaults to one step above the enclosing card. */
  level?: Level;
  /** Hover and focus affordances for a card that is itself a control. */
  interactive?: boolean;
}) {
  const parent = React.useContext(CardLevelContext);
  const resolved = level ?? (Math.min(parent + 1, 3) as Level);

  return (
    <CardLevelContext.Provider value={resolved}>
      <div
        data-slot="card"
        data-level={resolved}
        className={cn(
          "flex flex-col border border-border text-card-foreground",
          CARD_CLASS[resolved],
          interactive &&
            "cursor-pointer transition-colors outline-none hover:border-primary/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
          className,
        )}
        {...props}
      />
    </CardLevelContext.Provider>
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        SLOT_CLASS[useSlotLevel()],
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("font-semibold leading-none", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

/** The top-right slot of a header — a badge, a menu, a secondary action. */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(SLOT_CLASS[useSlotLevel()], className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center", SLOT_CLASS[useSlotLevel()], className)}
      {...props}
    />
  );
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
export type { Level as CardLevel };
