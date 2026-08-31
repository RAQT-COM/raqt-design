import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  MatchCard,
  MatchCardSkeleton,
  type MatchCardProps,
  type MatchStatus,
} from "@/components/patterns/match-card";

/**
 * The domain component. Everything on this page is `card` and `badge` wearing
 * the token layer — there is no bespoke surface, edge or colour in the file.
 */
const meta = {
  title: "Patterns/Match Card",
  component: MatchCard,
  parameters: { layout: "padded" },
} satisfies Meta<typeof MatchCard>;

export default meta;

/** A story driven by props. */
type Story = StoryObj<typeof meta>;

/**
 * A story that renders a whole composition rather than one configured card, so
 * it carries no props of its own.
 */
type Composition = StoryObj<typeof MatchCard>;

/** Every story renders at the width of a real match list column. */
const frame = (args: MatchCardProps) => (
  <div className="w-[26rem]">
    <MatchCard {...args} />
  </div>
);

const SINGLES = {
  a: { players: ["Elin Bergqvist"] },
  b: { players: ["Nadia Okafor"] },
};

const DOUBLES = {
  a: { players: ["Elin Bergqvist", "Tomas Lindqvist"] },
  b: { players: ["Nadia Okafor", "Priya Raman"] },
};

/** Not started: the time takes the score's place. */
export const Upcoming: Story = {
  args: {
    status: "upcoming",
    sides: [SINGLES.a, SINGLES.b],
    court: "Court 3",
    time: "14:30",
  },
  render: frame,
};

/**
 * In play. The set being played carries the surface treatment, and neither
 * side is dimmed — a live match has no loser yet.
 */
export const Live: Story = {
  args: {
    status: "live",
    sides: [
      { ...DOUBLES.a, scores: [6, 3] },
      { ...DOUBLES.b, scores: [4, 5] },
    ],
    court: "Centre Court",
    time: "13:05",
  },
  render: frame,
};

/** Over. The losing line drops to `muted-foreground`; the winner keeps the ink. */
export const Finished: Story = {
  args: {
    status: "finished",
    sides: [
      { ...SINGLES.a, scores: [6, 6] },
      { ...SINGLES.b, scores: [4, 3] },
    ],
    court: "Court 1",
    time: "11:00",
  },
  render: frame,
};

/** One name a side. */
export const Singles: Story = {
  args: {
    status: "finished",
    sides: [
      { ...SINGLES.a, scores: [7, 4] },
      { ...SINGLES.b, scores: [5, 6] },
    ],
    court: "Court 2",
    time: "09:45",
  },
  render: frame,
};

/** Two names a side, one score line. The pair is the competitor, not the player. */
export const Doubles: Story = {
  args: {
    status: "finished",
    sides: [
      { ...DOUBLES.a, scores: [3, 4] },
      { ...DOUBLES.b, scores: [6, 6] },
    ],
    court: "Court 4",
    time: "10:15",
  },
  render: frame,
};

/**
 * Long names in a narrow column — a three-set doubles match in a sidebar, the
 * worst case the layout has. Names truncate; the score never gets pushed off
 * the card, and the card never grows a horizontal scrollbar.
 */
export const LongPlayerNames: Story = {
  name: "Long player names",
  args: {
    status: "live",
    sides: [
      {
        players: [
          "Konstantinos Papadopoulos-Andersson",
          "Maximiliano Fernández de la Vega",
        ],
        scores: [6, 2, 4],
      },
      {
        players: ["Aleksandra Wiśniewska-Kowalczyk", "Chidinma Onyekaozulu-Balogun"],
        scores: [4, 6, 3],
      },
    ],
    court: "Show Court — Hall B",
    time: "16:20",
  },
  render: (args) => (
    <div className="w-72">
      <MatchCard {...args} />
    </div>
  ),
};

/** Three sets. The board widens; nothing else changes. */
export const ThreeSetMatch: Story = {
  name: "Three-set match",
  args: {
    status: "finished",
    sides: [
      { ...DOUBLES.a, scores: [4, 6, 7] },
      { ...DOUBLES.b, scores: [6, 3, 5] },
    ],
    court: "Centre Court",
    time: "18:00",
  },
  render: frame,
};

