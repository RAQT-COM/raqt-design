// §3 — the backdrop.
//
// One blurred green band lives behind the whole app. Each screen parks it at
// its own position and angle; navigating moves and rotates it rather than
// replacing it, so the background reads as continuous and the screens travel
// across it.
//
// It never sits behind text — cards are opaque, so it only shows through the
// gutters and margins.

import { NAVIGATE_MS, SNAP } from "./motion";

export type BandPose = { x: number; y: number; angle: number };

const BAND_W = 900;
const BAND_H = 300;

// The band flattens and rises as the navigation goes deeper. A footer
// destination gets the full angle; a screen pushed on top of it is calmer; a
// detail inside that is calmer still. Going back steepens it again.
//
// Keying it to depth rather than to screen names is what makes it scale: twenty
// screens still need only these three poses, and a new screen picks one by
// answering "how deep am I?" instead of inventing an angle.
const BAND_BY_DEPTH: BandPose[] = [
  // 0 — a footer destination. Matches the original frame: rises to the right at
  // ~33°, crossing the screen centre around y=410. **(measured)**
  { x: -249, y: 260, angle: -33 },
  // 1 — pushed on top of one. Sits behind the title rather than the list.
  { x: -270, y: 120, angle: -13 },
  // 2 — a detail within that. Nearly level, well clear of the content.
  { x: -280, y: 45, angle: -5 },
];

export function bandFor(depth: number): BandPose {
  const i = Math.min(Math.max(depth, 0), BAND_BY_DEPTH.length - 1);
  return BAND_BY_DEPTH[i];
}

// §7 — the band travels on the same clock and the same curve as the screen it
// sits behind. A background still moving after the content has landed reads as
// lag, not as depth.
export const BAND_SHIFT = `transform ${NAVIGATE_MS}ms ${SNAP}`;

export function Backdrop({ pose, animate = true }: { pose: BandPose; animate?: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[var(--bg)]" aria-hidden>
      <div
        className="absolute top-0 left-0 rounded-full"
        style={{
          width: BAND_W,
          height: BAND_H,
          background: "var(--band)",
          filter: "blur(70px)",
          transform: `translate3d(${pose.x}px, ${pose.y}px, 0) rotate(${pose.angle}deg)`,
          transition: animate ? BAND_SHIFT : undefined,
        }}
      />
      {/* grey key light, top-left */}
      <div
        className="absolute inset-0"
        style={{
          background: "var(--key)",
        }}
      />
      {/* the band never reaches the tab bar */}
      <div
        className="absolute inset-0"
        style={{
          background: "var(--fade)",
        }}
      />
    </div>
  );
}
