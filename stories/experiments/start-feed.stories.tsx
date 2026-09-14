import type { Meta, StoryObj } from "@storybook/react-vite";

import { StartFeed } from "./start-feed";

/**
 * A look exploration, not part of the design system.
 *
 * This screen is a recreation of the `new_startfeed` frame from the RAQT
 * (Friends & Family) Figma file — see `docs/design-refs/new_startfeed.png`. It
 * deliberately ignores the token contract in `docs/TOKENS.md` and the rules in
 * `DESIGN.md`: every colour, radius and step is a literal value measured off
 * the exported frame, so the look can be judged on its own before any of it is
 * proposed as a token.
 *
 * Photography, avatars and the ATP mark are cropped from that same export.
 */
const meta = {
  title: "Experiments/Start Feed",
  component: StartFeed,
  parameters: { layout: "centered", options: { showPanel: false } },
} satisfies Meta<typeof StartFeed>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Light: Story = { args: { mode: "light" } };
