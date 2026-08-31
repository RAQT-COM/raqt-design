import type { Meta, StoryObj } from "@storybook/react-vite";

import { MatchCardSkeleton } from "@/components/patterns/match-card";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * One story per shape. A skeleton has no props to play with — the whole API is
 * the size and radius you give it — so the interesting axis is what it is
 * standing in for.
 */
const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof Skeleton>;

/** A single line of text. */
export const Line: Story = {
  render: () => <Skeleton className="h-4 w-64" />,
};

/** A block of copy. Ragged last line, because real paragraphs are. */
export const Paragraph: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  ),
};

/** An avatar beside its name and handle — the commonest list row there is. */
export const Avatar: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  ),
};

/** A whole card, standing in for itself: same slots, same rhythm. */
export const CardBlock: Story = {
  name: "Card skeleton",
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3.5 w-56" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-28 rounded-md" />
      </CardFooter>
    </Card>
  ),
};

/**
 * The match card's own loading state, shipped beside it. Every block matches
 * the real layout, so the list does not reflow when the scores arrive.
 */
export const MatchCard: Story = {
  name: "Match-card skeleton",
  render: () => (
    <div className="w-96">
      <MatchCardSkeleton />
    </div>
  ),
};

/**
 * The whole point of a skeleton is a list of them. Nothing staggers the
 * animation: one sweep crossing every row at once reads as a page loading,
 * where offset sweeps read as noise.
 */
export const List: Story = {
  name: "In a list",
  render: () => (
    <div className="flex w-96 flex-col gap-3">
      <MatchCardSkeleton />
      <MatchCardSkeleton />
      <MatchCardSkeleton />
    </div>
  ),
};
