import type { Meta, StoryObj } from "@storybook/react-vite";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

/**
 * The invalid story sets `aria-invalid` by hand to show what the input does on
 * its own. In real use nobody writes that: `field` sets it from its `error`
 * prop — see the Field stories.
 */
const meta = {
  title: "Components/Input",
  component: Input,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="bg-background text-foreground w-96 rounded-lg p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <p className="text-muted-foreground text-xs uppercase tracking-widest">
        {label}
      </p>
      {children}
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <Row label="default">
      <Input aria-label="Player name" />
    </Row>
  ),
};

export const Placeholder: Story = {
  render: () => (
    <Row label="placeholder">
      <Input placeholder="Search players…" aria-label="Search players" />
    </Row>
  ),
};

export const Filled: Story = {
  render: () => (
    <Row label="filled">
      <Input defaultValue="Ada Lovelace" aria-label="Player name" />
    </Row>
  ),
};

export const Focused: Story = {
  render: () => (
    <Row label="focus-visible — forced">
      <Input data-force="focus" defaultValue="Ada Lovelace" aria-label="Player name" />
    </Row>
  ),
};

export const Hover: Story = {
  render: () => (
    <Row label="hover — forced">
      <Input data-force="hover" placeholder="Search players…" aria-label="Search players" />
    </Row>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Row label="disabled">
      <Input disabled defaultValue="Ada Lovelace" aria-label="Player name" />
    </Row>
  ),
};

export const Invalid: Story = {
  render: () => (
    <div className="grid gap-6">
      <Row label="invalid — driven by aria-invalid">
        <Input aria-invalid defaultValue="not-an-email" aria-label="Email" />
      </Row>
      <Row label="invalid + focused">
        <Input aria-invalid data-force="focus" defaultValue="not-an-email" aria-label="Email" />
      </Row>
    </div>
  ),
};

/**
 * The input owns no icon prop. Leading icons are composition: a relative
 * wrapper, an absolutely-positioned icon, and padding from the spacing scale.
 */
export const WithLeadingIcon: Story = {
  render: () => (
    <Row label="with leading icon — composed, not a prop">
      <div className="relative">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input className="pl-9" placeholder="Search players…" aria-label="Search players" />
      </div>
    </Row>
  ),
};
