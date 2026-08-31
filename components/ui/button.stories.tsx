import type { Meta, StoryObj } from "@storybook/react-vite";

import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * One story per state. A product person opens this page and sees every state
 * at once — controls would hide exactly what we want them to look at.
 *
 * Hover, active and focus are rendered through the component's own
 * `data-force` hook, so what you see is the real declared style rather than a
 * copy of it that can drift.
 */
const meta = {
  title: "Components/Button",
  component: Button,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="bg-background text-foreground rounded-lg p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const VARIANTS = ["primary", "secondary", "ghost", "destructive", "outline"] as const;

/** A labelled row. Not exported — Storybook turns every named export into a story. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <p className="text-muted-foreground text-xs uppercase tracking-widest">
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export const Variants: Story = {
  render: () => (
    <Row label="variants">
      {VARIANTS.map((variant) => (
        <Button key={variant} variant={variant}>
          {variant}
        </Button>
      ))}
    </Row>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Row label="sizes — sm · md (default) · lg · icon">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Search">
        <Search />
      </Button>
    </Row>
  ),
};

export const Hover: Story = {
  render: () => (
    <Row label="hover — forced, not simulated">
      {VARIANTS.map((variant) => (
        <Button key={variant} variant={variant} data-force="hover">
          {variant}
        </Button>
      ))}
    </Row>
  ),
};

export const Active: Story = {
  render: () => (
    <Row label="active">
      {VARIANTS.map((variant) => (
        <Button key={variant} variant={variant} data-force="active">
          {variant}
        </Button>
      ))}
    </Row>
  ),
};

export const FocusVisible: Story = {
  render: () => (
    <Row label="focus-visible — ring-ring, never removed">
      {VARIANTS.map((variant) => (
        <Button key={variant} variant={variant} data-force="focus">
          {variant}
        </Button>
      ))}
    </Row>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Row label="disabled">
      {VARIANTS.map((variant) => (
        <Button key={variant} variant={variant} disabled>
          {variant}
        </Button>
      ))}
    </Row>
  ),
};

/** The two rows are identical apart from `loading` — the widths must match. */
export const Loading: Story = {
  render: () => (
    <div className="grid gap-6">
      <Row label="idle">
        <Button>Save changes</Button>
        <Button variant="secondary">Save</Button>
        <Button size="icon" aria-label="Add">
          <Plus />
        </Button>
      </Row>
      <Row label="loading — same width, no layout shift">
        <Button loading>Save changes</Button>
        <Button variant="secondary" loading>
          Save
        </Button>
        <Button size="icon" loading aria-label="Adding" />
      </Row>
    </div>
  ),
};

export const WithLeadingIcon: Story = {
  render: () => (
    <Row label="with leading icon">
      <Button>
        <Plus />
        New match
      </Button>
      <Button variant="secondary">
        <Search />
        Find players
      </Button>
      <Button variant="outline" size="lg">
        <Plus />
        New tournament
      </Button>
    </Row>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <Row label="icon-only — aria-label is required">
      <Button size="icon" aria-label="Add match">
        <Plus />
      </Button>
      <Button size="icon" variant="secondary" aria-label="Search">
        <Search />
      </Button>
      <Button size="icon" variant="ghost" aria-label="Search">
        <Search />
      </Button>
      <Button size="icon" variant="outline" aria-label="Search">
        <Search />
      </Button>
    </Row>
  ),
};
