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

export const BAND: Record<"feed" | "search", BandPose> = {
  // Matches the original frame: the band rises to the right at ~33°, crossing
  // the screen centre around y=410. **(measured)**
  feed: { x: -249, y: 260, angle: -33 },
  // Flatter and higher, so it sits behind the title rather than the list.
  search: { x: -270, y: 120, angle: -13 },
};

// §7 — the band travels on the same clock and the same curve as the screen it
// sits behind. A background still moving after the content has landed reads as
// lag, not as depth.
export const BAND_SHIFT = `transform ${NAVIGATE_MS}ms ${SNAP}`;

export function Backdrop({ pose, animate = true }: { pose: BandPose; animate?: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black" aria-hidden>
      <div
        className="absolute top-0 left-0 rounded-full"
        style={{
          width: BAND_W,
          height: BAND_H,
          background: "#17601e",
          filter: "blur(70px)",
          transform: `translate3d(${pose.x}px, ${pose.y}px, 0) rotate(${pose.angle}deg)`,
          transition: animate ? BAND_SHIFT : undefined,
        }}
      />
      {/* grey key light, top-left */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(78% 30% at 10% 9%, #2f2f2f 0%, rgba(0,0,0,0) 76%)",
        }}
      />
      {/* the band never reaches the tab bar */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0) 48%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.9) 86%, #000000 100%)",
        }}
      />
    </div>
  );
}
