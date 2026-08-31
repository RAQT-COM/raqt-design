/**
 * Shared rendering helpers for the foundations pages.
 *
 * Not a story file — the Storybook globs only pick up `*.mdx` and `*.stories.tsx`.
 *
 * Two rules govern everything here:
 *
 * 1. **No value is retyped.** Every hex, rem, px and ratio on a foundations page
 *    comes from `tokens/dist/tokens.ts`, so the pages cannot drift from the tokens.
 * 2. **Class names are never composed at runtime.** Tailwind only generates a
 *    utility whose class name appears literally in a source file, so a grid that
 *    builds `` `bg-${token}` `` renders unstyled. Anything derived from a loop
 *    paints through `style={{ ... "var(--color-x)" }}` instead; anything that
 *    needs a real utility (to prove the utility works) writes it out in full.
 */
import type { CSSProperties, ReactNode } from "react";

import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  CircleCheck,
  Clock,
  Download,
  EllipsisVertical,
  ExternalLink,
  House,
  Inbox,
  Info,
  LandPlot,
  ListOrdered,
  LoaderCircle,
  LogOut,
  MapPin,
  Medal,
  Menu,
  Network,
  Pencil,
  Plus,
  Radio,
  Search,
  Settings,
  Share2,
  SlidersHorizontal,
  Swords,
  Trash2,
  TriangleAlert,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react";
import { create } from "storybook/theming/create";

import {
  semanticColors,
  elevationShadows,
  radius,
  spacing,
  typography,
} from "@/tokens/dist/tokens";

/* ------------------------------------------------------------------ modes */

export type Mode = "dark" | "light";

export const MODES: readonly Mode[] = ["dark", "light"];

/**
 * A panel painted in one mode. Uses the real `.raqt` scope from `theme.css` —
 * the same mechanism a host app gets — so the two modes can sit side by side on
 * one page without either one owning `:root`.
 */
export function ModeFrame({
  mode,
  children,
  className = "",
  style,
}: {
  mode: Mode;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={
        (mode === "dark" ? "raqt" : "raqt light") +
        " sb-unstyled bg-background text-foreground rounded-lg border border-border p-4 " +
        className
      }
      style={style}
    >
      {children}
    </div>
  );
}

/** The two modes side by side, each labelled. `render` is called once per mode. */
export function TwoUp({ render }: { render: (mode: Mode) => ReactNode }) {
  return (
    <div className="sb-unstyled mt-3 mb-8 grid gap-4 sm:grid-cols-2">
      {MODES.map((mode) => (
        <div key={mode}>
          <ModeLabel mode={mode} />
          <ModeFrame mode={mode}>{render(mode)}</ModeFrame>
        </div>
      ))}
    </div>
  );
}

function ModeLabel({ mode }: { mode: Mode }) {
  return (
    <p className="mb-2 font-mono text-xs uppercase tracking-widest opacity-60">
      {mode === "dark" ? "dark — default" : "light — derived"}
    </p>
  );
}

/* ------------------------------------------------------------------ colour */

type SemanticToken = (typeof semanticColors)[number];

const BY_NAME = new Map<string, SemanticToken>(semanticColors.map((t) => [t.name, t]));

export function value(name: string, mode: Mode): string {
  const token = BY_NAME.get(name);
  if (!token) throw new Error(`Unknown semantic token: ${name}`);
  return token[mode];
}

/** WCAG 2.1 relative luminance. */
function luminance(hex: string): number {
  const n = parseInt(hex.replace("#", ""), 16);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const r = channel((n >> 16) & 255);
  const g = channel((n >> 8) & 255);
  const b = channel(n & 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x! + 0.05) / (y! + 0.05);
}

/** WCAG grade for normal-size body text, and for large/bold text. */
export function grade(ratio: number): { label: string; pass: boolean } {
  if (ratio >= 7) return { label: "AAA", pass: true };
  if (ratio >= 4.5) return { label: "AA", pass: true };
  if (ratio >= 3) return { label: "AA large", pass: true };
  return { label: "fail", pass: false };
}

/* ------------------------------------------------------------- swatch grid */

