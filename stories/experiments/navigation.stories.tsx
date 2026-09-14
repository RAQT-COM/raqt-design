import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { BAND, Backdrop } from "./backdrop";
import { NAVIGATE_MS, SNAP } from "./motion";
import { StartFeed } from "./start-feed";
import { TournamentSearch } from "./tournament-search";

type Screen = "feed" | "search";

function Navigation() {
  const [screen, setScreen] = useState<Screen>("feed");
  const [entering, setEntering] = useState<"right" | "left">("right");

  const go = (next: Screen) => {
    setEntering(next === "search" ? "right" : "left");
    setScreen(next);
  };

  return (
    <div className="relative h-[874px] w-[402px] overflow-hidden">
      <style>{`
        @keyframes enter-right{from{transform:translateX(11%);opacity:.35}to{transform:none;opacity:1}}
        @keyframes enter-left{from{transform:translateX(-11%);opacity:.35}to{transform:none;opacity:1}}
      `}</style>

      {/* One band for the whole app. The screens travel across it; it drifts. */}
      <Backdrop pose={BAND[screen]} />

      <div
        key={screen}
        className="absolute inset-0"
        style={{ animation: `enter-${entering} ${NAVIGATE_MS}ms ${SNAP} both` }}
      >
        {screen === "feed" ? (
          <StartFeed backdrop={false} onOpenSearch={() => go("search")} />
        ) : (
          <TournamentSearch backdrop={false} onBack={() => go("feed")} />
        )}
      </div>
    </div>
  );
}

/**
 * The backdrop belongs to the app, not to a screen.
 *
 * **Tap the magnifier in the tab bar** to open tournament search, then the back
 * button to return — the two affordances the screens already have, rather than
 * invented navigation. Watch the background while you do it.
 *
 * The screen snaps across in 200ms. The band takes 620ms to travel and rotate
 * from −33° to −13°, so it arrives after the content has settled. That lag is
 * the whole point: it makes the band read as further away, and turns navigation
 * into a camera move over one continuous background rather than a screen swap.
 *
 * Each screen keeps its own tab bar, so the bar transitions with the content —
 * the two bars still disagree (five items with PLAY on the feed, four without
 * it on search), which is open contradiction 2 in `DESIGN-ALT.md`.
 */
const meta = {
  title: "Experiments/Navigation",
  component: Navigation,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Navigation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
