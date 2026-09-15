import type { Meta, StoryObj } from "@storybook/react-vite";
import { GlowApp, type Screen as GlowScreen, type Theme as GlowTheme } from "./glow/glow";

type Screen = {
  name: string;
  group: string;
  note: string;
  /** A standalone mockup under `screens/`, mounted in its own document. */
  file?: string;
  /** A live Glow screen, rendered in place — its CSS is scoped to `.raqt-glow`. */
  glow?: { screen: GlowScreen; theme: GlowTheme };
};

/**
 * Every screen drawn for RAQT so far. Each is a standalone document under
 * `stories/experiments/screens/`, served verbatim and mounted in its own frame,
 * so a mockup's fonts and colours cannot leak into the page or into each other.
 */
const SCREENS: Screen[] = [
  {
    file: "StartFeedDark",
    name: "Start feed",
    group: "Current — dark",
    note: "The language in Storybook today: diagonal band, translucent surfaces, green sheen, Archivo over Inter.",
  },
  {
    file: "SearchDark",
    name: "Tournaments",
    group: "Current — dark",
    note: "Framed cards — photo inset so the card's surface frames it on all four sides.",
  },
  {
    file: "SearchOverlay",
    name: "Tournaments, overlay cards",
    group: "Current — dark",
    note: "The photo is the card. Groups more cleanly in a list, but the scrim eats half of every photo.",
  },
  {
    file: "SearchGrid",
    name: "Tournaments, featured + grid",
    group: "Current — dark",
    note: "A full-width featured carousel on top, then half-width cards in a grid — squarer, and four visible instead of two.",
  },
  {
    file: "StartFeedLight",
    name: "Start feed",
    group: "Current — light",
    note: "Warm off-white, not white. Green, PLAY, sparkle and partner navy hold their values across both grounds.",
  },
  {
    file: "SearchLight",
    name: "Tournaments",
    group: "Current — light",
    note: "Same screen on the light ground.",
  },
  {
    file: "Signal",
    name: "Start feed",
    group: "Signal",
    note: "Your existing layout as signage: hard 2px rules, square corners, Outfit, one green and one amber.",
  },
  {
    file: "Main",
    name: "Class standings",
    group: "Signal",
    note: "Standings and schedule. The qualification cut is a heavy rule, not a colour.",
  },
  {
    glow: { screen: "feed", theme: "dark" },
    name: "Start feed",
    group: "Glow — dark",
    note: "ATP Live hero, badge and clinic tiles, a nearby club, one post.",
  },
  {
    glow: { screen: "discover", theme: "dark" },
    name: "Tournaments",
    group: "Glow — dark",
    note: "One-tap date and format filters; search hides behind a disclosure.",
  },
  {
    glow: { screen: "play", theme: "dark" },
    name: "Play",
    group: "Glow — dark",
    note: "Next match first, then open games. Draw and scores sit behind the same switch.",
  },
  {
    glow: { screen: "messages", theme: "dark" },
    name: "Messages",
    group: "Glow — dark",
    note: "Conversation list opening into a thread with a composer.",
  },
  {
    glow: { screen: "profile", theme: "dark" },
    name: "Profile",
    group: "Glow — dark",
    note: "Rating, counts, achievement progress, activity shortcuts.",
  },
  {
    glow: { screen: "badges", theme: "dark" },
    name: "Achievements",
    group: "Glow — dark",
    note: "Twelve badges, the locked ones kept visible.",
  },
  {
    glow: { screen: "clinics", theme: "dark" },
    name: "Clinics",
    group: "Glow — dark",
    note: "A live coaching session with a waiting room.",
  },
  {
    glow: { screen: "live", theme: "dark" },
    name: "ATP Live",
    group: "Glow — dark",
    note: "Broadcast placeholder with a notify-me reminder.",
  },
  {
    glow: { screen: "feed", theme: "light" },
    name: "Start feed",
    group: "Glow — daylight",
    note: "Same screen on the daylight ground.",
  },
  {
    glow: { screen: "discover", theme: "light" },
    name: "Tournaments",
    group: "Glow — daylight",
    note: "Same screen on the daylight ground.",
  },
  {
    glow: { screen: "play", theme: "light" },
    name: "Play",
    group: "Glow — daylight",
    note: "Same screen on the daylight ground.",
  },
  {
    glow: { screen: "messages", theme: "light" },
    name: "Messages",
    group: "Glow — daylight",
    note: "Same screen on the daylight ground.",
  },
  {
    glow: { screen: "profile", theme: "light" },
    name: "Profile",
    group: "Glow — daylight",
    note: "Same screen on the daylight ground.",
  },
  {
    glow: { screen: "badges", theme: "light" },
    name: "Achievements",
    group: "Glow — daylight",
    note: "Same screen on the daylight ground.",
  },
  {
    glow: { screen: "clinics", theme: "light" },
    name: "Clinics",
    group: "Glow — daylight",
    note: "Same screen on the daylight ground.",
  },
  {
    glow: { screen: "live", theme: "light" },
    name: "ATP Live",
    group: "Glow — daylight",
    note: "Same screen on the daylight ground.",
  },
];

const SCALE = 0.62;
const W = 402;
const H = 874;

function Frame({ screen }: { screen: Screen }) {
  return (
    <figure style={{ margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          width: W * SCALE,
          height: H * SCALE,
          overflow: "hidden",
          borderRadius: 14,
          border: "1px solid rgba(20,21,15,0.14)",
          background: "#fff",
          flex: "none",
        }}
      >
        <div
          style={{
            width: W,
            height: H,
            transform: `scale(${SCALE})`,
            transformOrigin: "top left",
          }}
        >
          {screen.glow ? (
            <GlowApp theme={screen.glow.theme} initialScreen={screen.glow.screen} />
          ) : (
            <iframe
              src={`/screens/${screen.file}.html`}
              title={`${screen.group} — ${screen.name}`}
              loading="lazy"
              style={{ width: W, height: H, border: 0, display: "block" }}
            />
          )}
        </div>
      </div>
      <figcaption style={{ width: W * SCALE, display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>{screen.name}</span>
        <span style={{ fontSize: 12, lineHeight: 1.45, color: "#6d6d66" }}>{screen.note}</span>
      </figcaption>
    </figure>
  );
}

function Gallery() {
  const groups = SCREENS.reduce<Record<string, Screen[]>>((acc, s) => {
    (acc[s.group] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div
      style={{
        padding: "36px 32px 64px",
        background: "#faf9f5",
        color: "#14150f",
        minHeight: "100vh",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>
        RAQT screens
      </h1>
      <p style={{ margin: "8px 0 0", maxWidth: 620, fontSize: 14, lineHeight: 1.55, color: "#55544c" }}>
        Every direction drawn so far, at one scale. The Current screens are ports of the live
        components, Glow renders from its own components, and the rest exist only as drawings.
      </p>

      {Object.entries(groups).map(([group, items]) => (
        <section key={group} style={{ marginTop: 40 }}>
          <h2
            style={{
              margin: "0 0 18px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#6d6d66",
            }}
          >
            {group}
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 28 }}>
            {items.map((s) => (
              <Frame key={s.file ?? `${s.glow?.theme}-${s.glow?.screen}`} screen={s} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

const meta = {
  title: "Experiments/All Screens",
  component: Gallery,
  parameters: { layout: "fullscreen", options: { showPanel: false } },
} satisfies Meta<typeof Gallery>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
