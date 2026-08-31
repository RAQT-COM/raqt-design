import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Every interactive state is declared twice: once as a real CSS state
 * (`hover:`, `active:`, `focus-visible:`) and once behind `data-force`.
 * The `data-force` twin is inert in an app — nothing sets the attribute —
 * but it lets a story render a genuinely-styled hover or focus state on a
 * static page, instead of a hand-copied approximation that can drift.
 */
const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap",
    "rounded-md font-medium outline-none transition-[color,background-color,border-color,box-shadow]",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    "focus-visible:ring-3 focus-visible:ring-ring/50",
    "data-[force=focus]:ring-3 data-[force=focus]:ring-ring/50",
    "disabled:pointer-events-none disabled:opacity-50",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 data-[force=hover]:bg-primary/90 data-[force=active]:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70 data-[force=hover]:bg-secondary/80 data-[force=active]:bg-secondary/70",
        ghost:
          "text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80 data-[force=hover]:bg-accent data-[force=hover]:text-accent-foreground data-[force=active]:bg-accent/80",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80 data-[force=hover]:bg-destructive/90 data-[force=active]:bg-destructive/80 focus-visible:ring-destructive/50 data-[force=focus]:ring-destructive/50",
        outline:
          "border border-input bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80 data-[force=hover]:bg-accent data-[force=hover]:text-accent-foreground data-[force=active]:bg-accent/80 focus-visible:border-ring data-[force=focus]:border-ring",
      },
      size: {
        sm: "h-8 gap-1.5 px-3 text-sm",
        md: "h-9 px-4 text-sm",
        lg: "h-11 px-6 text-base",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /**
     * Covers the label with a centred spinner and disables the button. The
     * label stays in the layout (hidden, not removed), so the button keeps
     * exactly the width it had — a spinner that is merely *inserted* widens
     * a button with no icon and shifts everything beside it.
     */
    loading?: boolean;
  };

function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && (
            <span className="absolute inset-0 flex items-center justify-center">
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
            </span>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-2",
              loading && "invisible",
            )}
          >
            {children}
          </span>
        </>
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
