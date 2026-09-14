import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { BLOB, Backdrop } from "./backdrop";
import { StartFeed } from "./start-feed";
import { TournamentSearch } from "./tournament-search";

type Screen = "feed" | "search";

function BackdropShift() {
  const [screen, setScreen] = useState<Screen>("feed");

  return (
    <div className="flex flex-col items-center gap-[18px]">
      <div className="relative h-[874px] w-[402px] overflow-hidden">
        {/* One blob for the whole app. The screens change over it; it moves. */}
        <Backdrop pose={BLOB[screen]} />
        {screen === "feed" ? (
          <StartFeed backdrop={false} />
        ) : (
          <TournamentSearch backdrop={false} />
        )}
      </div>

      <div className="flex items-center gap-[8px] rounded-full bg-[#1c1c1c] p-[4px]">
        {(["feed", "search"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setScreen(s)}
            className={`rounded-full px-[16px] py-[8px] text-[12px] font-bold tracking-[0.04em] uppercase ${
              screen === s ? "bg-[#333333] text-white" : "text-[#8a8a8a]"
            }`}
          >
            {s === "feed" ? "Start feed" : "Tournaments"}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * The backdrop is one blurred green blob that belongs to the app, not to a
 * screen. Navigating re-parks it rather than replacing it.
 *
 * Switch between the two screens and watch the background: the content swaps at
 * ~200ms while the blob drifts over ~620ms. That difference is deliberate — the
 * blob is further away, so it lags. It is the one documented exception to the
 * single-curve rule in §7.
 */
const meta = {
  title: "Experiments/Backdrop Shift",
  component: BackdropShift,
  parameters: { layout: "centered" },
} satisfies Meta<typeof BackdropShift>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
