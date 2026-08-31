import * as React from "react";

import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  /** Guidance shown under the control. Replaced by `error` when one is set. */
  hint?: string;
  /** Setting this is what makes the field invalid; there is no separate flag. */
  error?: string;
  required?: boolean;
  disabled?: boolean;
  /**
   * Not in the original prop list, but the state list asks for it: swaps the
   * control for a pulsing bar of the same height while its value loads, so a
   * form can render before its data arrives without the layout moving.
   */
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
};

/**
 * Label + control + message, wired together.
 *
 * The point of this component is that a product team never designs an error
 * state: pass `error` and the label tints, the control goes `aria-invalid`,
 * the message swaps, and screen readers are pointed at it — all from one prop.
 *
 * The message line reserves its height whether or not there is a message, so
 * validating a form never pushes the rest of the page down.
 */
function Field({
  label,
  hint,
  error,
  required = false,
  disabled = false,
  loading = false,
  className,
  children,
}: FieldProps) {
  const id = React.useId();
  const controlId = `${id}-control`;
  const messageId = `${id}-message`;

  const invalid = Boolean(error);
  // The error replaces the hint — never both stacked.
  const message = error ?? hint;
  const isDisabled = disabled || loading;

  const control = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id: controlId,
        disabled: isDisabled,
        required: required || undefined,
        "aria-invalid": invalid || undefined,
        "aria-describedby": message ? messageId : undefined,
      })
    : children;

  return (
    <div
      data-slot="field"
      data-invalid={invalid || undefined}
      data-disabled={isDisabled || undefined}
      className={cn("grid gap-2", className)}
    >
      <label
        htmlFor={controlId}
        className={cn(
          "text-sm font-medium leading-none",
          invalid ? "text-destructive" : "text-foreground",
          isDisabled && "opacity-50",
        )}
      >
        {label}
        {required && (
          <span className="text-destructive" aria-hidden="true">
            {" *"}
          </span>
        )}
      </label>

      {loading ? (
        <div
          className="h-9 w-full animate-pulse rounded-md bg-muted"
          aria-hidden="true"
        />
      ) : (
        control
      )}

      {/* Reserved whether or not there is a message: `min-h` is what stops
          validation from shifting the form. */}
      <p
        id={messageId}
        role={invalid ? "alert" : undefined}
        className={cn(
          "min-h-4 text-xs",
          invalid ? "text-destructive" : "text-muted-foreground",
          isDisabled && !invalid && "opacity-50",
        )}
      >
        {message}
      </p>
    </div>
  );
}

export { Field };
export type { FieldProps };
