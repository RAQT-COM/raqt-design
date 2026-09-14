import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Backdrop, bandFor } from "./backdrop";
import { NAVIGATE_MS, SNAP } from "./motion";
import { StartFeed } from "./start-feed";
import { THEME, type Mode } from "./theme";
import { TournamentSearch } from "./tournament-search";

type ScreenName = "feed" | "search";

function Navigation() {
  const [screen, setScreen] = useState<ScreenName>("feed");
  const [entering, setEntering] = useState<"right" | "left">("right");
  const [mode, setMode] = useState<Mode>("dark");

  const go = (next: ScreenName) => {
    setEntering(next === "search" ? "right" : "left");
    setScreen(next);
  };

  return (
    <div className="flex items-start gap-[20px]">
      <div
        className="relative h-[874px] w-[402px] overflow-hidden"
        style={THEME[mode]}
      >
        <style>{`
          @keyframes enter-right{from{transform:translateX(11%);opacity:.35}to{transform:none;opacity:1}}
          @keyframes enter-left{from{transform:translateX(-11%);opacity:.35}to{transform:none;opacity:1}}
        `}</style>

        {/* One band for the whole app. The screens travel across it; it moves. */}
        <Backdrop pose={bandFor(screen === "feed" ? 0 : 1)} />

        <div
          key={screen}
          className="absolute inset-0"
          style={{ animation: `enter-${entering} ${NAVIGATE_MS}ms ${SNAP} both` }}
        >
          {screen === "feed" ? (
            <StartFeed mode={mode} backdrop={false} onOpenSearch={() => go("search")} />
          ) : (
            <TournamentSearch mode={mode} backdrop={false} onBack={() => go("feed")} />
          )}
        </div>
      </div>

      {/* A harness control, deliberately outside the phone and deliberately not
          styled in the design language — it is not part of the product. */}
      <div className="flex w-[104px] flex-col gap-[6px] rounded-[10px] border border-neutral-300 bg-neutral-100 p-[6px]">
        <span className="px-[4px] pt-[2px] text-[10px] font-semibold tracking-[0.08em] text-neutral-500 uppercase">
          Ground
        </span>
        {(["dark", "light"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-[7px] px-[10px] py-[7px] text-[12px] font-semibold capitalize ${
              mode === m ? "bg-neutral-900 text-white" : "bg-white text-neutral-600"
            }`}
          >
            {m}
          </button>
        ))}
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
 * Screen and band move together — 200ms on the same curve — while the band also
 * rotates from −33° to −13°. The rotation is what makes it read as one
 * continuous background being travelled across rather than a screen swap; it
 * does not need to lag to do that.
 *
 * The **Ground** switch flips both screens between the two themes. It sits
 * outside the phone because it is a harness control, not a product surface.
 */
const meta = {
  title: "Experiments/Navigation",
  component: Navigation,
  parameters: { layout: "centered", options: { showPanel: false } },
} satisfies Meta<typeof Navigation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
