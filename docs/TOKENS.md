# Token contract

Authoritative values for the Raqt design system. W1 emits these; every other
lane consumes them by name. Changing a value here means changing it in one
place; changing a *name* means renegotiating with every lane.

Two **product themes** share boxing (type, radius, space) and the ink/paper
ground. They differ by brand accent, harvested from the approved Claude Design
canvases — not invented here.

| theme | class | accent | source |
|---|---|---|---|
| **Player — Claude Design** (default) | `.raqt` / `.raqt.theme-player` | Sage `#4A7C6A` | `raqt-mobile-design` — *RAQT Palettes* (Sage marked current), *RAQT Player Profile* |
| **Referee** | `.raqt.theme-referee` | Gold `#A9752C` | `raqt-referee-design` — *RAQT Referee* |

Storybook also ships **Player — Original/Nelson** (`.raqt.theme-turf`) — the
pre-canvas neon-green Player (`#2BE07C`, Inter + Archivo, dark-default ink).
It is a comparison skin, not a product theme. Toolbar: Theme →
**Player — Original/Nelson**, Mode → **Dark**.

Light is what those canvases actually are (paper `#EFECE4`). Dark is derived so
the existing `.raqt` / `.raqt.light` switch still works. `--color-primary` holds
the same value in both modes.

Add `light` alongside the scope for paper: `className="raqt light"` or
`className="raqt theme-referee light"`.

## Layer 1 — primitives

Raw values. Components never reference these. Shared ramps live in
`tokens/source/primitives.json`. Each theme overlays `color.brand` from
`tokens/source/themes/{player,referee}.json`. Original/Nelson overlays a full
palette in `tokens/source/themes/turf.json`.

### `ink` — paper, linen, charcoal (shared)

Harvested from both canvases. Lower number = lighter.

| step | hex | |
|---|---|---|
| 25 | `#FAF9F5` | empty / dashed fills |
| **50** | **`#EFECE4`** | **paper — light background, the phone** |
| 75 | `#F4F2EC` | muted control fill |
| 100 | `#E5E1D7` | segmented-control track |
| **200** | **`#D9D5CB`** | **linen — page around the phone** |
| 300 | `#B8B3A7` | |
| 400 | `#8C887E` | |
| 500 | `#6E6B64` | muted text on paper |
| 600 | `#4A4F4B` | dark input border |
| **700** | **`#2E3330`** | **charcoal — headers, light foreground** |
| 750 | `#242824` | dark elevation 2 |
| 800 | `#1A1E1B` | dark elevation 1 |
| 900 | `#12140F` | dark background / status-bar ink |
| 950 | `#0C0E0B` | |

### `brand` — per theme

**Player — Claude Design (Sage)**

| step | hex | |
|---|---|---|
| 50 | `#EEF2EE` | mint chips |
| 100 | `#E7EFE9` | selected mint |
| 200 | `#B8D2C4` | |
| **300** | **`#8FB59A`** | **Player label on charcoal** |
| **400** | **`#4A7C6A`** | **primary — never changes between modes** |
| 500 | `#3D6658` | |
| 600 | `#2F5247` | |
| 700 | `#123321` | court green |
| 800 | `#0F281C` | |
| 900 | `#0A1C14` | |
| 950 | `#06110C` | |

**Referee — gold**

| step | hex | |
|---|---|---|
| 50 | `#F3E9D8` | cream callouts |
| 100 | `#EDD9B8` | |
| 200 | `#E8CC9A` | |
| **300** | **`#E0BD83`** | **Referee label on charcoal** |
| **400** | **`#A9752C`** | **primary — never changes between modes** |
| 500 | `#8B5E22` | |
| 600 | `#82591D` | link hover |
| 700 | `#5C4016` | |
| 800 | `#3A280E` | |
| 900 | `#241808` | |
| 950 | `#140E06` | |

### Status ramps (shared)

| ramp | 100 | 400 | 500 | 600 | 900 |
|---|---|---|---|---|---|
| `red` | `#F8D4D0` | `#FF4D3D` | **`#C4432F` live** | `#A33828` | `#3A1410` |
| `amber` | `#FFF0D6` | **`#FFC233` sun** | `#E0BD83` | `#D97F00` | `#3A2600` |
| `blue` | `#D9F1FD` | `#4FC3F7` | `#22A8E8` | `#1580B4` | `#06263A` |

`white` is `#FFFFFF`. Success reuses `brand`.

## Layer 2 — semantic

The only layer components touch. Names match shadcn's, so `shadcn add` output
works unmodified. Mapping is identical for both themes; only `{color.brand.*}`
resolves differently.