/** Waiting on the data, at exactly the size the card will be. */
export const Loading: Composition = {
  render: () => (
    <div className="w-[26rem]">
      <MatchCardSkeleton />
    </div>
  ),
};

/**
 * Light mode, through the same `.raqt` scope a host app gets. Not a second set
 * of components — the same ones, reading a different set of custom properties.
 * Elevation swaps from surface lightness to a real shadow on the way across.
 */
export const LightMode: Composition = {
  name: "In light mode",
  render: () => (
    <div className="raqt light flex w-[26rem] flex-col gap-3 rounded-lg bg-background p-4">
      <MatchCard
        status="live"
        sides={[
          { ...DOUBLES.a, scores: [6, 3] },
          { ...DOUBLES.b, scores: [4, 5] },
        ]}
        court="Centre Court"
        time="13:05"
      />
      <MatchCard
        status="finished"
        sides={[
          { ...SINGLES.a, scores: [6, 6] },
          { ...SINGLES.b, scores: [4, 3] },
        ]}
        court="Court 1"
        time="11:00"
      />
    </div>
  ),
};

/**
 * The three statuses stacked, which is how they actually appear: a day sheet
 * reading finished at the top, live in the middle, upcoming below.
 */
export const DaySheet: Composition = {
  name: "A day's matches",
  render: () => (
    <div className="flex w-[26rem] flex-col gap-3">
      <MatchCard
        status="finished"
        sides={[
          { ...DOUBLES.a, scores: [6, 6] },
          { ...DOUBLES.b, scores: [2, 4] },
        ]}
        court="Court 1"
        time="11:00"
      />
      <MatchCard
        status="live"
        sides={[
          { ...SINGLES.a, scores: [6, 3] },
          { ...SINGLES.b, scores: [4, 5] },
        ]}
        court="Centre Court"
        time="13:05"
      />
      <MatchCard
        status="upcoming"
        sides={[
          { players: ["Winner of Court 1"] },
          { players: ["Winner of Centre Court"] },
        ]}
        court="Centre Court"
        time="15:30"
      />
    </div>
  ),
};

/**
 * The knobs. `sides` is a pair of objects, which no control can type, so the
 * playground exposes the two things that actually vary — singles or doubles, and
 * how many sets are on the board — and builds the pair from them.
 */
type PlaygroundArgs = {
  status: MatchStatus;
  shape: "singles" | "doubles";
  sets: 0 | 1 | 2 | 3;
  court: string;
  time: string;
  interactive: boolean;
};

const SET_SCORES: [number, number][] = [
  [6, 2],
  [4, 6],
  [7, 5],
];

export const Playground: StoryObj<PlaygroundArgs> = {
  // `sides` is built in `render`, so its inherited control would be a lie.
  parameters: {
    controls: { include: ["status", "shape", "sets", "court", "time", "interactive"] },
  },
  args: {
    status: "live",
    shape: "singles",
    sets: 2,
    court: "Centre Court",
    time: "13:05",
    interactive: false,
  },
  argTypes: {
    status: { control: "inline-radio", options: ["upcoming", "live", "finished"] },
    shape: { control: "inline-radio", options: ["singles", "doubles"] },
    sets: {
      control: { type: "range", min: 0, max: 3, step: 1 },
      description: "Sets on the board. An upcoming match shows the time instead.",
    },
    court: { control: "text" },
    time: { control: "text" },
    interactive: { control: "boolean", description: "Passed through to `card`." },
  },
  render: ({ status, shape, sets, court, time, interactive }) => {
    const base = shape === "doubles" ? DOUBLES : SINGLES;
    const played = SET_SCORES.slice(0, sets);
    return frame({
      status,
      court,
      time,
      interactive,
      sides: [
        { ...base.a, scores: played.map(([a]) => a) },
        { ...base.b, scores: played.map(([, b]) => b) },
      ],
    });
  },
};
