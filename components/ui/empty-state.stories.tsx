import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarPlus, Search, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * The state product never gets around to designing. Every story below is a
 * real empty a tournament app hits on day one.
 */
const meta = {
  title: "Components/Empty State",
  component: EmptyState,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="raqt min-h-screen bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Title and description only. The floor: it still reads as designed. */
export const Default: Story = {
  args: {
    title: "No matches yet",
    description:
      "Matches appear here as soon as the draw is published.",
  },
  render: (args) => (
    <div className="w-[28rem]">
      <EmptyState {...args} />
    </div>
  ),
};

/** With an icon. The medallion keeps any icon at the same optical size. */
export const WithIcon: Story = {
  args: {
    icon: <Trophy />,
    title: "No tournaments",
    description: "Create one and it will show up here with its draw and schedule.",
  },
  render: Default.render,
};

/**
 * With the way out. The action is the only green thing in the block — an empty
 * state with two competing calls to action is a menu, not an empty state.
 */
export const WithAction: Story = {
  args: {
    icon: <CalendarPlus />,
    title: "Nothing scheduled",
    description: "Add a match to this court and it will appear on the day sheet.",
    action: <Button>Schedule a match</Button>,
  },
  render: Default.render,
};

/** Compact: for an empty inside a panel that already has a heading of its own. */
export const Compact: Story = {
  args: {
    variant: "compact",
    icon: <Search />,
    title: "No results",
    description: "Try a different name or club.",
  },
  render: (args) => (
    <div className="w-80">
      <EmptyState {...args} />
    </div>
  ),
};

/**
 * Inside a card. `EmptyState` carries no border of its own precisely so it can
 * land on someone else's surface without drawing a second edge around itself.
 */
export const InsideCard: Story = {
  args: {
    variant: "compact",
    icon: <Trophy />,
    title: "No results yet",
    description: "Scores post here as soon as the first set is in.",
  },
  render: (args) => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Court 3</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState {...args} />
      </CardContent>
    </Card>
  ),
};

/**
 * The knobs. `icon` and `action` take elements rather than text, so their
 * controls pick from a short list of real ones through `mapping` — a control
 * cannot type a React node, but it can choose between them.
 */
export const Playground: Story = {
  args: {
    variant: "default",
    title: "No matches yet",
    description: "Matches appear here as soon as the draw is published.",
    icon: "trophy",
    action: "new match",
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "compact"] },
    title: { control: "text" },
    description: { control: "text" },
    icon: {
      control: "select",
      options: ["none", "trophy", "search", "calendar"],
      mapping: {
        none: undefined,
        trophy: <Trophy />,
        search: <Search />,
        calendar: <CalendarPlus />,
      },
    },
    action: {
      control: "select",
      options: ["none", "new match", "clear filters"],
      mapping: {
        none: undefined,
        "new match": <Button>New match</Button>,
        "clear filters": <Button variant="secondary">Clear filters</Button>,
      },
    },
    className: { control: "text" },
  },
  render: (args) => (
    <div className="w-[28rem]">
      <EmptyState {...args} />
    </div>
  ),
};
