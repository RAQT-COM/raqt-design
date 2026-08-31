import * as React from "react";
import { XIcon } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/lib/utils";

/**
 * The overlay proof.
 *
 * A dialog is the one component that leaves the tree it was written in: Radix
 * portals it to `document.body`. Custom properties inherit down the DOM, so a
 * portalled panel lands *outside* the `.raqt` scope and picks up whatever the
 * host app's `:root` says — in `raqt-public` that is their palette, not ours.
 * The panel would render in the host's colours and nobody would know why.
 *
 * The fix is one class. `DialogPortal` re-establishes the scope inside the
 * portal with `display: contents`, which generates no box at all — inheritance
 * follows the DOM tree regardless of display, so the tokens arrive and the
 * layout is untouched. `scope` carries the mode across for a host in light
 * mode, which the portal would otherwise leave behind with the rest of the
 * ancestry.
 */
const DEFAULT_SCOPE = "raqt";

/**
 * Enter and exit motion. Radix keeps a closing element mounted until its CSS
 * *animation* ends, so this cannot be a transition. Kept in the component file
 * for the same reason `skeleton` keeps its shimmer there: the registry ships
 * one file per item, so a consumer who pulls `dialog` gets its motion with it.
 *
 * `scale` is the standalone property, not a transform, so it composes with the
 * centring translate instead of fighting it. Reduced motion keeps the
 * animation — Radix needs it to time the unmount — and collapses its duration.
 */
const DIALOG_KEYFRAMES = `
@keyframes raqt-dialog-in {
  from { opacity: 0; scale: 0.96; }
  to   { opacity: 1; scale: 1; }
}
@keyframes raqt-dialog-out {
  from { opacity: 1; scale: 1; }
  to   { opacity: 0; scale: 0.96; }
}
@keyframes raqt-scrim-in  { from { opacity: 0; } to { opacity: 1; } }
@keyframes raqt-scrim-out { from { opacity: 1; } to { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  [data-slot="dialog-overlay"],
  [data-slot="dialog-content"] { animation-duration: 1ms !important; }
}`;

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  scope = DEFAULT_SCOPE,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal> & {
  /** The theme scope to re-establish inside the portal. `"raqt light"` in a light-mode host. */
  scope?: string;
}) {
  return (
    <DialogPrimitive.Portal data-slot="dialog-portal" {...props}>
      <div className={cn("contents", scope)}>{children}</div>
    </DialogPrimitive.Portal>
  );
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

/**
 * The scrim. `background` at reduced opacity rather than black, so the page
 * behind dims towards the ground colour of whichever mode is on.
 */
function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-background/80",
        "data-[state=open]:animate-[raqt-scrim-in_150ms_ease-out]",
        "data-[state=closed]:animate-[raqt-scrim-out_120ms_ease-in]",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  scope,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  scope?: string;
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal scope={scope}>
      <style href="raqt-dialog" precedence="default">
        {DIALOG_KEYFRAMES}
      </style>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          // `surface-2` and `shadow-e3`: the panel is two steps off the ground,
          // which in dark mode is lightness and a border and in light mode is a
          // real shadow on white. One vocabulary, both modes.
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border border-border bg-surface-2 p-6 text-foreground shadow-e3 outline-none sm:max-w-lg",
          "max-h-[calc(100dvh-2rem)] overflow-y-auto",
          "data-[state=open]:animate-[raqt-dialog-in_150ms_ease-out]",
          "data-[state=closed]:animate-[raqt-dialog-out_120ms_ease-in]",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute right-4 top-4 rounded-sm text-muted-foreground opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg font-semibold leading-none", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
