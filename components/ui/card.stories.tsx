import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * The surface primitive. Every story on this page is one state, rendered — no
 * controls, because the point is that a product person sees the whole grammar
 * at once.
 *
 * The story that matters is **Nested**: it is the elevation rule made visible.
 */
const meta = {
  title: "Components/Card",
  component: Card,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="raqt min-h-screen bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

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

/** Content and nothing else. Elevation 1: the ground floor of the system. */
export const Default: Story = {
  render: () => (
    <Card className="w-96">
      <CardContent>
        <p className="text-sm">
          Padel doubles, Saturday. Sixteen pairs, two courts, one afternoon.
        </p>
      </CardContent>
    </Card>
  ),
};

/** The full slot set — header, action, content, footer — with dividers. */
export const WithHeaderAndFooter: Story = {
  name: "With header and footer",
  render: () => (
    <Card className="w-96">
      <CardHeader className="border-b border-border">
        <CardTitle>Spring Open</CardTitle>
        <CardDescription>Registration closes in three days.</CardDescription>
        <CardAction>
          <Badge variant="open">Open</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Format</span>
          <span>Doubles, round robin</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Entries</span>
          <span className="tabular-nums">12 / 16</span>
        </div>
      </CardContent>
      <CardFooter className="justify-end gap-2 border-t border-border">
        <Button variant="ghost">Details</Button>
        <Button>Enter</Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * A card that is itself a control. Hover raises the border to `primary`, not
 * the shadow: on a near-black ground a shadow has nothing to fall on.
 */
export const Interactive: Story = {
  render: () => (
    <Card interactive tabIndex={0} className="w-96">
      <CardHeader>
        <CardTitle>Club night — Tuesday</CardTitle>
        <CardDescription>Hover me, or tab to me.</CardDescription>
      </CardHeader>
    </Card>
  ),
};

/**
 * **The elevation rule.** A card inside a card steps *up* one surface and
 * *down* one radius step, and it does so by itself — the nesting is the only
 * instruction given. In dark mode elevation reads as lightness plus a hairline
 * border; in light mode the same three levels are white plus a real shadow.
 */
export const Nested: Story = {
  render: () => (
    <Card className="w-[28rem]">
      <CardHeader>
        <CardTitle>Court 2 — Group B</CardTitle>
        <CardDescription>
          surface-1 · rounded-lg · shadow-e1
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Match 3</CardTitle>
            <CardDescription>surface-2 · rounded-md · shadow-e2</CardDescription>
          </CardHeader>
          <CardContent>
            <Card>
              <CardContent className="text-xs text-muted-foreground">
                surface-3 · rounded-sm · shadow-e3
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  ),
};

/** The same card in both modes, from one set of token names. */
export const BothModes: Story = {
  name: "Both modes",
  render: () => (
    <TwoUp
      render={() => (
        <Card>
          <CardHeader>
            <CardTitle>Spring Open</CardTitle>
            <CardDescription>Doubles · 16 pairs</CardDescription>
            <CardAction>
              <Badge variant="live">Live</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Card>
              <CardContent className="text-xs text-muted-foreground">
                A nested surface, one step up.
              </CardContent>
            </Card>
          </CardContent>
          <CardFooter className="justify-end">
            <Button size="sm">Follow</Button>
          </CardFooter>
        </Card>
      )}
    />
  ),
};
