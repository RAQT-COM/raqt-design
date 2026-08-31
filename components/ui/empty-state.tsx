import type { ComponentProps, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * The empty state, so nobody has to design one either.
 *
 * Deliberately borderless: an empty state is content, not a container. Drop it
 * inside a `Card`, a dashed well, or a bare region and it inherits whatever
 * surface it lands on rather than fighting it with a second edge.
 *
 * `compact` is for empties inside something else already — a panel, a sidebar,
 * a table — where the full display title would out-shout its own container.
 */
const emptyStateVariants = cva(
  "flex flex-col items-center justify-center text-center",
  {
    variants: {
      variant: {
        default: "gap-3 px-6 py-12",
        compact: "gap-2 px-4 py-6",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

/**
 * The icon sits in a medallion rather than loose on the surface, so an icon of
 * any weight lands at the same optical size. Muted, never `primary` — the one
 * green thing in an empty state should be the action, if there is one.
 */
const mediaVariants = cva(
  "flex shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground",
  {
    variants: {
      variant: {
        default: "size-12 [&_svg]:size-5",
        compact: "size-9 [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

const titleVariants = cva("text-balance text-foreground", {
  variants: {
    variant: {
      default: "font-display text-xl",
      compact: "text-base font-semibold",
    },
  },
  defaultVariants: { variant: "default" },
});

const descriptionVariants = cva(
  "max-w-prose text-pretty text-muted-foreground",
  {
    variants: {
      variant: { default: "text-sm", compact: "text-xs" },
    },
    defaultVariants: { variant: "default" },
  },
);

type EmptyStateProps = Omit<ComponentProps<"div">, "title"> &
  VariantProps<typeof emptyStateVariants> & {
    icon?: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    /** Usually a `Button`. Anything renderable works. */
    action?: ReactNode;
  };

function EmptyState({
  className,
  variant = "default",
  icon,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      data-variant={variant}
      className={cn(emptyStateVariants({ variant }), className)}
      {...props}
    >
      {icon ? (
        <div data-slot="empty-state-media" className={mediaVariants({ variant })}>
          {icon}
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <p data-slot="empty-state-title" className={titleVariants({ variant })}>
          {title}
        </p>
        {description ? (
          <p
            data-slot="empty-state-description"
            className={descriptionVariants({ variant })}
          >
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <div
          data-slot="empty-state-action"
          className={variant === "compact" ? "pt-1" : "pt-2"}
        >
          {action}
        </div>
      ) : null}
    </div>
  );
}

export { EmptyState, emptyStateVariants };
