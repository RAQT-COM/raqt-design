import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * The travelling highlight. Kept in the component file rather than in the token
 * layer because the registry ships one file per item: a consumer who pulls
 * `skeleton` into their app gets the keyframes with it, and pulls in nothing
 * else. React 19 hoists a `<style>` with a `precedence` into `<head>` and
 * dedupes it by `href`, so a page with fifty skeletons still emits one rule.
 *
 * The keyframes carry no colour — only travel. The sweep itself is painted by
 * the gradient below, out of the surface tokens, so it retints with the theme.
 */
const SHIMMER_KEYFRAMES = `
@keyframes raqt-shimmer {
  from { transform: translateX(-100%); }
  to   { transform: translateX(100%); }
}`;

/**
 * The loading state, so nobody has to design one.
 *
 * A skeleton is a *shape*, not a component per shape: give it the size and
 * radius of the thing it stands in for and it does the rest. `size-10
 * rounded-full` is an avatar, `h-4 w-40` is a line of text.
 *
 * Motion is opt-out, not opt-in: `prefers-reduced-motion` drops the travelling
 * sweep for an opacity pulse, which still reads as "loading" without anything
 * moving across the screen.
 */
function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "relative isolate overflow-hidden rounded-md bg-muted",
        "motion-reduce:animate-pulse",
        className,
      )}
      {...props}
    >
      <style href="raqt-shimmer" precedence="default">
        {SHIMMER_KEYFRAMES}
      </style>
      {/* The sweep. `surface-3` is the lightest surface in either mode, so the
          highlight reads as light-on-muted in dark and in light alike. Both
          stops are the same colour at zero alpha rather than `transparent`, so
          the fade cannot pick up a grey cast on the way out. */}
      <span
        className={cn(
          "pointer-events-none absolute inset-0 -translate-x-full",
          "bg-gradient-to-r from-surface-3/0 via-surface-3 to-surface-3/0",
          "motion-safe:animate-[raqt-shimmer_1.8s_ease-in-out_infinite]",
          "motion-reduce:hidden",
        )}
      />
    </div>
  );
}

export { Skeleton };
