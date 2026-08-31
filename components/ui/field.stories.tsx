import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

/**
 * The star of the demo. Every state below comes from one prop — the argument
 * being that a product team never has to design an error state, because the
 * error state is already designed.
 */
const meta = {
  title: "Components/Field",
  component: Field,
  // Every story below drives the component through `render`, but `label` and
  // `children` are required props, so the type needs them defaulted here.
  args: { label: "Player name", children: <Input /> },
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="bg-background text-foreground w-96 rounded-lg p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Field label="Player name">
      <Input placeholder="Ada Lovelace" />
    </Field>
  ),
};

export const Filled: Story = {
  render: () => (
    <Field label="Player name">
      <Input defaultValue="Ada Lovelace" />
    </Field>
  ),
};

export const WithHint: Story = {
  render: () => (
    <Field label="Club email" hint="We only use this to send match reminders.">
      <Input type="email" defaultValue="ada@raqt.com" />
    </Field>
  ),
};

/** One prop. The label tints, the control goes `aria-invalid`, the message swaps. */
export const WithError: Story = {
  render: () => (
    <Field label="Club email" error="Enter a valid email address.">
      <Input type="email" defaultValue="ada@raqt" />
    </Field>
  ),
};

/**
 * Both props set. The error replaces the hint rather than stacking under it —
 * two messages under one control is how forms start shifting.
 */
export const ErrorAndHintTogether: Story = {
  render: () => (
    <div className="grid gap-6">
      <Field label="Club email" hint="We only use this to send match reminders.">
        <Input type="email" defaultValue="ada@raqt.com" />
      </Field>
      <Field
        label="Club email"
        hint="We only use this to send match reminders."
        error="Enter a valid email address."
      >
        <Input type="email" defaultValue="ada@raqt" />
      </Field>
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <Field label="Player name" required hint="Shown on the tournament draw.">
      <Input defaultValue="Ada Lovelace" />
    </Field>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Field label="Player name" disabled hint="Locked once the draw is published.">
      <Input defaultValue="Ada Lovelace" />
    </Field>
  ),
};

export const Loading: Story = {
  render: () => (
    <Field label="Player name" hint="Shown on the tournament draw." loading>
      <Input />
    </Field>
  ),
};

/**
 * The screenshot that goes in the deck: three fields, one in error, and the
 * form does not move when it appears — the message line was always there.
 */
export const FormWithOneFieldInError: Story = {
  name: "Form — one field in error",
  render: () => (
    <form
      className="bg-surface-1 border-border shadow-e1 grid gap-4 rounded-lg border p-6"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="grid gap-1">
        <h2 className="font-display text-xl">Register for the draw</h2>
        <p className="text-muted-foreground text-sm">
          Kungsholmen Open · mixed doubles
        </p>
      </div>

      <Field label="Player name" required hint="Shown on the tournament draw.">
        <Input defaultValue="Ada Lovelace" />
      </Field>

      <Field label="Club email" required error="Enter a valid email address.">
        <Input type="email" defaultValue="ada@raqt" />
      </Field>

      <Field label="Partner" hint="Leave empty to be assigned one.">
        <Input placeholder="Search players…" />
      </Field>

      <div className="flex justify-end gap-3">
        <Button variant="ghost" type="button">
          Cancel
        </Button>
        <Button type="submit">Register</Button>
      </div>
    </form>
  ),
};

/**
 * The knobs. The stories above each pin one prop to show what it does; this one
 * hands you all of them at once. Worth trying: type something into `error` and
 * watch the label, the border, the ring and the message all turn — one prop,
 * four decisions you never have to make.
 */
export const Playground: Story = {
  args: {
    label: "Player name",
    hint: "As it appears on the draw sheet.",
    error: "",
    required: false,
    disabled: false,
    loading: false,
  },
  argTypes: {
    label: { control: "text" },
    hint: { control: "text" },
    error: {
      control: "text",
      description: "The whole invalid API — a non-empty string is what makes the field invalid.",
    },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
    className: { control: "text" },
    // The control the field wraps. An element, so not something a control can set.
    children: { table: { disable: true } },
  },
};
