// §7 — one curve, everywhere. Taken from the ball: hard plastic, pops, stops
// dead. Fast out, abrupt settle, almost no bounce-back.
export const SNAP = "cubic-bezier(0.2, 0.9, 0.3, 1)";

export const TAP_MS = 100;
export const NAVIGATE_MS = 200;

// The one exception: the backdrop is further away than the UI, so it lags.
export const BACKDROP_MS = 620;
export const BACKDROP_EASE = "cubic-bezier(0.33, 0, 0.16, 1)";