| token | dark | light (canvas) |
|---|---|---|
| `--color-background` | `ink.900` | `ink.50` |
| `--color-foreground` | `ink.50` | `ink.700` |
| `--color-card` | `ink.700` | `white` |
| `--color-card-foreground` | `ink.50` | `ink.700` |
| `--color-popover` | `ink.700` | `white` |
| `--color-popover-foreground` | `ink.50` | `ink.700` |
| `--color-primary` | `brand.400` | `brand.400` |
| `--color-primary-foreground` | `white` | `white` |
| `--color-secondary` | `ink.750` | `ink.75` |
| `--color-secondary-foreground` | `ink.50` | `ink.700` |
| `--color-muted` | `ink.750` | `ink.100` |
| `--color-muted-foreground` | `ink.300` | `ink.500` |
| `--color-accent` | `ink.700` | `brand.50` |
| `--color-accent-foreground` | `ink.50` | `brand.400` |
| `--color-destructive` | `red.500` | `red.600` |
| `--color-destructive-foreground` | `white` | `white` |
| `--color-warning` | `amber.400` | `amber.400` |
| `--color-warning-foreground` | `ink.900` | `ink.900` |
| `--color-success` | `brand.400` | `brand.400` |
| `--color-success-foreground` | `white` | `white` |
| `--color-info` | `blue.400` | `blue.600` |
| `--color-info-foreground` | `blue.900` | `white` |
| `--color-border` | `ink.600` | `ink.100` |
| `--color-input` | `ink.600` | `ink.300` |
| `--color-ring` | `brand.400` | `brand.400` |

### Surfaces — Raqt-only

Elevation on a dark ground cannot be carried by shadow. In dark mode elevation
is **surface lightness plus a hairline border**; in light mode the same names
resolve to **shadows on white**. One vocabulary, two implementations.

| token | dark | light |
|---|---|---|
| `--color-surface-1` | `ink.800` | `white` |
| `--color-surface-2` | `ink.750` | `white` |
| `--color-surface-3` | `ink.700` | `white` |
| `--shadow-e1` | `none` | `0 1px 6px rgb(46 51 48 / 0.05)` |
| `--shadow-e2` | `none` | `0 2px 10px rgb(46 51 48 / 0.06)` |
| `--shadow-e3` | `none` | `0 8px 24px rgb(46 51 48 / 0.12)` |

Usage: elevation *n* is `bg-surface-n` + `border border-border` + `shadow-en`.
Nested surfaces step **up** one level and **down** one radius step.

### Match status — Raqt-only

| token | dark bg / fg | light bg / fg |
|---|---|---|
| `--color-status-upcoming-*` | `ink.750` / `ink.300` | `ink.100` / `ink.500` |
| `--color-status-live-*` | `red.500` / `white` | `red.500` / `white` |
| `--color-status-finished-*` | `ink.700` / `ink.300` | `ink.200` / `ink.500` |
| `--color-status-open-*` | `brand.800` / `brand.300` | `brand.100` / `brand.700` |

## Typography

Shared. Harvested from both product canvases (Figtree body, Space Grotesk
wordmark / scores).

```
--font-sans:    "Figtree", ui-sans-serif, system-ui, sans-serif
--font-display: "Space Grotesk", ui-sans-serif, system-ui, sans-serif
```

Display type uses `letter-spacing: -0.04em` — emit a `.font-display` utility
that sets family and tracking together. Stretch is `100%`: Space Grotesk has no
`wdth` axis.

| token | size / line-height |
|---|---|
| `--text-3xs` | `0.625rem / 0.875rem` |
| `--text-2xs` | `0.6875rem / 0.875rem` |
| `--text-xs` | `0.75rem / 1rem` |
| `--text-sm` | `0.875rem / 1.25rem` |
| `--text-base` | `1rem / 1.5rem` |
| `--text-lg` | `1.125rem / 1.75rem` |
| `--text-xl` | `1.375rem / 1.875rem` |
| `--text-2xl` | `1.75rem / 2.125rem` |
| `--text-3xl` | `2.25rem / 2.5rem` |
| `--text-4xl` | `3rem / 3.125rem` |

`xl` and above are display sizes: Space Grotesk. `lg` and below are Figtree.

`3xs` and `2xs` are the caption floor. They exist for mobile chrome the reading
scale cannot carry — timeline stamps, seed numbers, avatar initials,
bracket-stage labels. `3xs` is the floor and takes uppercase micro-labels only;
anything read as a sentence starts at `sm`.

## Radius

Unchanged — this is the shared boxing.

```
--radius-sm:   0.375rem   /*  6px */
--radius-md:   0.625rem   /* 10px — default */
--radius-lg:   0.875rem   /* 14px */
--radius-xl:   1.25rem    /* 20px */
--radius-full: 9999px     /* the pill */
```

`sm` through `lg` are the nesting ladder. `xl` is for full-bleed hero surfaces.
`full` is the pill — avatars, count bubbles, status dots — and is never a
nesting step.

## Spacing

Tailwind v4 generates the whole scale from one base, so `--spacing: 0.25rem` is
the source of truth — hand-authoring `--spacing-1`, `--spacing-2` is Tailwind v3
thinking and produces a scale that fights the generated one.

`tokens/dist/root/spacing.css` additionally names the documented integer steps
as `--space-1 … --space-24`. Those are for consumers that read a stylesheet
rather than compile utilities — Claude Design, chiefly — so a layout outside a
utility still lands on the 4px grid. They are derived from `documentedSteps`, so
the file cannot claim a scale this document does not. Half steps get no name: a
custom property cannot carry the dot. Reach for `calc(var(--spacing) * 1.5)`
there.
