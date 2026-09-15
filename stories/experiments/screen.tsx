import type { CSSProperties, ReactNode } from "react";

import { Backdrop, bandFor } from "./backdrop";
import { THEME, type Mode } from "./theme";
import { TabBar } from "./tab-bar";

function StatusBar() {
  return (
    <div className="flex h-[54px] shrink-0 items-center justify-between px-5">
      <span className="text-[15px] font-semibold tracking-[-0.02em]">9:41</span>
      <div className="flex items-center gap-[7px]">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="var(--ink)" aria-hidden>
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none" aria-hidden>
          <path
            d="M1 4.2a11 11 0 0 1 15 0M3.7 7a7.2 7.2 0 0 1 9.6 0"
            stroke="var(--ink)"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
          <circle cx="8.5" cy="10.3" r="1.5" fill="var(--ink)" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden>
          <rect x="0.5" y="0.5" width="21" height="11" rx="3.2" stroke="var(--ink)" strokeOpacity="0.45" />
          <rect x="2" y="2" width="18" height="8" rx="2" fill="var(--ink)" />
          <path d="M23 4.3v3.4a1.9 1.9 0 0 0 0-3.4Z" fill="var(--ink)" fillOpacity="0.6" />
        </svg>
      </div>
    </div>
  );
}

/**
 * Every screen is a `Screen`. It owns the chrome that must not vary — the
 * backdrop, the status bar and the footer — so a new screen gets all three
 * right by existing, rather than by remembering to.
 *
 * `depth` is how far into the navigation this screen sits: 0 for a footer
 * destination, 1 for something pushed on top of one, 2 for a detail inside
 * that. It picks the backdrop pose; see §3 and §8.
 *
 * Pass `backdrop={false}` only when something outside is already drawing the
 * backdrop and wants it to persist across a transition.
 */
export function Screen({
  depth,
  mode = "dark",
  backdrop = true,
  onSearch,
  children,
}: {
  depth: number;
  mode?: Mode;
  backdrop?: boolean;
  onSearch?: () => void;
  children: ReactNode;
}) {
  const pose = bandFor(depth);

  return (
    <div
      className="relative h-[874px] w-[402px] overflow-hidden text-[var(--ink)] antialiased"
      style={{
        ...THEME[mode],
        // a gradient perpendicular to the band reads as parallel to it
        "--sheen-angle": `${180 + pose.angle}deg`,
        fontFamily: "Inter, system-ui, sans-serif",
      } as CSSProperties}
    >
      {backdrop && <Backdrop pose={pose} />}
      <div className="relative z-10 flex h-full flex-col">
        <StatusBar />
        {children}
        <TabBar onSearch={onSearch} />
      </div>
    </div>
  );
}