/**
 * The semantic layer, grouped by what each token is *for*. Any token in
 * `tokens.ts` that is missing here surfaces in an "Ungrouped" block rather than
 * disappearing — a drift alarm, so adding a token to the contract cannot
 * silently skip this page.
 */
export const COLOUR_GROUPS: { title: string; blurb: string; tokens: string[] }[] = [
  {
    title: "Ground and text",
    blurb: "The page itself, and the two levels of text on it.",
    tokens: [
      "--color-background",
      "--color-foreground",
      "--color-muted",
      "--color-muted-foreground",
    ],
  },
  {
    title: "Containers",
    blurb: "Things that sit on the ground and carry their own text colour.",
    tokens: [
      "--color-card",
      "--color-card-foreground",
      "--color-popover",
      "--color-popover-foreground",
    ],
  },
  {
    title: "Brand and actions",
    blurb:
      "Primary is the one action on a screen. Secondary and accent are the quieter two.",
    tokens: [
      "--color-primary",
      "--color-primary-foreground",
      "--color-secondary",
      "--color-secondary-foreground",
      "--color-accent",
      "--color-accent-foreground",
    ],
  },
  {
    title: "Meaning",
    blurb: "Carry a message. Never decoration.",
    tokens: [
      "--color-destructive",
      "--color-destructive-foreground",
      "--color-warning",
      "--color-warning-foreground",
      "--color-success",
      "--color-success-foreground",
      "--color-info",
      "--color-info-foreground",
    ],
  },
  {
    title: "Chrome",
    blurb: "Edges. Borders separate, input outlines a control, ring is focus.",
    tokens: ["--color-border", "--color-input", "--color-ring"],
  },
  {
    title: "Surfaces — Raqt-only",
    blurb:
      "Elevation as a colour in dark, as white-plus-shadow in light. See Radius & Elevation.",
    tokens: ["--color-surface-1", "--color-surface-2", "--color-surface-3"],
  },
  {
    title: "Match status — Raqt-only",
    blurb: "The four states a match can be in. Used by the match-card badge.",
    tokens: [
      "--color-status-upcoming",
      "--color-status-upcoming-foreground",
      "--color-status-live",
      "--color-status-live-foreground",
      "--color-status-finished",
      "--color-status-finished-foreground",
      "--color-status-open",
      "--color-status-open-foreground",
    ],
  },
];

const GROUPED = new Set(COLOUR_GROUPS.flatMap((g) => g.tokens));

export const UNGROUPED = semanticColors
  .map((t) => t.name)
  .filter((name) => !GROUPED.has(name));

/** One token: a chip painted from the live custom property, its name and its hex. */
export function Swatch({ name, mode }: { name: string; mode: Mode }) {
  const hex = value(name, mode);
  const short = name.replace("--color-", "");
  return (
    <div className="flex items-center gap-3">
      <div
        className="size-10 shrink-0 rounded-md border border-border"
        style={{ background: `var(${name})` }}
      />
      <div className="min-w-0">
        <p className="font-mono text-xs break-all">{short}</p>
        <p className="font-mono text-xs opacity-60">{hex}</p>
      </div>
    </div>
  );
}

