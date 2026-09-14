import type { Meta, StoryObj } from "@storybook/react-vite";

import { TournamentSearch } from "./tournament-search";

/**
 * Tournament search, built against [`DESIGN-ALT.md`](../../DESIGN-ALT.md)
 * rather than the token contract.
 *
 * Live: the text field, the country sheet and the status filter all filter the
 * list. Rules being exercised — flat black because this is a content screen and
 * not the feed; one green, used only for `OPEN` and the sheet's check; the
 * country filter collapses to a sheet because it has more than four options
 * while the three status options stay visible; active nav is full white against
 * dimmed, the same device that marks a won match.
 */
const meta = {
  title: "Experiments/Tournament Search",
  component: TournamentSearch,
  parameters: { layout: "centered", options: { showPanel: false } },
} satisfies Meta<typeof TournamentSearch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
