// §3 — the backdrop.
//
// One blurred green blob lives behind the whole app. Each screen parks it
// somewhere different; moving between screens moves the blob rather than
// replacing it, so the background reads as continuous and the screens slide
// over it.
//
// It never sits behind text — cards are opaque, so it only shows through the
// gutters and margins.

export type BlobPose = { x: number; y: number };

const BLOB_W = 560;
const BLOB_H = 440;

export const BLOB: Record<"feed" | "search", BlobPose> = {
  feed: { x: -80, y: 200 },
  search: { x: -215, y: 95 },
};

// §7 exception: the blob is further away than the UI, so it moves slower than
// the screens do. Snap the content, drift the background — that difference is
// what reads as depth.
export const BLOB_SHIFT = "transform 620ms cubic-bezier(0.33, 0, 0.16, 1)";

export function Backdrop({ pose, animate = true }: { pose: BlobPose; animate?: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black" aria-hidden>
      <div
        className="absolute top-0 left-0 rounded-full"
        style={{
          width: BLOB_W,
          height: BLOB_H,
          background: "#17651f",
          filter: "blur(85px)",
          transform: `translate3d(${pose.x}px, ${pose.y}px, 0)`,
          transition: animate ? BLOB_SHIFT : undefined,
        }}
      />
      {/* grey key light, top-left */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(78% 30% at 10% 9%, #2f2f2f 0%, rgba(0,0,0,0) 76%)",
        }}
      />
      {/* the blob never reaches the tab bar */}
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