export function SwatchGroup({ tokens, mode }: { tokens: string[]; mode: Mode }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {tokens.map((name) => (
        <Swatch key={name} name={name} mode={mode} />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- contrast */

export type Pair = { fg: string; bg: string; note?: string };

/**
 * Every `X` / `X-foreground` pair the contract defines, discovered rather than
 * listed — a new pair in `tokens.ts` shows up here on its own.
 */
const SIBLING_PAIRS: Pair[] = semanticColors
  .filter((t) => !t.name.endsWith("-foreground") && BY_NAME.has(`${t.name}-foreground`))
  .map((t) => ({ fg: `${t.name}-foreground`, bg: t.name }));

/** Pairs the naming convention cannot find, but that real screens depend on. */
const EXTRA_PAIRS: Pair[] = [
  { fg: "--color-foreground", bg: "--color-background", note: "body text" },
  { fg: "--color-muted-foreground", bg: "--color-background", note: "secondary text" },
  { fg: "--color-muted-foreground", bg: "--color-muted", note: "text on a muted block" },
  { fg: "--color-foreground", bg: "--color-surface-1", note: "text at elevation 1" },
  { fg: "--color-foreground", bg: "--color-surface-2", note: "text at elevation 2" },
  { fg: "--color-foreground", bg: "--color-surface-3", note: "text at elevation 3" },
  { fg: "--color-primary", bg: "--color-background", note: "brand as text" },
];

/** Extras first, so a hand-written note survives the dedupe against its sibling twin. */
export const CONTRAST_PAIRS: Pair[] = [...EXTRA_PAIRS, ...SIBLING_PAIRS].filter(
  (pair, i, all) => all.findIndex((p) => p.fg === pair.fg && p.bg === pair.bg) === i,
);

export function ContrastTable({ mode }: { mode: Mode }) {
  return (
    <table className="w-full border-collapse text-left font-mono text-xs">
      <thead>
        <tr className="border-b border-border">
          <th className="py-2 pr-3 font-normal opacity-60">sample</th>
          <th className="py-2 pr-3 font-normal opacity-60">foreground on background</th>
          <th className="py-2 pr-3 text-right font-normal opacity-60">ratio</th>
          <th className="py-2 text-right font-normal opacity-60">grade</th>
        </tr>
      </thead>
      <tbody>
        {CONTRAST_PAIRS.map((pair) => {
          const ratio = contrastRatio(value(pair.fg, mode), value(pair.bg, mode));
          const g = grade(ratio);
          return (
            <tr key={`${pair.fg}|${pair.bg}`} className="border-b border-border/50">
              <td className="py-1.5 pr-3">
                <span
                  className="inline-block rounded-sm px-2 py-1"
                  style={{ background: `var(${pair.bg})`, color: `var(${pair.fg})` }}
                >
                  Aa
                </span>
              </td>
              <td className="py-1.5 pr-3">
                <span>{pair.fg.replace("--color-", "")}</span>
                <span className="opacity-40"> on </span>
                <span>{pair.bg.replace("--color-", "")}</span>
                {pair.note ? <span className="opacity-40"> — {pair.note}</span> : null}
              </td>
              <td className="py-1.5 pr-3 text-right tabular-nums">{ratio.toFixed(2)}</td>
              <td className="py-1.5 text-right">
                <span
                  className="rounded-sm px-1.5 py-0.5"
                  style={
                    g.pass
                      ? { background: "var(--color-status-open)", color: "var(--color-status-open-foreground)" }
                      : { background: "var(--color-destructive)", color: "var(--color-destructive-foreground)" }
                  }
                >
                  {g.label}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* -------------------------------------------------------------- primitives */

export function Ramp({ name, steps }: { name: string; steps: Record<string, string> }) {
  return (
    <div className="mb-4">
      <p className="mb-1.5 font-mono text-xs opacity-60">{name}</p>
      <div className="flex flex-wrap gap-1">
        {Object.entries(steps).map(([step, hex]) => (
          <div key={step} className="w-16">
            <div
              className="h-12 rounded-sm border border-border"
              style={{ background: hex }}
            />
            <p className="mt-1 font-mono text-xs">{step}</p>
            <p className="font-mono text-xs opacity-50">{hex}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- elevation */

export function shadow(name: string, mode: Mode): string {
  const token = elevationShadows.find((s) => s.name === name);
  if (!token) throw new Error(`Unknown elevation token: ${name}`);
  return token[mode];
}

/* ------------------------------------------------------------------ prose */

/** A callout for the one thing on a page that is a rule rather than a value. */
export function Rule({ children }: { children: ReactNode }) {
  return (
    <div className="raqt sb-unstyled my-6 space-y-3 rounded-md border border-border bg-surface-2 p-4 text-foreground">
      {children}
    </div>
  );
}

/* ------------------------------------------------- literal-utility renderers
 *
 * Everything below writes Tailwind class names out in full. These are the
 * specimens whose job is to prove the *utility* works, not just the custom
 * property — so they cannot be composed from a loop variable (see rule 2 at the
 * top of this file). The maps are the seam: the loop picks a class out of a map
 * whose values are literal strings, so Tailwind still sees every class name.
 */

const TEXT_CLASS: Record<string, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
};

const RADIUS_CLASS: Record<string, string> = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
};

export const rem2px = (rem: string) => `${Math.round(parseFloat(rem) * 16)}px`;

/** One step of the type scale, rendered at size beside what it resolves to. */
export function TypeSpecimen({
  step,
  size,
  lineHeight,
  family,
  sample,
}: {
  step: string;
  size: string;
  lineHeight: string;
  family: "sans" | "display";
  sample: string;
}) {
  const cls = TEXT_CLASS[step];
  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs opacity-60">
        <span>--text-{step}</span>
        <span>
          {size} / {lineHeight}
        </span>
        <span>
          {rem2px(size)} / {rem2px(lineHeight)}
        </span>
        <span>{family === "display" ? "Archivo, font-display" : "Inter, font-sans"}</span>
      </div>
      <p className={family === "display" ? `${cls} font-display` : cls}>{sample}</p>
    </div>
  );
}

/** One radius step, shown on a real surface so the corner is visible. */
export function RadiusSpecimen({ step, rem }: { step: string; rem: string }) {
  return (
    <div className="text-center">
      <div
        className={`mx-auto size-24 border border-border bg-surface-3 ${RADIUS_CLASS[step]}`}
      />
      <p className="mt-2 font-mono text-xs">--radius-{step}</p>
      <p className="font-mono text-xs opacity-60">
        {rem} · {rem2px(rem)}
      </p>
    </div>
  );
}

/** One step of the spacing scale as a bar whose width *is* the value. */
export function SpacingBar({ step, rem, px }: { step: number; rem: string; px: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 shrink-0 text-right font-mono text-xs opacity-60">{step}</span>
      <div className="h-4 rounded-sm bg-primary" style={{ width: rem }} />
      <span className="font-mono text-xs opacity-60">
        {rem} · {px}px
      </span>
    </div>
  );
}

/**
 * Elevation 1 → 2 → 3, nested. Each level steps the surface **up** and the
 * radius **down**, which is the whole rule stated as a picture.
 */
export function ElevationStack() {
  return (
    <div className="rounded-lg border border-border bg-surface-1 p-4 shadow-e1">
      <p className="mb-3 font-mono text-xs opacity-60">surface-1 · rounded-lg · shadow-e1</p>
      <div className="rounded-md border border-border bg-surface-2 p-4 shadow-e2">
        <p className="mb-3 font-mono text-xs opacity-60">surface-2 · rounded-md · shadow-e2</p>
        <div className="rounded-sm border border-border bg-surface-3 p-4 shadow-e3">
          <p className="font-mono text-xs opacity-60">surface-3 · rounded-sm · shadow-e3</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- icons */

/**
 * The icon set.
 *
 * The set is not the library. `lucide-react` is the library — the one
 * `components.json` declares and the one `button` and `dialog` already ship
 * with. The rows below are the **vocabulary**: one glyph nominated per concept
 * Raqt actually names, so "add" is the same shape on every screen instead of
 * three plausible plus signs chosen by three different people.
 *
 * Nothing here retypes an import name. The label under each glyph is the
 * component's own `displayName`, which is exactly the string you import — a
 * row cannot document an icon it is not rendering.
 */
export type IconEntry = {
  /** What Raqt calls the thing. */
  concept: string;
  icon: LucideIcon;
  /** Where the component library already depends on this row, if it does. */
  used?: string;
  /**
   * A literal colour utility. Only the four meaning icons carry one — rule 5,
   * and the reason it is a field rather than a prop is that a tint is a fact
   * about the concept, not about the place it is drawn.
   */
  tone?: string;
};

export const ICON_GROUPS: { title: string; blurb: string; icons: IconEntry[] }[] = [
  {
    title: "The domain",
    blurb:
      "The things Raqt is about. These are the rows worth arguing over — the rest of the set is furniture every product has.",
    icons: [
      { concept: "tournament", icon: Trophy },
      { concept: "match", icon: Swords },
      { concept: "court", icon: LandPlot },
      { concept: "draw", icon: Network },
      { concept: "schedule", icon: CalendarDays },
      { concept: "time", icon: Clock },
      { concept: "live", icon: Radio },
      { concept: "ranking", icon: Medal },
      { concept: "results", icon: ListOrdered },
      { concept: "player", icon: User },
      { concept: "players", icon: Users },
      { concept: "club", icon: Building2 },
      { concept: "venue", icon: MapPin },
    ],
  },
  {
    title: "Navigation and chrome",
    blurb: "Getting around. One glyph per direction; a chevron is never a caret.",
    icons: [
      { concept: "home", icon: House },
      { concept: "search", icon: Search, used: "input" },
      { concept: "menu", icon: Menu },
      { concept: "back", icon: ChevronLeft },
      { concept: "forward", icon: ChevronRight },
      { concept: "expand", icon: ChevronDown },
      { concept: "collapse", icon: ChevronUp },
      { concept: "close", icon: X, used: "dialog" },
      { concept: "external", icon: ExternalLink },
      { concept: "more", icon: EllipsisVertical },
    ],
  },
  {
    title: "Actions",
    blurb:
      "What a person does. An icon here almost always sits inside a button, which means it inherits the button's colour and never picks its own.",
    icons: [
      { concept: "add", icon: Plus, used: "button" },
      { concept: "edit", icon: Pencil },
      { concept: "delete", icon: Trash2 },
      { concept: "confirm", icon: Check },
      { concept: "filter", icon: SlidersHorizontal },
      { concept: "share", icon: Share2 },
      { concept: "download", icon: Download },
      { concept: "settings", icon: Settings },
      { concept: "notifications", icon: Bell },
      { concept: "sign out", icon: LogOut },
    ],
  },
  {
    title: "State and feedback",
    blurb:
      "The only four icons in the set with a colour of their own, and they have one for the same reason the tokens do: they are saying something.",
    icons: [
      { concept: "success", icon: CircleCheck, tone: "text-success" },
      { concept: "warning", icon: TriangleAlert, tone: "text-warning" },
      { concept: "error", icon: CircleAlert, tone: "text-destructive" },
      { concept: "info", icon: Info, tone: "text-info" },
      { concept: "loading", icon: LoaderCircle, used: "button" },
      { concept: "empty", icon: Inbox, used: "empty-state" },
    ],
  },
];

/** Every concept the set names, for the "one concept, one glyph" count. */
export const ICON_COUNT = ICON_GROUPS.reduce((n, g) => n + g.icons.length, 0);

/**
 * One row of the set: the glyph at the default rung, the Raqt word, and the
 * lucide export read off the component itself.
 */
export function IconCell({ entry }: { entry: IconEntry }) {
  const Icon = entry.icon;
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface-3">
        <Icon className={entry.tone ? `size-4 ${entry.tone}` : "size-4"} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-sm">{entry.concept}</p>
        <p className="font-mono text-xs opacity-60">
          {Icon.displayName}
          {entry.used ? <span className="opacity-70"> · {entry.used}</span> : null}
        </p>
      </div>
    </div>
  );
}

export function IconGrid({ icons }: { icons: IconEntry[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {icons.map((entry) => (
        <IconCell key={entry.concept} entry={entry} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- icon sizing
 *
 * Three rungs, and they are steps of the spacing scale rather than a private
 * icon scale — `size-4` is the same 4 as `p-4`. The px column is read out of
 * `spacing.steps`, so it cannot disagree with the Spacing page.
 */
const SIZE_CLASS: Record<number, string> = {
  3: "size-3",
  4: "size-4",
  5: "size-5",
};

/** The type each rung is cut to match, as a literal utility. */
const SIZE_TEXT_CLASS: Record<number, string> = {
  3: "text-xs",
  4: "text-sm",
  5: "text-lg",
};

export const ICON_RUNGS: { step: 3 | 4 | 5; matches: string; where: string }[] = [
  { step: 3, matches: "cut to --text-xs", where: "inside a badge" },
  {
    step: 4,
    matches: "cut to --text-sm / --text-base",
    where: "button, input, dialog close — the default",
  },
  { step: 5, matches: "no type to match", where: "the empty-state medallion, standing alone" },
];

export function iconPx(step: number): number {
  const rung = spacing.steps.find((s) => s.step === step);
  if (!rung) throw new Error(`No spacing step ${step}`);
  return rung.px;
}

/** One rung, drawn beside the type it is cut to match. */
export function IconSizeSpecimen({
  step,
  matches,
  where,
}: {
  step: 3 | 4 | 5;
  matches: string;
  where: string;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-border py-3 last:border-b-0">
      <div className="flex w-40 shrink-0 items-center gap-2">
        <Trophy className={SIZE_CLASS[step]} aria-hidden="true" />
        <span className={SIZE_TEXT_CLASS[step]}>Tournament</span>
      </div>
      <div className="min-w-0 font-mono text-xs opacity-60">
        <p>
          {SIZE_CLASS[step]} · {iconPx(step)}px · {matches}
        </p>
        <p>{where}</p>
      </div>
    </div>
  );
}

/* --------------------------------------------------- fighting the chrome
 *
 * Storybook's docs container ships an opinionated stylesheet — it sets
 * font-size, font-family, margins and a zebra stripe on the elements MDX
 * compiles to, and it is unlayered, so it beats every Tailwind utility (which
 * live in `@layer utilities`) no matter how specific the class is. Inside a
 * specimen that is fatal: `text-4xl` renders at 14px and the light panel
 * inherits the dark panel's text colour.
 *
 * `sb-unstyled` is Storybook's own opt-out for exactly this, and it is what
 * `ModeFrame`, `TwoUp` and `Rule` carry. Inside it there is no docs CSS at all,
 * only Tailwind's preflight, so every utility behaves the way it does in a real
 * app — which is the point of a specimen.
 *
 * The one thing worth adding back is the inline-code chip, since prose inside a
 * `Rule` still wants it. Scoped to `.raqt` so it cannot leak onto the page.
 */
export function FoundationsStyles() {
  return (
    <style>{`
      .raqt code {
        /* emotion puts its colour on a class on the <code> itself, so
           sb-unstyled does not reach it — this does. */
        color: inherit;
        background: var(--color-surface-3);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        padding: 0.125em 0.375em;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.9em;
      }
    `}</style>
  );
}

/**
 * The docs chrome, painted from the tokens. Dark is the default mode, so a
 * white documentation page around a dark design system is itself a claim the
 * system does not make. Every value here reads out of `tokens.ts`.
 */
export const docsTheme = create({
  base: "dark",
  appBg: value("--color-background", "dark"),
  appContentBg: value("--color-background", "dark"),
  appPreviewBg: value("--color-background", "dark"),
  appBorderColor: value("--color-border", "dark"),
  appBorderRadius: Math.round(parseFloat(radius.md) * 16),
  colorPrimary: value("--color-primary", "dark"),
  colorSecondary: value("--color-primary", "dark"),
  textColor: value("--color-foreground", "dark"),
  textInverseColor: value("--color-primary-foreground", "dark"),
  textMutedColor: value("--color-muted-foreground", "dark"),
  barBg: value("--color-surface-1", "dark"),
  barTextColor: value("--color-muted-foreground", "dark"),
  barSelectedColor: value("--color-primary", "dark"),
  barHoverColor: value("--color-primary", "dark"),
  booleanBg: value("--color-surface-2", "dark"),
  booleanSelectedBg: value("--color-surface-3", "dark"),
  inputBg: value("--color-surface-2", "dark"),
  inputBorder: value("--color-input", "dark"),
  inputTextColor: value("--color-foreground", "dark"),
  inputBorderRadius: Math.round(parseFloat(radius.sm) * 16),
  fontBase: typography.fonts.sans,
  fontCode: "ui-monospace, SFMono-Regular, Menlo, monospace",
});

/*
 * Not wired up here, and it cannot be: these pages are unattached MDX, and the
 * docs container only reads `parameters.docs.theme` from a CSF meta or from the
 * project. Setting it is therefore a project-wide decision living in
 * `.storybook/preview.ts` — a file W0 owns — so W2 leaves it as a hand-off:
 *
 *   import { docsTheme } from "../stories/foundations/lib";
 *   parameters: { docs: { theme: docsTheme } }
 *
 * Everything on these pages is self-carrying without it. The docs chrome stays
 * Storybook's own light default until someone who owns that file says otherwise.
 */
