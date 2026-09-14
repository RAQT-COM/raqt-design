import type { CSSProperties } from "react";

export type Mode = "dark" | "light";

/**
 * The two grounds.
 *
 * What does *not* appear here is as important as what does. The brand green,
 * the PLAY gradient, the points sparkle and the partner navy are identical in
 * both modes — §3 says there is one green and that a different surface means
 * someone else's content, and neither of those claims survives if the values
 * move when the lights come on.
 *
 * Light is a warm off-white, not white. Pure #fff with grey cards is the single
 * most generic light UI there is.
 */
const DARK: Record<string, string> = {
  "--bg": "#000000",
  "--band": "#17601e",
  "--key": "radial-gradient(78% 30% at 10% 9%, #2f2f2f 0%, rgba(0,0,0,0) 76%)",
  "--fade":
    "linear-gradient(to bottom, rgba(0,0,0,0) 48%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.9) 86%, #000000 100%)",
  "--surface": "#282828",
  "--recessed": "#1c1c1c",
  "--raised": "#333333",
  "--track": "#464646",
  "--ink": "#ffffff",
  "--ink-dim": "#8a8a8a",
  "--ink-faint": "#5f5f5f",
  // The brand green is unreadable as text on light, so foreground green gets its
  // own value. Fills keep #3fe176 in both modes.
  "--green-ink": "#3fe176",
  "--chrome": "#000000",
  "--hairline": "rgba(255,255,255,0.10)",
  // the wordmark ships as a near-white PNG; light needs it flipped
  "--logo-filter": "none",
};

const LIGHT: Record<string, string> = {
  "--bg": "#f2f1ea",
  "--band": "#7ce3a1",
  "--key": "radial-gradient(78% 30% at 10% 9%, #ffffff 0%, rgba(255,255,255,0) 76%)",
  "--fade":
    "linear-gradient(to bottom, rgba(242,241,234,0) 48%, rgba(242,241,234,0.55) 70%, rgba(242,241,234,0.92) 86%, #f2f1ea 100%)",
  "--surface": "#ffffff",
  "--recessed": "#e8e6dc",
  "--raised": "#ffffff",
  "--track": "#dbd8cd",
  "--ink": "#14150f",
  "--ink-dim": "#6d6c62",
  "--ink-faint": "#a5a399",
  "--green-ink": "#0b7a33",
  "--chrome": "#ffffff",
  "--hairline": "rgba(20,21,15,0.09)",
  "--logo-filter": "invert(1)",
};

/**
 * §11 — one focus treatment, everywhere. Green because focus is actionable, and
 * offset so it stays visible on the PLAY button, which is already green.
 *
 * Never remove it without replacing it: an element whose outline is suppressed
 * with nothing in its place is unusable by keyboard, which is a defect and not
 * a visual preference.
 */
export const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--green-ink)]";

export const THEME: Record<Mode, CSSProperties> = {
  dark: DARK as CSSProperties,
  light: LIGHT as CSSProperties,
};
