import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckIcon, ClockIcon, TrophyIcon, ZapIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

/**
 * The status vocabulary, every word of it on one page.
 *
 * Two families, deliberately kept apart: **meaning** (the seven any product
 * needs) and **match status** (the domain's own four, wired to
 * `--color-status-*`). Reach for the domain word when the thing is a match —
 * `live`, not `destructive` — and retinting later stays a token change.
 */
const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="raqt min-h-screen bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The two modes side by side. Local to this page: story files own themselves. */
function TwoUp({ render }: { render: () => ReactNode }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {(["dark", "light"] as const).map((mode) => (
        <div key={mode}>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest opacity-60">
            {mode === "dark" ? "dark — default" : "light — derived"}
          </p>
          <div
            className={
              mode === "dark"
                ? "raqt rounded-lg border border-border bg-background p-6"
                : "raqt light rounded-lg border border-border bg-background p-6"
            }
          >
            {render()}
          </div>
        </div>
      ))}
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-xs uppercase tracking-widest opacity-60">
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

/** Every badge in the system, side by side. Nothing to click, nothing to set. */
export const AllVariants: Story = {
  name: "All variants",
  render: () => (
    <div className="flex flex-col gap-6">
      <Row label="meaning">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="info">Info</Badge>
      </Row>
      <Row label="match status">
        <Badge variant="upcoming">Upcoming</Badge>
        <Badge variant="live">Live</Badge>
        <Badge variant="finished">Finished</Badge>
        <Badge variant="open">Open</Badge>
      </Row>
    </div>
  ),
};

/**
 * `live` carries a pulsing dot, and only the dot pulses — a badge that animates
 * whole turns a list of matches into a strobe. Under `prefers-reduced-motion`
 * the dot stays and the pulse stops.
 */
export const Live: Story = {
  name: "Live — the pulsing dot",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Badge variant="live">Live</Badge>
      <Badge variant="live">Court 2 · Set 3</Badge>
      <span className="text-sm text-muted-foreground">
        The dot is the signal; the pulse is only emphasis.
      </span>
    </div>
  ),
};

/** With a leading icon. Icons are sized by the badge, never by the caller. */
export const WithIcon: Story = {
  name: "With icon",
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>
        <TrophyIcon />
        Champion
      </Badge>
      <Badge variant="success">
        <CheckIcon />
        Confirmed
      </Badge>
      <Badge variant="upcoming">
        <ClockIcon />
        14:30
      </Badge>
      <Badge variant="info">
        <ZapIcon />
        Fast four
      </Badge>
    </div>
  ),
};

/** As a link. `asChild` hands the element over; the dot survives it. */
export const AsLink: Story = {
  name: "As a link",
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge asChild variant="live">
        <a href="#watch">Watch court 2</a>
      </Badge>
      <Badge asChild variant="outline">
        <a href="#draw">Full draw</a>
      </Badge>
    </div>
  ),
};

/** The same eleven badges in both modes, from one set of token names. */
export const BothModes: Story = {
  name: "Both modes",
  render: () => (
    <TwoUp
      render={() => (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="info">Info</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="upcoming">Upcoming</Badge>
            <Badge variant="live">Live</Badge>
            <Badge variant="finished">Finished</Badge>
            <Badge variant="open">Open</Badge>
          </div>
        </div>
      )}
    />
  ),
};
